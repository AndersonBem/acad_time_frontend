protegerPagina();
async function listarAlunos() {
    const container = document.getElementById("lista-alunos");
    const busca = document.getElementById("buscar").value.toLowerCase().trim();
    const filtroStatus = document.getElementById("filtro-status").value;

    const token = localStorage.getItem("access_token");
    const url = CONFIG.BASE_URL.replace(/\/$/, "") + CONFIG.ENDPOINTS.alunos;

    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(url, {
            method: "GET",
            headers
        });

        const alunos = await response.json().catch(() => null);
        alunos.sort((a, b) => (a.nome || "").localeCompare((b.nome || ""), "pt-BR"))

        container.innerHTML = "";

        if (!response.ok) {
            container.innerHTML = `
                <tr>
                    <td colspan="4">Erro ao carregar alunos.</td>
                </tr>
            `;
            return;
        }

        if (!Array.isArray(alunos) || alunos.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4">Nenhum aluno encontrado.</td>
                </tr>
            `;
            return;
        }

        const idsUsados = new Set();

        const alunosFiltrados = alunos.filter((aluno) => {
            const id = aluno.id || aluno.id_aluno;

            if (idsUsados.has(id)) return false;
            idsUsados.add(id);

            const nome = (aluno.nome || "").toLowerCase();

            const cursosArray = Array.isArray(aluno.cursos) ? aluno.cursos : [];

            const cursosTexto = cursosArray.length
                ? cursosArray.map(item => (item.curso || "").toLowerCase()).join(", ")
                : "";

            const statusArray = cursosArray.map(item => (item.status || "").toUpperCase());

            const matchBusca =
                nome.includes(busca) ||
                cursosTexto.includes(busca);

            const matchStatus =
                filtroStatus === "" ||
                statusArray.includes(filtroStatus);

            return matchBusca && matchStatus;
        });

        if (alunosFiltrados.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4">Nenhum aluno encontrado.</td>
                </tr>
            `;
            return;
        }

        alunosFiltrados.forEach((aluno) => {
            const tr = document.createElement("tr");

            const cursosTexto = Array.isArray(aluno.cursos) && aluno.cursos.length
                ? aluno.cursos.map(item => item.curso).join(", ")
                : "Sem curso";

            const statusTexto = Array.isArray(aluno.cursos) && aluno.cursos.length
                ? aluno.cursos.map(item => {
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
                <td>${statusTexto}</td>
                <td>${cursosTexto}</td>
                <td>
                    <button class="btn-editar" onclick="editarAluno(${aluno.id})">Editar</button>
                </td>
            `;

            container.appendChild(tr);
        });

    } catch (error) {
        container.innerHTML = `
            <tr>
                <td colspan="4">Não foi possível conectar ao servidor.</td>
            </tr>
        `;
    }
}

function editarAluno(id) {
    window.location.href = `cadastrarAluno.html?id=${id}`;
}

document.getElementById("buscar").addEventListener("input", listarAlunos);
document.getElementById("filtro-status").addEventListener("change", listarAlunos);

listarAlunos();



function logout() {
    // Limpar dados de sessão
    localStorage.removeItem("access_token");
    sessionStorage.clear();
    
    // Redirecionar para a página de login
    window.location.href = "login.html";
}

function toggleMenu() {
  document.querySelector('.sidebar').classList.toggle('active');
}