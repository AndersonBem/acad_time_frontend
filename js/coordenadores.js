protegerPagina();
const token = localStorage.getItem("access_token");
const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");

function obterIdCoordenador(coordenador) {
	return (
		coordenador.id ||
		coordenador.id_coordenador ||
		coordenador.idCoordenador
	);
}

function obterIdCoordenadorVinculo(vinculo) {
	return (
		vinculo.coordenador ||
		vinculo.coordenador_id ||
		vinculo.id_coordenador ||
		vinculo.coordenadorId
	);
}

function obterNomeCursoVinculo(vinculo) {
	if (typeof vinculo.curso === "object" && vinculo.curso !== null) {
		return vinculo.curso.nome || vinculo.curso.name || "-";
	}

	return (
		vinculo.nome_curso ||
		vinculo.curso_nome ||
		vinculo.nome ||
		vinculo.curso ||
		"-"
	);
}

async function buscarVinculosCoordenacaoCurso() {
	try {
		const response = await fetch(
			`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenacaoCurso}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) return [];

		return await response.json();
	} catch (error) {
		return [];
	}
}

async function listarCoordenadores() {
	const container = document.getElementById("lista-coordenadores");
	const busca = document.getElementById("buscar").value.toLowerCase().trim();

	try {
		const [responseCoordenadores, vinculos] = await Promise.all([
			fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenadores}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}),
			buscarVinculosCoordenacaoCurso(),
		]);

		const coordenadores = await responseCoordenadores.json();

		coordenadores.sort((a, b) =>
			(a.nome || "").localeCompare(b.nome || "", "pt-BR"),
		);

		const idsUsados = new Set();

		const coordenadoresFiltrados = coordenadores.filter((coordenador) => {
			const id = obterIdCoordenador(coordenador);

			if (idsUsados.has(id)) return false;

			idsUsados.add(id);

			return (
				(coordenador.nome || "").toLowerCase().includes(busca) ||
				(coordenador.email || "").toLowerCase().includes(busca)
			);
		});

		container.innerHTML = "";

		if (coordenadoresFiltrados.length === 0) {
			container.innerHTML = `
				<tr>
					<td colspan="5">Nenhum coordenador encontrado.</td>
				</tr>
			`;
			return;
		}

		coordenadoresFiltrados.forEach((coordenador) => {
			const tr = document.createElement("tr");
			const coordenadorId = obterIdCoordenador(coordenador);
			const statusTexto = coordenador.status ? "Ativo" : "Inativo";

			const cursosAtivos = vinculos.filter((vinculo) => {
				const idCoordenadorVinculo = obterIdCoordenadorVinculo(vinculo);

				return (
					Number(idCoordenadorVinculo) === Number(coordenadorId) &&
					!vinculo.data_fim &&
					!vinculo.dataFim
				);
			});

			const cursoTexto = cursosAtivos.length
				? cursosAtivos.map((vinculo) => obterNomeCursoVinculo(vinculo)).join(", ")
				: "-";

			tr.innerHTML = `
				<td>${coordenador.nome || "-"}</td>
				<td>${coordenador.email || "-"}</td>
				<td>${cursoTexto}</td>
				<td>${statusTexto}</td>
				<td>
					<button class="btn-editar" onclick="editarCoordenador(${coordenadorId})">Editar</button>
					<button class="btn-excluir" onclick="excluirCoordenador(${coordenadorId})">Excluir</button>
				</td>
			`;

			container.appendChild(tr);
		});
	} catch (error) {
		container.innerHTML = `
			<tr>
				<td colspan="5">Erro ao carregar coordenadores.</td>
			</tr>
		`;
	}
}

function editarCoordenador(id) {
	window.location.href = `cadastrarCoordenador.html?id=${id}`;
}

async function excluirCoordenador(id) {
	const confirmar = confirm("Deseja realmente excluir este coordenador?");
	if (!confirmar) return;

	try {
		const response = await fetch(
			`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenadores}${id}/`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (response.ok) {
			alert("Coordenador excluído com sucesso!");
			listarCoordenadores();
		} else {
			alert("Não foi possível excluir o coordenador.");
		}
	} catch (error) {
		alert("Erro ao conectar com o servidor.");
	}
}

document.getElementById("buscar").addEventListener("input", listarCoordenadores);

listarCoordenadores();

function logout() {
	localStorage.removeItem("access_token");
	sessionStorage.clear();
	window.location.href = "login.html";
}

function toggleMenu() {
	document.querySelector(".sidebar").classList.toggle("active");
}