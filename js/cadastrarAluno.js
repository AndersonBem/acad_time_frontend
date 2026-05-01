protegerPagina();
const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");
const token = localStorage.getItem("access_token");

let cursosDisponiveis = [];
let inscricoesAtuais = [];

function getAlunoId() {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
}

function mapearStatusParaId(status) {
	const statusUpper = (status || "").toUpperCase();

	if (statusUpper === "ATIVO") return 1;
	if (statusUpper === "TRANCADO") return 2;
	if (statusUpper === "CANCELADO") return 3;
	if (statusUpper === "CONCLUIDO") return 4;

	return null;
}

function criarLinhaCursoAluno(
	valorCurso = "",
	valorStatus = "ATIVO",
	primeiraLinha = false,
	inscricaoId = null,
) {
	const div = document.createElement("div");
	div.className = "linha-curso-aluno";

	if (inscricaoId) {
		div.dataset.inscricaoId = inscricaoId;
	}

	const selectCurso = document.createElement("select");
	selectCurso.className = "curso-select";
	selectCurso.innerHTML = `<option value="">Selecione um curso</option>`;

	cursosDisponiveis
		.filter((curso) => curso.status === true)
		.forEach((curso) => {
			const option = document.createElement("option");
			option.value = curso.id_curso || curso.id;
			option.textContent = curso.nome;

			if (String(option.value) === String(valorCurso)) {
				option.selected = true;
			}

			selectCurso.appendChild(option);
		});

	const selectStatus = document.createElement("select");
	selectStatus.className = "status-select";
	selectStatus.innerHTML = `
    <option value="ATIVO">Ativo</option>
    <option value="TRANCADO">Trancado</option>
    <option value="CANCELADO">Cancelado</option>
    <option value="CONCLUIDO">Concluído</option>
  `;
	selectStatus.value = (valorStatus || "ATIVO").toUpperCase();

	div.appendChild(selectCurso);
	div.appendChild(selectStatus);

	if (primeiraLinha) {
		const btnAdd = document.createElement("button");
		btnAdd.type = "button";
		btnAdd.className = "btn-add-curso";
		btnAdd.textContent = "+";
		btnAdd.onclick = adicionarCampoCursoAluno;
		div.appendChild(btnAdd);
	} else {
		const btnRemover = document.createElement("button");
		btnRemover.type = "button";
		btnRemover.className = "btn-remover-curso";
		btnRemover.textContent = "-";
		btnRemover.onclick = () => removerLinhaCursoAluno(div);
		div.appendChild(btnRemover);
	}

	return div;
}

function adicionarCampoCursoAluno() {
	const container = document.getElementById("lista-cursos-aluno");
	container.appendChild(criarLinhaCursoAluno());
}

function removerLinhaCursoAluno(div) {
	div.remove();
}

async function carregarCursos() {
	const response = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.curso}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const mensagem = await obterMensagemErro(response, "Erro ao carregar cursos.");
		console.error(mensagem);
		mostrarErro(mensagem);
		return;
	}

	cursosDisponiveis = await response.json();

	const container = document.getElementById("lista-cursos-aluno");
	container.innerHTML = "";
	container.appendChild(criarLinhaCursoAluno("", "ATIVO", true));
}

async function buscarInscricoesAluno(matriculaAluno) {
	const response = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.inscricao}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const mensagem = await obterMensagemErro(response, "Erro ao buscar inscrições.");
		console.error(mensagem);
		return [];
	}

	const inscricoes = await response.json();

	return inscricoes.filter(
		(inscricao) =>
			String(inscricao.numero_matricula || "").trim() ===
			String(matriculaAluno || "").trim(),
	);
}

async function carregarAluno() {
	const id = getAlunoId();
	if (!id) return;

	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.alunos}${id}/`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) {
		const mensagem = await obterMensagemErro(response, "Erro ao carregar aluno.");
		console.error(mensagem);
		mostrarErro(mensagem);
		return;
	}

	const aluno = await response.json();

	document.getElementById("nome").value = aluno.nome || "";
	document.getElementById("email").value = aluno.email || "";
	document.getElementById("matricula").value = aluno.matricula || "";

	const container = document.getElementById("lista-cursos-aluno");
	container.innerHTML = "";

	inscricoesAtuais = await buscarInscricoesAluno(aluno.matricula);

	if (Array.isArray(inscricoesAtuais) && inscricoesAtuais.length > 0) {
		inscricoesAtuais.forEach((inscricao, index) => {
			const nomeCurso = inscricao.nome_curso || "";
			const cursoEncontrado = cursosDisponiveis.find(
				(curso) =>
					(curso.nome || "").trim().toLowerCase() ===
					String(nomeCurso).trim().toLowerCase(),
			);

			const idCurso = cursoEncontrado
				? cursoEncontrado.id_curso || cursoEncontrado.id
				: "";

			const status = inscricao.status_matricula || "ATIVO";
			const idInscricao = inscricao.id_inscricao || inscricao.id;

			container.appendChild(
				criarLinhaCursoAluno(idCurso, status, index === 0, idInscricao),
			);
		});
	} else {
		container.appendChild(criarLinhaCursoAluno("", "ATIVO", true));
	}
}

async function salvarAluno() {
	const id = getAlunoId();

	const nome = document.getElementById("nome").value.trim();
	const email = document.getElementById("email").value.trim();
	const matricula = document.getElementById("matricula").value.trim();
	const senha = document.getElementById("senha").value.trim();

	const payloadAluno = {
		nome,
		email,
		matricula,
	};

	if (!id || senha !== "") {
		payloadAluno.senha = senha;
	}

	const urlAluno = id
		? `${API_BASE_URL}${CONFIG.ENDPOINTS.alunos}${id}/`
		: `${API_BASE_URL}${CONFIG.ENDPOINTS.alunos}`;

	const methodAluno = id ? "PATCH" : "POST";

	const responseAluno = await fetch(urlAluno, {
		method: methodAluno,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(payloadAluno),
	});

	if (!responseAluno.ok) {
		const mensagem = await obterMensagemErro(responseAluno, "Erro ao salvar aluno.");
		console.error(mensagem);
		mostrarErro(mensagem);
		return;
	}

	const alunoSalvo = await responseAluno.json().catch(() => null);
	const alunoId = id || alunoSalvo?.id;

	if (!alunoId) {
		mostrarErro("Aluno salvo, mas não foi possível identificar o ID.");
		return;
	}

	const linhas = Array.from(document.querySelectorAll(".linha-curso-aluno"))
		.map((linha) => {
			const curso = linha.querySelector(".curso-select")?.value;
			const status = linha.querySelector(".status-select")?.value;
			const inscricaoId = linha.dataset.inscricaoId || null;

			return {
				curso: curso ? Number(curso) : null,
				status,
				inscricaoId,
			};
		})
		.filter((item) => item.curso);

	const cursosUnicos = new Set();

	for (const linha of linhas) {
		if (cursosUnicos.has(linha.curso)) {
			mostrarErro("Não é permitido repetir o mesmo curso para o aluno.");
			return;
		}
		cursosUnicos.add(linha.curso);
	}

	for (const linha of linhas) {
		const statusMatriculaId = mapearStatusParaId(linha.status);

		if (!statusMatriculaId) {
			mostrarErro("Selecione um status válido.");
			return;
		}

		if (linha.inscricaoId) {
			const responsePatch = await fetch(
				`${API_BASE_URL}${CONFIG.ENDPOINTS.inscricao}${linha.inscricaoId}/`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						status_matricula: statusMatriculaId,
					}),
				},
			);

			if (!responsePatch.ok) {
				const mensagem = await obterMensagemErro(
					responsePatch,
					"Erro ao atualizar inscrição.",
				);
				console.error(mensagem);
				mostrarErro(mensagem);
				return;
			}
		} else {
			const responsePost = await fetch(
				`${API_BASE_URL}${CONFIG.ENDPOINTS.inscricao}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						aluno: Number(alunoId),
						curso: linha.curso,
						status_matricula: statusMatriculaId,
					}),
				},
			);

			if (!responsePost.ok) {
				const mensagem = await obterMensagemErro(
					responsePost,
					"Erro ao vincular curso ao aluno.",
				);
				console.error(mensagem);
				mostrarErro(mensagem);
				return;
			}
		}
	}

	mostrarSucesso("Aluno salvo com sucesso!");
	window.location.href = "alunos.html";
}

async function iniciarTelaAluno() {
	await carregarCursos();
	await carregarAluno();
}

iniciarTelaAluno();

function logout() {
	localStorage.removeItem("access_token");
	sessionStorage.clear();
	window.location.href = "login.html";
}

function toggleMenu() {
	document.querySelector(".sidebar").classList.toggle("active");
}