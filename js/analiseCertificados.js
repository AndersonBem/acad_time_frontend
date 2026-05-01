protegerPagina();
const API_BASE_URL = CONFIG.BASE_URL.replace(/\/$/, "");
const token = localStorage.getItem("access_token");

let submissaoAtual = null;
let atividadeAtual = null;
let statusDisponiveis = [];
let logsAuditoria = [];

function getSubmissaoId() {
	const params = new URLSearchParams(window.location.search);
	return params.get("id");
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

function normalizarTexto(texto) {
	return String(texto || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toUpperCase()
		.trim();
}

function obterStatusPorNome(nome) {
	const nomeNormalizado = normalizarTexto(nome);

	return statusDisponiveis.find(
		(status) =>
			normalizarTexto(status.nome_status || status.nome) ===
			nomeNormalizado,
	);
}

function obterIdStatus(status) {
	return (
		status.id_status_submissao ||
		status.id ||
		status.id_status ||
		null
	);
}

async function buscarSubmissao(id) {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.submissao}${id}/`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) throw new Error();

	return await response.json();
}

async function buscarAtividadeComplementar(id) {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.atividadeComplementar}${id}/`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) throw new Error();

	return await response.json();
}

async function buscarStatusSubmissao() {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.statusSubmissao}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) throw new Error();

	return await response.json();
}

async function buscarAluno(idAluno) {
	if (!idAluno) return null;

	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.alunos}${idAluno}/`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) return null;

	return await response.json();
}

async function buscarLogsAuditoria() {
	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.auditoria}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	if (!response.ok) return [];

	return await response.json();
}

function preencherDadosAluno(aluno = null) {
	document.getElementById("alunoNome").textContent =
		submissaoAtual?.aluno_nome || aluno?.nome || "-";

	document.getElementById("alunoEmail").textContent =
		aluno?.email || "-";

	document.getElementById("cursoNome").textContent =
		submissaoAtual?.curso_nome || "-";

	document.getElementById("dataEnvio").textContent =
		formatarData(submissaoAtual?.data_envio);

	document.getElementById("statusSubmissaoAtual").textContent =
		submissaoAtual?.status_submissao_nome || "-";
}

function preencherDadosAtividade() {
	document.getElementById("categoria").value =
		atividadeAtual?.tipo_atividade_nome || "-";

	document.getElementById("descricao").value =
		atividadeAtual?.descricao || "-";

	document.getElementById("carga").value =
		atividadeAtual?.carga_horaria_solicitada != null
			? `${atividadeAtual.carga_horaria_solicitada}h`
			: "-";

	document.getElementById("atividadeId").value =
		atividadeAtual?.id_atividade_complementar || "-";

	const campoAprovada = document.getElementById("cargaAprovada");

	if (campoAprovada) {
		campoAprovada.value =
			submissaoAtual?.carga_horaria_aprovada ||
			atividadeAtual?.carga_horaria_solicitada ||
			"";
	}
}

function preencherArquivo() {
	const nomeArquivo = document.getElementById("arquivoNome");

	if (submissaoAtual?.certificado_url) {
		nomeArquivo.textContent =
			submissaoAtual.certificado_nome || `Certificado #${submissaoAtual.certificado}`;
	} else {
		nomeArquivo.textContent = "Nenhum arquivo";
	}
}

function preencherOCR() {
	document.getElementById("ocrNome").textContent =
		submissaoAtual?.aluno_nome || "-";

	document.getElementById("ocrCurso").textContent =
		submissaoAtual?.curso_nome || "-";

	document.getElementById("ocrCarga").textContent =
		atividadeAtual?.carga_horaria_solicitada != null
			? `${atividadeAtual.carga_horaria_solicitada}h`
			: "-";

	document.getElementById("ocrData").textContent =
		formatarData(submissaoAtual?.data_envio);
}

function preencherObservacao() {
	document.getElementById("observacoes").value =
		submissaoAtual?.observacao_coordenador || "";
}

function preencherHistorico() {
	const container = document.getElementById("historicoAnalise");
	container.innerHTML = "";

	const logsSubmissao = logsAuditoria.filter(
		(log) =>
			String(log.nome_entidade || "").toUpperCase() ===
				"SUBMISSAO" &&
			Number(log.id_entidade_afetada) ===
				Number(submissaoAtual?.id_submissao),
	);

	if (!logsSubmissao.length) {
		container.innerHTML = `
			<div class="item-historico">
				<span class="bolinha"></span>
				<div>
					<strong>-</strong>
					<p>Nenhum histórico disponível</p>
				</div>
			</div>
		`;
		return;
	}

	logsSubmissao
		.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
		.forEach((log) => {
			const item = document.createElement("div");

			item.className = "item-historico";

			item.innerHTML = `
				<span class="bolinha"></span>
				<div>
					<strong>${formatarDataHora(log.data_hora)}</strong>
					<p>${log.descricao || "-"}</p>
				</div>
			`;

			container.appendChild(item);
		});
}

async function atualizarSubmissao(
	statusId,
	observacao,
	cargaAprovada,
) {
	const id = getSubmissaoId();

	const payload = new URLSearchParams();

	payload.append("status_submissao", statusId);
	payload.append(
		"observacao_coordenador",
		observacao,
	);

	if (cargaAprovada !== "") {
		payload.append(
			"carga_horaria_aprovada",
			cargaAprovada,
		);
	}

	const response = await fetch(
		`${API_BASE_URL}${CONFIG.ENDPOINTS.submissao}${id}/`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type":
					"application/x-www-form-urlencoded",
			},
			body: payload.toString(),
		},
	);

	if (!response.ok) {
		const erro = await response.text();
		alert(erro || "Erro ao atualizar submissão.");
		return false;
	}

	return true;
}

async function salvarAnaliseComStatus(nomeStatus) {
	const status = obterStatusPorNome(nomeStatus);

	if (!status) {
		alert(`Status "${nomeStatus}" não encontrado.`);
		return;
	}

	const statusId = obterIdStatus(status);

	if (!statusId) {
		alert("ID do status não encontrado.");
		return;
	}

	const observacao =
		document.getElementById("observacoes").value.trim();

	const campoAprovada =
		document.getElementById("cargaAprovada");

	let cargaAprovada = "";

	if (campoAprovada) {
		cargaAprovada = campoAprovada.value.trim();
	}

	if (nomeStatus === "APROVADA") {
		if (!cargaAprovada) {
			alert(
				"Informe a carga horária aprovada.",
			);
			return;
		}
	}

	const sucesso = await atualizarSubmissao(
		statusId,
		observacao,
		cargaAprovada,
	);

	if (!sucesso) return;

	alert("Submissão atualizada com sucesso!");
	window.location.href = "listarCertificados.html";
}

function configurarBotoes() {
	const btnAprovar =
		document.getElementById("btnAprovar");

	const btnReprovar =
		document.getElementById("btnReprovar");

	const btnVisualizarArquivo =
		document.getElementById(
			"btnVisualizarArquivo",
		);

	const btnBaixarArquivo =
		document.getElementById(
			"btnBaixarArquivo",
		);

	btnAprovar.onclick = () =>
		salvarAnaliseComStatus("APROVADA");

	btnReprovar.onclick = () =>
		salvarAnaliseComStatus("REPROVADA");

	btnVisualizarArquivo.onclick = () => {
		if (!submissaoAtual?.certificado_url) {
			alert("Nenhum arquivo disponível para visualização.");
			return;
		}

		window.open(submissaoAtual.certificado_url, "_blank");
	};

	btnBaixarArquivo.onclick = async () => {
		if (!submissaoAtual?.id_submissao) {
			alert("Submissão não encontrada.");
			return;
		}

		const url = `${API_BASE_URL}${CONFIG.ENDPOINTS.submissao}${submissaoAtual.id_submissao}/baixar-certificado/`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			alert("Erro ao baixar certificado.");
			return;
		}

		const blob = await response.blob();
		const blobUrl = window.URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = submissaoAtual.certificado_nome || "certificado";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		window.URL.revokeObjectURL(blobUrl);
	};
}

async function iniciarTelaAnalise() {
	const id = getSubmissaoId();

	if (!id) {
		alert("ID não informado.");
		return;
	}

	try {
		submissaoAtual =
			await buscarSubmissao(id);

		atividadeAtual =
			await buscarAtividadeComplementar(
				submissaoAtual.atividade_complementar,
			);

		statusDisponiveis =
			await buscarStatusSubmissao();

		const aluno =
			await buscarAluno(
				submissaoAtual.aluno,
			);

		logsAuditoria =
			await buscarLogsAuditoria();

		preencherDadosAluno(aluno);
		preencherDadosAtividade();
		preencherArquivo();
		preencherOCR();
		preencherObservacao();
		preencherHistorico();
		configurarBotoes();
	} catch {
		alert("Erro ao carregar dados.");
	}
}

iniciarTelaAnalise();

function logout() {
	localStorage.removeItem("access_token");
	sessionStorage.clear();
	window.location.href = "login.html";
}

function toggleMenu() {
	document
		.querySelector(".sidebar")
		.classList.toggle("active");
}