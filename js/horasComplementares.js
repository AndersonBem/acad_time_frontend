protegerPagina();
const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");
const token = localStorage.getItem("access_token");

let cursosCarregados = [];
let regrasCarregadas = [];
let tiposAtividadeCarregados = [];

function normalizarTexto(texto) {
	return (texto || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();
}

function obterIdTipoAtividade(tipo) {
	return tipo.id || tipo.id_tipo_atividade || tipo.tipo_atividade;
}

function obterNomeTipoAtividade(tipo) {
	return tipo.nome || tipo.tipo_atividade_nome || tipo.titulo || "";
}

function obterDescricaoTipoAtividade(tipo) {
	return tipo.descricao || tipo.descrição || tipo.descricao_tipo || "";
}

function encontrarLinhaPorTipo(tipoNome) {
	return Array.from(document.querySelectorAll(".linha-regra")).find(
		(linha) => normalizarTexto(linha.dataset.tipo) === normalizarTexto(tipoNome),
	);
}

function criarLinhaRegra(tipo) {
	const nome = obterNomeTipoAtividade(tipo);
	const descricao = obterDescricaoTipoAtividade(tipo);

	if (!nome || encontrarLinhaPorTipo(nome)) return;

	const div = document.createElement("div");
	div.className = "linha-regra";
	div.dataset.tipo = nome;

	div.innerHTML = `
		<div class="categoria">
			<strong>${nome}</strong>
			<p>${descricao || "Sem descrição"}</p>
		</div>

		<div class="limite">
			<div class="input-com-texto">
				<input type="number" value="0">
				<span>Horas</span>
			</div>
		</div>

		<div class="regra">
			<textarea></textarea>
		</div>

		<div class="comprovante">
			<label class="switch">
				<input type="checkbox" class="chk-comprovante">
				<span class="slider"></span>
			</label>
		</div>

		<div class="status">
			<label class="switch">
				<input type="checkbox">
				<span class="slider"></span>
			</label>
		</div>
	`;

	const acoesHoras = document.querySelector(".acoes-horas");
	acoesHoras.parentNode.insertBefore(div, acoesHoras);

	const inputLimite = div.querySelector(".limite input");
	const checkboxStatus = div.querySelector('.status input[type="checkbox"]');

	inputLimite.addEventListener("input", validarSomaHoras);
	checkboxStatus.addEventListener("change", validarSomaHoras);
}

function renderizarTiposAtividade() {
	tiposAtividadeCarregados.forEach((tipo) => {
		criarLinhaRegra(tipo);
	});
}

function abrirModalCategoria() {
	if (document.getElementById("modalCategoria")) {
		document.getElementById("modalCategoria").style.display = "flex";
		return;
	}

	const modal = document.createElement("div");
	modal.id = "modalCategoria";
	modal.style.position = "fixed";
	modal.style.top = "0";
	modal.style.left = "0";
	modal.style.width = "100%";
	modal.style.height = "100%";
	modal.style.background = "rgba(0, 0, 0, 0.45)";
	modal.style.display = "flex";
	modal.style.justifyContent = "center";
	modal.style.alignItems = "center";
	modal.style.zIndex = "9999";

	modal.innerHTML = `
		<div style="background:#fff; width:100%; max-width:480px; border-radius:12px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
			<h2 style="margin-bottom:18px; color:#123b7a;">Nova Categoria de Atividade</h2>

			<div class="campo">
				<label for="nomeCategoria">Nome da categoria</label>
				<input type="text" id="nomeCategoria" placeholder="Ex: Projeto de extensão">
			</div>

			<div class="campo">
				<label for="descricaoCategoria">Descrição</label>
				<textarea id="descricaoCategoria" placeholder="Ex: Atividades de extensão universitária"></textarea>
			</div>
			<div style="display:flex; justify-content:flex-end; gap:12px; margin-top:20px;">
				<button type="button" id="btnCancelarCategoria" class="btn-cancelar-categoria" onclick="fecharModalCategoria()">Cancelar</button>
				<button type="button" id="btnSalvarCategoria" class="btn-salvar-categoria" onclick="salvarNovaCategoria()">Salvar</button>
			</div>
		</div>
	`;

	document.body.appendChild(modal);
}

function fecharModalCategoria() {
	const modal = document.getElementById("modalCategoria");
	if (modal) modal.style.display = "none";
}

async function salvarNovaCategoria() {
	const nome = document.getElementById("nomeCategoria").value.trim();
	const descricao = document.getElementById("descricaoCategoria").value.trim();

	if (!nome) {
		alert("Informe o nome da categoria.");
		return;
	}

	const payload = {
		nome,
		descricao,
	};

	try {
		const response = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.tipoAtividade}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const erro = await response.text();
			console.error("Erro ao cadastrar categoria:", erro);
			alert("Erro ao cadastrar categoria.");
			return;
		}

		await carregarTiposAtividade();
		renderizarTiposAtividade();
		preencherCamposRegras();

		document.getElementById("nomeCategoria").value = "";
		document.getElementById("descricaoCategoria").value = "";
		fecharModalCategoria();

		alert("Categoria cadastrada com sucesso!");
	} catch (error) {
		console.error("Erro ao cadastrar categoria:", error);
		alert("Erro ao conectar com o servidor.");
	}
}

async function carregarCursos() {
	const selectCurso = document.getElementById("curso");

	const usuario = JSON.parse(localStorage.getItem("usuario_logado") || "{}");
	const tipoUsuario = usuario.tipo;

	let cursos = [];

	if (tipoUsuario === "coordenador") {
		const responseVinculos = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.coordenacaoCurso}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!responseVinculos.ok) {
			alert("Erro ao carregar cursos do coordenador.");
			return;
		}

		const vinculos = await responseVinculos.json();

		const responseCursos = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.curso}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!responseCursos.ok) {
			alert("Erro ao carregar dados dos cursos.");
			return;
		}

		const todosCursos = await responseCursos.json();

		cursos = vinculos
			.filter((vinculo) => !vinculo.data_fim)
			.map((vinculo) => {
				const cursoCompleto = todosCursos.find(
					(curso) => Number(curso.id_curso || curso.id) === Number(vinculo.curso)
				);

				return {
					id_curso: vinculo.curso,
					nome: vinculo.nome_curso || `Curso ${vinculo.curso}`,
					carga_horaria_minima: cursoCompleto
						? cursoCompleto.carga_horaria_minima || ""
						: "",
				};
			});
	} else {
		const response = await fetch(`${API_BASE_URL}${CONFIG.ENDPOINTS.curso}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			alert("Erro ao carregar cursos.");
			return;
		}

		cursos = await response.json();
	}

	cursosCarregados = cursos;
	
	selectCurso.innerHTML = `<option value="">Selecione um curso</option>`;

	cursosCarregados.forEach((curso) => {
		const option = document.createElement("option");
		option.value = curso.id_curso || curso.id;
		option.textContent = curso.nome;
		selectCurso.appendChild(option);
	});
}

async function carregarTiposAtividade() {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.tipoAtividade}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) {
		const erro = await response.text();
		console.error("Erro ao carregar tipos de atividade:", erro);
		alert("Erro ao carregar tipos de atividade.");
		return;
	}

	tiposAtividadeCarregados = await response.json();
}

async function carregarRegras() {
	const cursoId = document.getElementById("curso").value;

	if (!cursoId) {
		regrasCarregadas = [];
		return;
	}

	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.regraAtividade}?curso=${cursoId}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) {
		const erro = await response.text();
		console.error("Erro ao carregar regras:", erro);
		alert("Erro ao carregar regras.");
		return;
	}

	regrasCarregadas = await response.json();
}

function atualizarCargaMinima() {
	const cursoIdSelecionado = Number(document.getElementById("curso").value);
	const inputCargaMinima = document.getElementById("cargaMinima");

	const cursoSelecionado = cursosCarregados.find(
		(curso) => Number(curso.id_curso || curso.id) === cursoIdSelecionado,
	);

	inputCargaMinima.value = cursoSelecionado
		? cursoSelecionado.carga_horaria_minima || ""
		: "";
}

function limparCamposRegras() {
	document.querySelectorAll(".linha-regra").forEach((linha) => {
		const inputLimite = linha.querySelector(".limite input");
		const textareaRegra = linha.querySelector(".regra textarea");
		const checkboxComprovante = linha.querySelector(
			'.comprovante input[type="checkbox"]',
		);
		const checkboxStatus = linha.querySelector(
			'.status input[type="checkbox"]',
		);

		if (inputLimite) inputLimite.value = 0;
		if (textareaRegra) textareaRegra.value = "";
		if (checkboxComprovante) checkboxComprovante.checked = false;
		if (checkboxStatus) checkboxStatus.checked = false;
	});
}

function preencherCamposRegras() {
	const cursoIdSelecionado = Number(document.getElementById("curso").value);

	limparCamposRegras();

	if (!cursoIdSelecionado) {
		validarSomaHoras();
		return;
	}

	const regrasCurso = regrasCarregadas.filter(
		(regra) => Number(regra.curso) === cursoIdSelecionado,
	);

	regrasCurso.forEach((regra) => {
		const tipoNome = (regra.tipo_atividade_nome || "").trim();
		const linha = encontrarLinhaPorTipo(tipoNome);

		if (!linha) return;

		const inputLimite = linha.querySelector(".limite input");
		const textareaRegra = linha.querySelector(".regra textarea");
		const checkboxComprovante = linha.querySelector(
			'.comprovante input[type="checkbox"]',
		);
		const checkboxStatus = linha.querySelector(
			'.status input[type="checkbox"]',
		);

		if (inputLimite) inputLimite.value = regra.limite_horas || 0;
		if (textareaRegra) textareaRegra.value = regra.regra_validacao || "";
		if (checkboxComprovante)
			checkboxComprovante.checked = regra.exige_comprovante === true;
		if (checkboxStatus) checkboxStatus.checked = Number(regra.limite_horas) > 0;
	});

	validarSomaHoras();
}

function calcularSomaHorasAtivas() {
	const linhas = document.querySelectorAll(".linha-regra");
	let soma = 0;

	linhas.forEach((linha) => {
		const checkboxStatus = linha.querySelector(
			'.status input[type="checkbox"]',
		);
		const inputLimite = linha.querySelector(".limite input");

		if (checkboxStatus && checkboxStatus.checked && inputLimite) {
			soma += Number(inputLimite.value) || 0;
		}
	});

	return soma;
}

function validarSomaHoras() {
	const cargaMinima = Number(document.getElementById("cargaMinima").value) || 0;
	const somaHoras = calcularSomaHorasAtivas();
	const botaoSalvar = document.getElementById("btnSalvarRegras");

	if (somaHoras >= cargaMinima && cargaMinima > 0) {
		botaoSalvar.disabled = false;
		botaoSalvar.style.opacity = "1";
		botaoSalvar.style.cursor = "pointer";
	} else {
		botaoSalvar.disabled = true;
		botaoSalvar.style.opacity = "0.6";
		botaoSalvar.style.cursor = "not-allowed";
	}
}

function configurarValidacaoHoras() {
	const inputsLimite = document.querySelectorAll(".limite input");
	const checkboxesStatus = document.querySelectorAll(
		'.status input[type="checkbox"]',
	);
	const inputCargaMinima = document.getElementById("cargaMinima");

	inputsLimite.forEach((input) => {
		input.addEventListener("input", validarSomaHoras);
	});

	checkboxesStatus.forEach((checkbox) => {
		checkbox.addEventListener("change", validarSomaHoras);
	});

	inputCargaMinima.addEventListener("input", validarSomaHoras);

	validarSomaHoras();
}

function obterPayloadLinha(linha, cursoId, tipoAtividadeId) {
	const inputLimite = linha.querySelector(".limite input");
	const textareaRegra = linha.querySelector(".regra textarea");
	const checkboxComprovante = linha.querySelector(
		'.comprovante input[type="checkbox"]',
	);
	const checkboxStatus = linha.querySelector('.status input[type="checkbox"]');

	const horasDigitadas = Number(inputLimite.value) || 0;

	return {
		tipo_atividade: tipoAtividadeId,
		curso: cursoId,
		limite_horas: checkboxStatus.checked ? horasDigitadas : 0,
		regra_validacao: textareaRegra.value.trim(),
		exige_comprovante: checkboxComprovante.checked,
	};
}

async function salvarRegras() {
	const cursoId = Number(document.getElementById("curso").value);
	const cargaMinima = Number(document.getElementById("cargaMinima").value) || 0;
	const somaHoras = calcularSomaHorasAtivas();

	if (!cursoId) {
		alert("Selecione um curso.");
		return;
	}

	if (somaHoras < cargaMinima) {
	alert(
		`A soma dos limites ativos (${somaHoras}h) deve ser igual ou maior que a carga horária mínima do curso (${cargaMinima}h).`
	);
	return;
	}

	const linhas = document.querySelectorAll(".linha-regra");

	for (const linha of linhas) {
		const tipoNome = linha.dataset.tipo;

		const regraExistente = regrasCarregadas.find(
			(regra) =>
				Number(regra.curso) === cursoId &&
				normalizarTexto(regra.tipo_atividade_nome) ===
					normalizarTexto(tipoNome),
		);

		if (regraExistente) {
			const payload = obterPayloadLinha(
				linha,
				cursoId,
				regraExistente.tipo_atividade,
			);

			const response = await fetch(
				`${API_BASE_URL}${CONFIG.ENDPOINTS.regraAtividade}${regraExistente.id}/`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const erro = await response.text();
				console.error("Erro ao atualizar regra:", erro);
				alert("Erro ao salvar regras.");
				return;
			}
		} else {
			const tipoBase = tiposAtividadeCarregados.find(
				(tipo) => normalizarTexto(obterNomeTipoAtividade(tipo)) === normalizarTexto(tipoNome),
			);

			if (!tipoBase) {
				console.error(`Tipo de atividade não encontrado para ${tipoNome}`);
				alert(`Não foi possível identificar o tipo de atividade ${tipoNome}.`);
				return;
			}

			const payload = obterPayloadLinha(
				linha,
				cursoId,
				obterIdTipoAtividade(tipoBase),
			);

			const response = await fetch(
				`${API_BASE_URL}${CONFIG.ENDPOINTS.regraAtividade}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				const erro = await response.text();
				console.error("Erro ao criar regra:", erro);
				alert("Erro ao salvar regras.");
				return;
			}
		}
	}

	await carregarRegras();
	preencherCamposRegras();
	alert("Regras salvas com sucesso!");
}

document.getElementById("curso").addEventListener("change", async function () {
	atualizarCargaMinima();
	await carregarRegras();
	preencherCamposRegras();
});

document
	.getElementById("btnSalvarRegras")
	.addEventListener("click", salvarRegras);

async function iniciarTelaHorasComplementares() {
	await carregarCursos();
	await carregarTiposAtividade();
	renderizarTiposAtividade();
	configurarValidacaoHoras();
}

iniciarTelaHorasComplementares();

function logout() {
	localStorage.removeItem("access_token");
	sessionStorage.clear();
	window.location.href = "login.html";
}

function toggleMenu() {
	document.querySelector(".sidebar").classList.toggle("active");
}
