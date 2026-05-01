protegerPagina();
const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");
const token = localStorage.getItem("access_token");

let submissoesCarregadas = [];
let cursosCarregados = [];
let statusCarregados = [];

let paginaAtual = 1;
let itensPorPagina = 5;

function normalizarTexto(texto) {
	return String(texto || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
}

function formatarData(data) {
	if (!data) return "-";

	const d = new Date(data);

	if (isNaN(d.getTime())) return data;

	return d.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
	if (!data) return "-";

	const d = new Date(data);

	if (isNaN(d.getTime())) return data;

	return d.toLocaleString("pt-BR");
}

function obterClasseStatus(status) {
	const valor = normalizarTexto(status);

	if (valor.includes("aprov")) return "aprovado";
	if (valor.includes("reprov") || valor.includes("reje")) return "reprovado";
	if (valor.includes("correc")) return "correcao";
	if (valor.includes("analise")) return "em-analise";

	return "enviado";
}

function obterTextoBotao(status) {
	const valor = normalizarTexto(status);

	if (
		valor.includes("aprov") ||
		valor.includes("reprov") ||
		valor.includes("reje")
	) {
		return "Ver análise";
	}

	return "Analisar";
}


function carregarCursos() {
	const nomesCursos = [
		...new Set(
			submissoesCarregadas
				.map((item) => item.curso_nome)
				.filter(Boolean)
		),
	];

	cursosCarregados = nomesCursos.map((nome) => ({ nome }));
}

async function carregarStatus() {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.statusSubmissao}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) throw new Error("Erro ao carregar status.");

	statusCarregados = await response.json();
}



async function carregarSubmissoes() {
	const response = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.submissao}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) throw new Error("Erro ao carregar submissões.");

	submissoesCarregadas = await response.json();
}

function preencherFiltroCursos() {
	const select = document.getElementById("filtroCurso");
	const atual = select.value;

	select.innerHTML = `<option value="">Todos os cursos</option>`;

	cursosCarregados
		.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
		.forEach((curso) => {
			const option = document.createElement("option");
			option.value = curso.nome;
			option.textContent = curso.nome;
			select.appendChild(option);
		});

	select.value = atual;
}

function preencherFiltroStatus() {
	const select = document.getElementById("filtroStatus");
	const atual = select.value;

	select.innerHTML = `<option value="">Todos os status</option>`;

	statusCarregados
		.sort((a, b) =>
			(a.nome_status || "").localeCompare(b.nome_status || "", "pt-BR"),
		)
		.forEach((status) => {
			const option = document.createElement("option");
			option.value = status.nome_status;
			option.textContent = status.nome_status;
			select.appendChild(option);
		});

	select.value = atual;
}

function preencherFiltroCategoria() {
	const select = document.getElementById("filtroCategoria");
	const atual = select.value;

	const categorias = [
		...new Set(
			submissoesCarregadas
				.map((item) => item.atividade_categoria)
				.filter(Boolean),
		),
	];

	select.innerHTML = `<option value="">Todas as categorias</option>`;

	categorias
		.sort((a, b) => a.localeCompare(b, "pt-BR"))
		.forEach((cat) => {
			const option = document.createElement("option");
			option.value = cat;
			option.textContent = cat;
			select.appendChild(option);
		});

	select.value = atual;
}

function obterFiltrados() {
	const busca = normalizarTexto(document.getElementById("buscarAluno").value);
	const curso = document.getElementById("filtroCurso").value;
	const status = document.getElementById("filtroStatus").value;
	const categoria = document.getElementById("filtroCategoria").value;

	return submissoesCarregadas.filter((item) => {
		const aluno = item.aluno_nome || "";
		const cursoNome = item.curso_nome || "";
		const statusNome = item.status_submissao_nome || "";

		const categoriaNome = item.atividade_categoria || "";

		const matchBusca = !busca || normalizarTexto(aluno).includes(busca);

		const matchCurso = !curso || cursoNome === curso;

		const matchStatus = !status || statusNome === status;

		const matchCategoria = !categoria || categoriaNome === categoria;

		return matchBusca && matchCurso && matchStatus && matchCategoria;
	});
}

function renderizarTabela() {
	const tbody = document.getElementById("lista-submissoes");
	const info = document.getElementById("infoTabela");

	const lista = obterFiltrados();

	const inicio = (paginaAtual - 1) * itensPorPagina;
	const fim = inicio + itensPorPagina;

	const pagina = lista.slice(inicio, fim);

	tbody.innerHTML = "";

	if (pagina.length === 0) {
		tbody.innerHTML = `
      <tr>
        <td colspan="7">Nenhuma submissão encontrada.</td>
      </tr>
    `;
	}

	pagina.forEach((item) => {
		const categoria = item.atividade_categoria || "-";
		const carga = item.carga_horaria_solicitada || "-"

		const statusNome = item.status_submissao_nome || "-";
		const classe = obterClasseStatus(statusNome);
		const textoBotao = obterTextoBotao(statusNome);

		const tr = document.createElement("tr");

		tr.innerHTML = `
      <td>
        <strong>${item.aluno_nome || "-"}</strong>
      </td>
      <td>${item.curso_nome || "-"}</td>
      <td>${categoria}</td>
      <td>${carga}h</td>
      <td>${formatarData(item.data_envio)}</td>
      <td><span class="status-badge ${classe}">${statusNome}</span></td>
      <td>
        <a href="analiseCertificados.html?id=${item.id_submissao}" class="btn-acao analisar">
          ${textoBotao}
        </a>
      </td>
    `;

		tbody.appendChild(tr);
	});

	info.textContent = `Mostrando ${pagina.length} de ${lista.length} submissões`;

	renderizarPaginacao(lista.length);
}

function renderizarPaginacao(totalItens) {
	const container = document.getElementById("paginacao");

	const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));

	if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

	container.innerHTML = "";

	const btnAnterior = document.createElement("button");
	btnAnterior.textContent = "<";
	btnAnterior.disabled = paginaAtual === 1;
	btnAnterior.onclick = () => {
		paginaAtual--;
		renderizarTabela();
	};
	container.appendChild(btnAnterior);

	for (let i = 1; i <= totalPaginas; i++) {
		const btn = document.createElement("button");
		btn.textContent = i;

		if (i === paginaAtual) {
			btn.classList.add("ativo");
		}

		btn.onclick = () => {
			paginaAtual = i;
			renderizarTabela();
		};

		container.appendChild(btn);
	}

	const btnProximo = document.createElement("button");
	btnProximo.textContent = ">";
	btnProximo.disabled = paginaAtual === totalPaginas;
	btnProximo.onclick = () => {
		paginaAtual++;
		renderizarTabela();
	};
	container.appendChild(btnProximo);
}

function configurarEventos() {
	document.getElementById("buscarAluno").addEventListener("input", () => {
		paginaAtual = 1;
		renderizarTabela();
	});

	document.getElementById("filtroCurso").addEventListener("change", () => {
		paginaAtual = 1;
		renderizarTabela();
	});

	document.getElementById("filtroStatus").addEventListener("change", () => {
		paginaAtual = 1;
		renderizarTabela();
	});

	document.getElementById("filtroCategoria").addEventListener("change", () => {
		paginaAtual = 1;
		renderizarTabela();
	});

	document.getElementById("itensPagina").addEventListener("change", (e) => {
		itensPorPagina = Number(e.target.value);
		paginaAtual = 1;
		renderizarTabela();
	});

	document.getElementById("btnLimparFiltros").addEventListener("click", () => {
		document.getElementById("buscarAluno").value = "";
		document.getElementById("filtroCurso").value = "";
		document.getElementById("filtroStatus").value = "";
		document.getElementById("filtroCategoria").value = "";
		paginaAtual = 1;
		renderizarTabela();
	});
}

async function iniciarTela() {
	try {
		await Promise.all([
			carregarStatus(),
			carregarSubmissoes(),
		]);

		carregarCursos();

		preencherFiltroCursos();
		preencherFiltroStatus();
		preencherFiltroCategoria();

		configurarEventos();
		renderizarTabela();
	} catch (error) {
		console.error(error);

		document.getElementById("lista-submissoes").innerHTML = `
      <tr>
        <td colspan="7">Erro ao carregar dados.</td>
      </tr>
    `;
	}
}

iniciarTela();

function logout() {
	// Limpar dados de sessão
	localStorage.removeItem("access_token");
	sessionStorage.clear();

	// Redirecionar para a página de login
	window.location.href = "login.html";
}

function toggleMenu() {
	document.querySelector(".sidebar").classList.toggle("active");
}
