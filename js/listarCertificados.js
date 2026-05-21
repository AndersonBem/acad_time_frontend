protegerPagina();
const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");
const token = localStorage.getItem("access_token");

let submissoesCarregadas = [];
let cursosCarregados = [];
let statusCarregados = [];
let categoriasCarregadas = [];

let paginaAtual = 1;
let itensPorPagina = 5;
let totalSubmissoes = 0;

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


async function carregarCursos() {
    const response = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.curso}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) throw new Error("Erro ao carregar cursos.");

    const dados = await response.json();
    cursosCarregados = Array.isArray(dados) ? dados : dados.results || [];
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
    const busca = document.getElementById("buscarAluno").value.trim();
    const curso = document.getElementById("filtroCurso").value;
    const status = document.getElementById("filtroStatus").value;
    const categoria = document.getElementById("filtroCategoria").value;

    const params = new URLSearchParams();

    if (busca) params.set("busca", busca);
    if (curso) params.set("curso", curso);
    if (status) params.set("status", status);
    if (categoria) params.set("categoria", categoria);

    params.set("page", paginaAtual);
    params.set("page_size", itensPorPagina);

    const response = await fetch(
        `${API_BASE_URL}${CONFIG.ENDPOINTS.submissao}?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) throw new Error("Erro ao carregar submissões.");

    const dados = await response.json();

    submissoesCarregadas = Array.isArray(dados)
        ? dados
        : dados.results || [];

    totalSubmissoes = Array.isArray(dados)
        ? submissoesCarregadas.length
        : dados.count || 0;
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

async function carregarCategorias() {
    const response = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.tipoAtividade}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) throw new Error("Erro ao carregar categorias.");

    const dados = await response.json();
    categoriasCarregadas = Array.isArray(dados) ? dados : dados.results || [];
}

function preencherFiltroCategoria() {
    const select = document.getElementById("filtroCategoria");
    const atual = select.value;

    select.innerHTML = `<option value="">Todas as categorias</option>`;

    categoriasCarregadas
        .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
        .forEach((categoria) => {
            const option = document.createElement("option");
            option.value = categoria.nome;
            option.textContent = categoria.nome;
            select.appendChild(option);
        });

    select.value = atual;
}


function renderizarTabela() {
	const tbody = document.getElementById("lista-submissoes");
	const info = document.getElementById("infoTabela");

	const lista = submissoesCarregadas;

	tbody.innerHTML = "";

	if (lista.length === 0) {
		tbody.innerHTML = `
      <tr>
        <td colspan="7">Nenhuma submissão encontrada.</td>
      </tr>
    `;
	}

	lista.forEach((item) => {
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

	info.textContent = `Mostrando ${lista.length} de ${totalSubmissoes} submissões`;

	renderizarPaginacao(totalSubmissoes);
}

async function atualizarLista() {
    try {
        await carregarSubmissoes();
        renderizarTabela();
    } catch (error) {
        console.error(error);

        submissoesCarregadas = [];
        totalSubmissoes = 0;

        document.getElementById("lista-submissoes").innerHTML = `
            <tr>
                <td colspan="7">Erro ao carregar submissões.</td>
            </tr>
        `;

        const info = document.getElementById("infoTabela");
        if (info) {
            info.textContent = "Mostrando 0 de 0 submissões";
        }

        renderizarPaginacao(0);
    }
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
		atualizarLista();
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
			atualizarLista();
		};

		container.appendChild(btn);
	}

	const btnProximo = document.createElement("button");
	btnProximo.textContent = ">";
	btnProximo.disabled = paginaAtual === totalPaginas;
	btnProximo.onclick = () => {
		paginaAtual++;
		atualizarLista();
	};
	container.appendChild(btnProximo);
}

function configurarEventos() {
	document.getElementById("buscarAluno").addEventListener("input", () => {
		paginaAtual = 1;
		atualizarLista();
	});

	document.getElementById("filtroCurso").addEventListener("change", () => {
		paginaAtual = 1;
		atualizarLista();
	});

	document.getElementById("filtroStatus").addEventListener("change", () => {
		paginaAtual = 1;
		atualizarLista();
	});

	document.getElementById("filtroCategoria").addEventListener("change", () => {
		paginaAtual = 1;
		atualizarLista();
	});

	document.getElementById("itensPagina").addEventListener("change", (e) => {
		itensPorPagina = Number(e.target.value);
		paginaAtual = 1;
		atualizarLista();
	});

	document.getElementById("btnLimparFiltros").addEventListener("click", () => {
		document.getElementById("buscarAluno").value = "";
		document.getElementById("filtroCurso").value = "";
		document.getElementById("filtroStatus").value = "";
		document.getElementById("filtroCategoria").value = "";
		paginaAtual = 1;
		atualizarLista();
	});
}

async function iniciarTela() {
	try {
		await Promise.all([
			carregarStatus(),
			carregarCursos(),
			carregarCategorias(),
		]);

		preencherFiltroCursos();
		preencherFiltroStatus();
		preencherFiltroCategoria();

		configurarEventos();
		await atualizarLista();
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
