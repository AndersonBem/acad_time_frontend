protegerPagina();
const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");
const token = localStorage.getItem("access_token");

let cursosDisponiveis = [];

function formatarNomeCampo(campo) {
	const nomes = {
		nome: "Nome",
		email: "E-mail",
		senha: "Senha",
		status: "Status",
		curso: "Curso",
		coordenador: "Coordenador",
		data_inicio: "Data de início",
		data_fim: "Data de fim",
	};

	return (
		nomes[campo] ||
		campo
			.replaceAll("_", " ")
			.replace(/\b\w/g, (letra) => letra.toUpperCase())
	);
}

async function extrairMensagemErro(response, mensagemPadrao) {
	try {
		const data = await response.json();

		if (typeof data === "string") {
			return data;
		}

		const mensagemDireta =
			data.message ||
			data.msg ||
			data.erro ||
			data.error ||
			data.detail ||
			data.details;

		if (mensagemDireta) {
			return mensagemDireta;
		}

		if (typeof data === "object" && data !== null) {
			const mensagensPorCampo = Object.entries(data)
				.map(([campo, mensagens]) => {
					const nomeCampo = formatarNomeCampo(campo);

					if (Array.isArray(mensagens)) {
						return `${nomeCampo}: ${mensagens.join(" ")}`;
					}

					if (typeof mensagens === "object" && mensagens !== null) {
						return `${nomeCampo}: ${Object.values(mensagens)
							.flat()
							.join(" ")}`;
					}

					return `${nomeCampo}: ${mensagens}`;
				})
				.join("\n");

			return mensagensPorCampo || mensagemPadrao;
		}

		return mensagemPadrao;
	} catch (error) {
		return mensagemPadrao;
	}
}

function getCoordenadorId() {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
}

function hojeISO() {
	return new Date().toISOString().split("T")[0];
}

function formatarDataBR(data) {
	if (!data) return "-";

	const partes = String(data).split("-");
	if (partes.length !== 3) return data;

	return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterIdCurso(valor) {
	if (valor === null || valor === undefined) return null;

	if (!isNaN(Number(valor))) {
		return Number(valor);
	}

	const cursoEncontrado = cursosDisponiveis.find(
		(curso) =>
			(curso.nome || "").trim().toLowerCase() ===
			String(valor).trim().toLowerCase(),
	);

	return cursoEncontrado
		? Number(cursoEncontrado.id_curso || cursoEncontrado.id)
		: null;
}

function obterNomeCurso(vinculo) {
	const idCurso = obterIdCurso(
		vinculo.curso ||
			vinculo.curso_id ||
			vinculo.id_curso ||
			vinculo.cursoId ||
			vinculo.nome_curso,
	);

	const curso = cursosDisponiveis.find(
		(curso) => Number(curso.id_curso || curso.id) === Number(idCurso),
	);

	return (
		vinculo.nome_curso ||
		vinculo.curso_nome ||
		curso?.nome ||
		"Curso não identificado"
	);
}

function obterIdVinculo(vinculo) {
	return (
		vinculo.id_coordenacao_curso ||
		vinculo.id ||
		vinculo.id_coordenacao ||
		vinculo.idCoordenacao ||
		vinculo.pk ||
		null
	);
}

function criarLinhaHistoricoCurso(vinculo) {
	const div = document.createElement("div");
	div.className = "linha-historico-curso";

	div.innerHTML = `
		<div>${obterNomeCurso(vinculo)}</div>
		<div>${formatarDataBR(vinculo.data_inicio)}</div>
		<div>${formatarDataBR(vinculo.data_fim)}</div>
		<div><span class="status-curso-inativo">Inativo</span></div>
	`;

	return div;
}

function renderizarHistoricoCursos(vinculosInativos) {
	const historicoContainer = document.getElementById(
		"historico-cursos-coordenador",
	);

	if (!historicoContainer) return;

	historicoContainer.innerHTML = "";

	if (!Array.isArray(vinculosInativos) || vinculosInativos.length === 0) {
		historicoContainer.innerHTML = `
			<p class="texto-sem-historico">Nenhum curso inativo no histórico.</p>
		`;
		return;
	}

	vinculosInativos.forEach((vinculo) => {
		historicoContainer.appendChild(criarLinhaHistoricoCurso(vinculo));
	});
}

function criarLinhaCurso(
	valorSelecionado = "",
	primeiraLinha = false,
	vinculoId = null,
	dataInicio = "",
	dataFim = "",
) {
	const div = document.createElement("div");
	div.className = "linha-curso";

	if (vinculoId) {
		div.dataset.vinculoId = vinculoId;
	}

	const select = document.createElement("select");
	select.className = "curso-select";
	select.innerHTML = `<option value="">Selecione um curso</option>`;

	cursosDisponiveis
		.filter((curso) => curso.status === true)
		.forEach((curso) => {
			const option = document.createElement("option");
			option.value = curso.id_curso || curso.id;
			option.textContent = curso.nome;

			if (String(option.value) === String(valorSelecionado)) {
				option.selected = true;
			}

			select.appendChild(option);
		});

	const inputInicio = document.createElement("input");
	inputInicio.type = "date";
	inputInicio.className = "data-inicio";
	inputInicio.value = dataInicio || hojeISO();
	inputInicio.readOnly = true;

	const inputFim = document.createElement("input");
	inputFim.type = "date";
	inputFim.className = "data-fim";
	inputFim.value = dataFim || "";

	div.appendChild(select);
	div.appendChild(inputInicio);
	div.appendChild(inputFim);

	if (primeiraLinha) {
		const btnAdd = document.createElement("button");
		btnAdd.type = "button";
		btnAdd.className = "btn-add-curso";
		btnAdd.textContent = "+";
		btnAdd.onclick = adicionarCampoCurso;
		div.appendChild(btnAdd);
	} else {
		const btnRemover = document.createElement("button");
		btnRemover.type = "button";
		btnRemover.className = "btn-remover-curso";
		btnRemover.textContent = "-";
		btnRemover.onclick = () => removerLinhaCurso(div);
		div.appendChild(btnRemover);
	}

	return div;
}

function removerLinhaCurso(div) {
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
		const mensagem = await extrairMensagemErro(
			response,
			"Erro ao carregar cursos.",
		);
		console.error("Erro ao carregar cursos:", mensagem);
		alert(mensagem);
		return;
	}

	cursosDisponiveis = await response.json();

	const container = document.getElementById("lista-cursos-coordenador");
	container.innerHTML = "";
	container.appendChild(criarLinhaCurso("", true));
}

function adicionarCampoCurso() {
	const container = document.getElementById("lista-cursos-coordenador");
	container.appendChild(criarLinhaCurso());
}

async function carregarCoordenador() {
	const id = getCoordenadorId();
	if (!id) return;

	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenadores}${id}/`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) {
		const mensagem = await extrairMensagemErro(
			response,
			"Erro ao carregar coordenador.",
		);
		console.error("Erro ao carregar coordenador:", mensagem);
		alert(mensagem);
		return;
	}

	const coordenador = await response.json();

	document.getElementById("nome").value = coordenador.nome || "";
	document.getElementById("email").value = coordenador.email || "";

	if (
		coordenador.status === true ||
		coordenador.status === "ATIVO" ||
		coordenador.status === "Ativo"
	) {
		document.getElementById("ativo").checked = true;
	} else {
		document.getElementById("inativo").checked = true;
	}

	const container = document.getElementById("lista-cursos-coordenador");
	container.innerHTML = "";

	const vinculos = await buscarVinculosCoordenador(id);
	const vinculosAtivos = vinculos.filter((vinculo) => !vinculo.data_fim);
	const vinculosInativos = vinculos.filter((vinculo) => vinculo.data_fim);

	renderizarHistoricoCursos(vinculosInativos);

	if (Array.isArray(vinculosAtivos) && vinculosAtivos.length > 0) {
		vinculosAtivos.forEach((vinculo, index) => {
			const idCurso = obterIdCurso(
				vinculo.curso ||
					vinculo.curso_id ||
					vinculo.id_curso ||
					vinculo.cursoId ||
					vinculo.nome_curso,
			);

			const idVinculo = obterIdVinculo(vinculo);

			container.appendChild(
				criarLinhaCurso(
					idCurso || "",
					index === 0,
					idVinculo,
					vinculo.data_inicio || hojeISO(),
					vinculo.data_fim || "",
				),
			);
		});
	} else {
		container.appendChild(criarLinhaCurso("", true));
	}
}

async function buscarVinculosCoordenador(coordenadorId) {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenacaoCurso}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) {
		const mensagem = await extrairMensagemErro(
			response,
			"Erro ao buscar vínculos do coordenador.",
		);
		console.error("Erro ao buscar vínculos do coordenador:", mensagem);
		alert(mensagem);
		return [];
	}

	const vinculos = await response.json();

	return vinculos.filter((vinculo) => {
		const idCoordenador =
			vinculo.coordenador ||
			vinculo.coordenador_id ||
			vinculo.id_coordenador ||
			vinculo.coordenadorId;

		return Number(idCoordenador) === Number(coordenadorId);
	});
}

async function encerrarVinculo(vinculoId, dataFim) {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenacaoCurso}${vinculoId}/`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				data_fim: dataFim,
			}),
		},
	);

	if (!response.ok) {
		const mensagem = await extrairMensagemErro(
			response,
			"Erro ao encerrar vínculo de curso.",
		);
		console.error("Erro ao encerrar vínculo de curso:", mensagem);
		alert(mensagem);
		return false;
	}

	return true;
}

async function criarVinculo(coordenadorId, cursoId) {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenacaoCurso}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				coordenador: Number(coordenadorId),
				curso: Number(cursoId),
			}),
		},
	);

	if (!response.ok) {
		const mensagem = await extrairMensagemErro(
			response,
			"Erro ao salvar vínculo coordenador-curso.",
		);
		console.error("Erro ao salvar vínculo coordenador-curso:", mensagem);
		alert(mensagem);
		return false;
	}

	return true;
}

async function salvarVinculosCursos(coordenadorId) {
	const linhas = Array.from(document.querySelectorAll(".linha-curso"))
		.map((linha) => {
			const select = linha.querySelector(".curso-select");
			const dataInicio = linha.querySelector(".data-inicio");
			const dataFim = linha.querySelector(".data-fim");

			return {
				vinculoId: linha.dataset.vinculoId
					? Number(linha.dataset.vinculoId)
					: null,
				cursoId: select && select.value ? Number(select.value) : null,
				dataInicio: dataInicio ? dataInicio.value : "",
				dataFim: dataFim ? dataFim.value : "",
			};
		})
		.filter((item) => item.cursoId);

	const vinculosAtuais = await buscarVinculosCoordenador(coordenadorId);
	const vinculosAtivos = vinculosAtuais.filter((vinculo) => !vinculo.data_fim);

	const cursosTela = [
		...new Set(linhas.map((linha) => Number(linha.cursoId)).filter(Boolean)),
	];

	for (const vinculo of vinculosAtivos) {
		const idVinculo = obterIdVinculo(vinculo);
		const idCurso = obterIdCurso(
			vinculo.curso ||
				vinculo.curso_id ||
				vinculo.id_curso ||
				vinculo.cursoId ||
				vinculo.nome_curso,
		);

		if (!idVinculo || !idCurso) continue;

		const linhaCorrespondente = linhas.find(
			(linha) => Number(linha.vinculoId) === Number(idVinculo),
		);

		if (!linhaCorrespondente) {
			const sucesso = await encerrarVinculo(idVinculo, hojeISO());
			if (!sucesso) {
				return false;
			}
			continue;
		}

		if (linhaCorrespondente.dataFim && !vinculo.data_fim) {
			const sucesso = await encerrarVinculo(
				idVinculo,
				linhaCorrespondente.dataFim,
			);
			if (!sucesso) {
				return false;
			}
		}
	}

	const cursosAtivosAtuais = vinculosAtivos
		.map((vinculo) =>
			obterIdCurso(
				vinculo.curso ||
					vinculo.curso_id ||
					vinculo.id_curso ||
					vinculo.cursoId ||
					vinculo.nome_curso,
			),
		)
		.filter((id) => id !== null);

	const cursosNovos = cursosTela.filter(
		(cursoId) => !cursosAtivosAtuais.includes(Number(cursoId)),
	);

	for (const cursoId of cursosNovos) {
		const sucesso = await criarVinculo(coordenadorId, cursoId);
		if (!sucesso) {
			return false;
		}
	}

	return true;
}

async function salvarCoordenador() {
	const id = getCoordenadorId();

	const nome = document.getElementById("nome").value.trim();
	const email = document.getElementById("email").value.trim();
	const senha = document.getElementById("senha").value.trim();
	const statusSelecionado = document.querySelector(
		'input[name="status"]:checked',
	)?.value;

	const payload = {
		nome,
		email,
		status: statusSelecionado === "ativo",
	};

	if (!id || senha !== "") {
		payload.senha = senha;
	}

	const url = id
		? `${API_BASE_URL}${CONFIG.ENDPOINTS.coordenadores}${id}/`
		: `${API_BASE_URL}${CONFIG.ENDPOINTS.coordenadores}`;

	const method = id ? "PATCH" : "POST";

	try {
		const response = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const mensagem = await extrairMensagemErro(
				response,
				"Erro ao salvar coordenador.",
			);
			console.error("Erro ao salvar coordenador:", mensagem);
			alert(mensagem);
			return;
		}

		const coordenadorSalvo = await response.json().catch(() => null);
		const coordenadorId =
			id || coordenadorSalvo?.id || coordenadorSalvo?.id_coordenador;

		if (!coordenadorId) {
			alert(
				"Coordenador salvo, mas não foi possível identificar o ID para vincular os cursos.",
			);
			return;
		}

		const sucessoCursos = await salvarVinculosCursos(coordenadorId);

		if (!sucessoCursos) {
			return;
		}

		alert(
			coordenadorSalvo?.message ||
				coordenadorSalvo?.msg ||
				"Coordenador salvo com sucesso!",
		);

		window.location.href = "coordenadores.html";
	} catch (error) {
		console.error("Erro ao salvar coordenador:", error);
		alert(error.message || "Erro ao salvar coordenador.");
	}
}

async function iniciarTelaCoordenador() {
	await carregarCursos();
	await carregarCoordenador();
}

iniciarTelaCoordenador();

function logout() {
	localStorage.removeItem("access_token");
	sessionStorage.clear();
	window.location.href = "login.html";
}

function toggleMenu() {
	document.querySelector(".sidebar").classList.toggle("active");
}