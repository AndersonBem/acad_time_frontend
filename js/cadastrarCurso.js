protegerPagina();
const form = document.getElementById("form-curso");
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");
const token = localStorage.getItem("access_token");

function formatarNomeCampo(campo) {
	const nomes = {
		nome: "Nome",
		codigo: "Código",
		carga_horaria_minima: "Carga horária mínima",
		cargaHoraria: "Carga horária",
		descricao: "Descrição",
		status: "Status",
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

async function carregarCurso(id) {
	try {
		const response = await fetch(
			`${API_BASE_URL}${CONFIG.ENDPOINTS.curso}${id}/`,
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
				"Erro ao carregar curso.",
			);
			throw new Error(mensagem);
		}

		const curso = await response.json();

		document.getElementById("nome").value = curso.nome || "";
		document.getElementById("codigo").value = curso.codigo || "";
		document.getElementById("cargaHoraria").value =
			curso.cargaHoraria ||
			curso.carga_horaria ||
			curso.carga_horaria_minima ||
			"";
		document.getElementById("descricao").value = curso.descricao || "";

		if (
			curso.status === true ||
			curso.status === "Ativo" ||
			curso.status === "ativo"
		) {
			document.getElementById("ativo").checked = true;
		} else {
			document.getElementById("inativo").checked = true;
		}
	} catch (error) {
		console.error("Erro ao carregar curso:", error);
		alert(error.message || "Erro ao carregar curso.");
	}
}

if (id) {
	carregarCurso(id);
}

form.addEventListener("submit", async function (event) {
	event.preventDefault();

	const nome = document.getElementById("nome").value;
	const codigo = document.getElementById("codigo").value;
	const cargaHoraria = document.getElementById("cargaHoraria").value;
	const descricao = document.getElementById("descricao").value;
	const statusSelecionado = document.querySelector(
		'input[name="status"]:checked',
	)?.value;

	const payload = {
		nome: nome,
		codigo: codigo,
		carga_horaria_minima: Number(cargaHoraria),
		descricao: descricao,
		status: statusSelecionado === "ativo",
	};

	const url = id
		? `${API_BASE_URL}${CONFIG.ENDPOINTS.curso}${id}/`
		: `${API_BASE_URL}${CONFIG.ENDPOINTS.curso}`;

	const method = id ? "PATCH" : "POST";

	try {
		const response = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});

		if (response.ok) {
			const cursoSalvo = await response.json().catch(() => null);

			alert(
				cursoSalvo?.message ||
					cursoSalvo?.msg ||
					"Curso salvo com sucesso!",
			);

			window.location.href = "cursos.html";
		} else {
			const mensagem = await extrairMensagemErro(
				response,
				"Erro ao salvar curso.",
			);

			console.error("Erro ao salvar curso:", mensagem);
			alert(mensagem);
		}
	} catch (error) {
		console.error("Erro na requisição:", error);
		alert(error.message || "Erro de conexão com o servidor.");
	}
});

function logout() {
	localStorage.removeItem("access_token");
	sessionStorage.clear();
	window.location.href = "login.html";
}

function toggleMenu() {
	document.querySelector(".sidebar").classList.toggle("active");
}