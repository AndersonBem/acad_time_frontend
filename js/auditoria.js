protegerPagina();

let logs = [];
let paginaAtual = 1;
const itensPorPagina = 8;
let totalLogs = 0;

async function carregarLogs() {
    const token = localStorage.getItem("access_token");
    const busca = document.getElementById("buscar").value.trim();

    const params = new URLSearchParams();

    params.set("page", paginaAtual);
    params.set("page_size", itensPorPagina);

    if (busca) {
        params.set("busca", busca);
    }

    const response = await fetch(
        `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.auditoria}?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        logs = [];
        totalLogs = 0;
        renderizarTabela();
        alert("Erro ao carregar logs de auditoria");
        return;
    }

    const dados = await response.json();

    logs = Array.isArray(dados)
        ? dados
        : dados.results || [];

    totalLogs = Array.isArray(dados)
        ? logs.length
        : dados.count || 0;

    renderizarTabela();
}

function renderizarTabela() {
    const tabela = document.getElementById("tabelaAuditoria");
    tabela.innerHTML = "";

    if (!logs.length) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7">Nenhum log de auditoria encontrado.</td>
            </tr>
        `;

        atualizarPaginacao();
        return;
    }

    logs.forEach((log, index) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${formatarData(log.data_hora)}</td>
            <td>${log.usuario_nome || "-"}</td>
            <td>${log.ip_origem || "-"}</td>
            <td>${log.tipo_acao_nome || "-"}</td>
            <td>${log.nome_entidade || "-"}</td>
            <td>${log.descricao || "-"}</td>
            <td>
                <button class="btn-detalhes" onclick="abrirModal(${index})">
                    Ver detalhes
                </button>
            </td>
        `;

        tabela.appendChild(linha);
    });

    atualizarPaginacao();
}

function atualizarPaginacao() {
    const totalPaginas = Math.max(1, Math.ceil(totalLogs / itensPorPagina));

    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    document.getElementById("infoPagina").textContent =
        `Página ${paginaAtual} de ${totalPaginas}`;

    document.getElementById("btnAnterior").disabled = paginaAtual === 1;
    document.getElementById("btnProximo").disabled = paginaAtual >= totalPaginas;
}

document.getElementById("btnAnterior").addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarLogs();
    }
});

document.getElementById("btnProximo").addEventListener("click", () => {
    const totalPaginas = Math.max(1, Math.ceil(totalLogs / itensPorPagina));

    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        carregarLogs();
    }
});

document.getElementById("buscar").addEventListener("input", () => {
    paginaAtual = 1;
    carregarLogs();
});

function abrirModal(index) {
    const log = logs[index];

    if (!log) return;

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