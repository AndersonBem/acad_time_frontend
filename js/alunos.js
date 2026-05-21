protegerPagina();

let paginaAtual = 1;
let itensPorPagina = 10;
let totalAlunos = 0;

async function listarAlunos() {
    const container = document.getElementById("lista-alunos");
    const busca = document.getElementById("buscar").value.toLowerCase().trim();
    const filtroStatus = document.getElementById("filtro-status").value;

    const token = localStorage.getItem("access_token");

    const params = new URLSearchParams();

    if (busca) {
        params.set("busca", busca);
    }

    if (filtroStatus) {
        params.set("status", filtroStatus);
    }

    params.set("page", paginaAtual);
    params.set("page_size", itensPorPagina);

    const url = `${CONFIG.BASE_URL.replace(/\/$/, "")}${CONFIG.ENDPOINTS.alunos}?${params.toString()}`;

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(url, {
            method: "GET",
            headers
        });

        const dados = await response.json().catch(() => null);

        if (!response.ok) {
            container.innerHTML = `
                <tr>
                    <td colspan="6">Erro ao carregar alunos.</td>
                </tr>
            `;
            atualizarInfoAlunos(0);
            renderizarPaginacao();
            return;
        }

        const alunos = Array.isArray(dados)
            ? dados
            : dados?.results || [];

        totalAlunos = Array.isArray(dados)
            ? alunos.length
            : dados?.count || 0;

        container.innerHTML = "";

        if (alunos.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6">Nenhum aluno encontrado.</td>
                </tr>
            `;
            atualizarInfoAlunos(0);
            renderizarPaginacao();
            return;
        }

        alunos.forEach((aluno) => {
            const tr = document.createElement("tr");

            const cursosTexto = Array.isArray(aluno.cursos) && aluno.cursos.length
                ? aluno.cursos.map((item) => item.curso).join(", ")
                : "Sem curso";

            const statusTexto = Array.isArray(aluno.cursos) && aluno.cursos.length
                ? aluno.cursos.map((item) => {
                    const status = (item.status || "").toUpperCase();

                    if (status === "ATIVO") return "Ativo";
                    if (status === "TRANCADO") return "Trancado";
                    if (status === "CANCELADO") return "Cancelado";
                    if (status === "CONCLUIDO") return "Concluído";

                    return item.status || "Sem status";
                }).join(", ")
                : "Sem status";

            tr.innerHTML = `
                <td>${aluno.nome ?? "-"}</td>
                <td>${aluno.matricula ?? "-"}</td>
                <td>${aluno.total_horas ?? aluno.totalHoras ?? "0.00"}h</td>
                <td>${statusTexto}</td>
                <td>${cursosTexto}</td>
                <td>
                    <button class="btn-editar" onclick="editarAluno(${aluno.id})">Editar</button>
                </td>
            `;

            container.appendChild(tr);
        });

        atualizarInfoAlunos(alunos.length);
        renderizarPaginacao();

    } catch (error) {
        container.innerHTML = `
            <tr>
                <td colspan="6">Não foi possível conectar ao servidor.</td>
            </tr>
        `;
        atualizarInfoAlunos(0);
        renderizarPaginacao();
    }
}

function atualizarInfoAlunos(quantidadePagina) {
    const info = document.getElementById("info-alunos");

    if (!info) return;

    info.textContent = `Mostrando ${quantidadePagina} de ${totalAlunos} alunos`;
}

function renderizarPaginacao() {
    const container = document.getElementById("paginacao-alunos");

    if (!container) return;

    const totalPaginas = Math.max(1, Math.ceil(totalAlunos / itensPorPagina));

    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    container.innerHTML = "";

    const btnAnterior = document.createElement("button");
    btnAnterior.type = "button";
    btnAnterior.textContent = "<";
    btnAnterior.disabled = paginaAtual === 1;
    btnAnterior.onclick = () => {
        paginaAtual--;
        listarAlunos();
    };
    container.appendChild(btnAnterior);

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = i;

        if (i === paginaAtual) {
            btn.classList.add("ativo");
        }

        btn.onclick = () => {
            paginaAtual = i;
            listarAlunos();
        };

        container.appendChild(btn);
    }

    const btnProximo = document.createElement("button");
    btnProximo.type = "button";
    btnProximo.textContent = ">";
    btnProximo.disabled = paginaAtual === totalPaginas;
    btnProximo.onclick = () => {
        paginaAtual++;
        listarAlunos();
    };
    container.appendChild(btnProximo);
}

function editarAluno(id) {
    window.location.href = `cadastrarAluno.html?id=${id}`;
}

document.getElementById("buscar").addEventListener("input", () => {
    paginaAtual = 1;
    listarAlunos();
});

document.getElementById("filtro-status").addEventListener("change", () => {
    paginaAtual = 1;
    listarAlunos();
});

document.getElementById("itens-pagina-alunos").addEventListener("change", (event) => {
    itensPorPagina = Number(event.target.value);
    paginaAtual = 1;
    listarAlunos();
});

listarAlunos();

function logout() {
    localStorage.removeItem("access_token");
    sessionStorage.clear();
    window.location.href = "login.html";
}

function toggleMenu() {
    document.querySelector(".sidebar").classList.toggle("active");
}