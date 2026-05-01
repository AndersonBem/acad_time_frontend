protegerPagina();
const token = localStorage.getItem("access_token");

async function listarCursos() {
	const container = document.getElementById("lista-cursos");
	const busca = document.getElementById("buscar").value.toLowerCase().trim();
	const filtroStatus = document.getElementById("filtro-status").value;

	try {
		const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.curso, {
			method: "GET",
			headers: {
				Authorization: "Bearer " + token,
				"Content-Type": "application/json",
			},
		});

		const cursos = await res.json();

		cursos.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));

		const cursosFiltrados = cursos.filter((curso) => {
			const nomeMatch = curso.nome.toLowerCase().includes(busca);
			const statusCurso = curso.status ? "ativo" : "inativo";
			const statusMatch = filtroStatus === "" || statusCurso === filtroStatus;

			return nomeMatch && statusMatch;
		});

		container.innerHTML = "";

		if (cursosFiltrados.length === 0) {
			container.innerHTML = `
                <tr>
                    <td colspan="4">Nenhum curso encontrado.</td>
                </tr>
            `;
			return;
		}

		cursosFiltrados.forEach((curso) => {
			const tr = document.createElement("tr");
			const cursoId = curso.id_curso || curso.id;

			tr.innerHTML = `
                <td>${curso.nome}</td>
                <td>${curso.status ? "Ativo" : "Inativo"}</td>
                <td>${curso.codigo || "-"}</td>
                <td>
                    <button class="btn-editar" onclick="editarCurso(${cursoId})">Editar</button>
                </td>
            `;

			container.appendChild(tr);
		});
	} catch (err) {
		console.error("Erro ao buscar cursos:", err);
		container.innerHTML = `
            <tr>
                <td colspan="4">Erro ao carregar cursos.</td>
            </tr>
        `;
	}
}

document.getElementById("buscar").addEventListener("input", listarCursos);
document
	.getElementById("filtro-status")
	.addEventListener("change", listarCursos);

listarCursos();

function editarCurso(id) {
	window.location.href = `cadastrarCurso.html?id=${id}`;
}

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
