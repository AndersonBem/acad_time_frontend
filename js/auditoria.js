protegerPagina();
let logs = [];
let logsFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 8;

async function carregarLogs() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.auditoria}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        alert("Erro ao carregar logs de auditoria");
        return;
    }

    logs = await response.json();
    logsFiltrados = logs;

    renderizarTabela();
}

function renderizarTabela() {
    const tabela = document.getElementById("tabelaAuditoria");
    tabela.innerHTML = "";

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const logsPagina = logsFiltrados.slice(inicio, fim);

    logsPagina.forEach((log, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${formatarData(log.data_hora)}</td>
            <td>${log.usuario_nome || "-"}</td>
            <td>${log.ip_origem || "-"}</td>
            <td>${log.tipo_acao_nome || "-"}</td>
            <td>${log.nome_entidade || "-"}</td>
            <td>${log.descricao || "-"}</td>
            <td>
                <button class="btn-detalhes" onclick="abrirModal(${inicio + index})">
                    Ver detalhes
                </button>
            </td>
        `;

        tabela.appendChild(linha);
    });

    atualizarPaginacao();
}

function atualizarPaginacao() {
    const totalPaginas = Math.ceil(logsFiltrados.length / itensPorPagina);

    document.getElementById("infoPagina").textContent =
        `Página ${paginaAtual} de ${totalPaginas || 1}`;

    document.getElementById("btnAnterior").disabled = paginaAtual === 1;
    document.getElementById("btnProximo").disabled = paginaAtual >= totalPaginas;
}

document.getElementById("btnAnterior").addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarTabela();
    }
});

document.getElementById("btnProximo").addEventListener("click", () => {
    const totalPaginas = Math.ceil(logsFiltrados.length / itensPorPagina);

    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTabela();
    }
});

document.getElementById("buscar").addEventListener("input", (event) => {
    const termo = event.target.value.toLowerCase();

    logsFiltrados = logs.filter(log =>
        String(log.usuario_nome || "").toLowerCase().includes(termo) ||
        String(log.usuario_email || "").toLowerCase().includes(termo) ||
        String(log.tipo_acao_nome || "").toLowerCase().includes(termo) ||
        String(log.nome_entidade || "").toLowerCase().includes(termo) ||
        String(log.descricao || "").toLowerCase().includes(termo)
    );

    paginaAtual = 1;
    renderizarTabela();
});

function abrirModal(index) {
    const log = logsFiltrados[index];

    const anterior = log.valor_anterior || {};
    const novo = log.valor_novo || {};

    const campos = [...new Set([
        ...Object.keys(anterior),
        ...Object.keys(novo)
    ])];

    let html = `
        <table class="tabela-detalhes">
            <thead>
                <tr>
                    <th>Campo</th>
                    <th>Valor anterior</th>
                    <th>Valor novo</th>
                </tr>
            </thead>
            <tbody>
    `;

    campos.forEach(campo => {
        const valorAntigo = anterior[campo] ?? "-";
        const valorNovo = novo[campo] ?? "-";

        const mudou = JSON.stringify(valorAntigo) !== JSON.stringify(valorNovo);

        html += `
            <tr class="${mudou ? "campo-alterado" : ""}">
                <td>${campo}</td>
                <td>${valorAntigo}</td>
                <td>${valorNovo}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById("valorAnterior").innerHTML = html;
    document.getElementById("valorNovo").style.display = "none";

    document.getElementById("modalAuditoria").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modalAuditoria").style.display = "none";
}

function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
}

carregarLogs();