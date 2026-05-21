protegerPagina();

let resumoDashboard = null;
let cursos = [];
let graficoStatus = null;
let graficoCursos = null;

const ENDPOINTS = {
  resumoDashboard: `${CONFIG.BASE_URL.replace(/\/$/, "")}${CONFIG.ENDPOINTS.submissao}resumo-dashboard/`,
};

document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();

  document
    .getElementById("btnAtualizarDashboard")
    .addEventListener("click", carregarDashboard);

  document
    .getElementById("filtroCurso")
    .addEventListener("change", carregarDashboard);

  document
    .getElementById("filtroStatus")
    .addEventListener("change", carregarDashboard);
});

function getToken() {
  return localStorage.getItem("access_token");
}

async function buscarDados(url) {
  const token = getToken();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados: ${response.status}`);
  }

  return response.json();
}

function montarUrlResumo() {
  const cursoSelecionado = document.getElementById("filtroCurso").value;
  const statusSelecionado = document.getElementById("filtroStatus").value;

  const params = new URLSearchParams();

  if (cursoSelecionado) {
    params.set("curso", cursoSelecionado);
  }

  if (statusSelecionado) {
    params.set("status", statusSelecionado);
  }

  const queryString = params.toString();

  return queryString
    ? `${ENDPOINTS.resumoDashboard}?${queryString}`
    : ENDPOINTS.resumoDashboard;
}

async function carregarDashboard() {
  try {
    const cursoAtual = document.getElementById("filtroCurso").value;

    resumoDashboard = await buscarDados(montarUrlResumo());

    cursos = Array.isArray(resumoDashboard.cursos)
      ? resumoDashboard.cursos
      : [];

    preencherFiltroCursos(cursoAtual);

    atualizarCards(resumoDashboard);
    atualizarGraficoStatus(resumoDashboard.por_status || {});
    atualizarGraficoCursos(resumoDashboard.por_curso || []);
    atualizarTabela(resumoDashboard.ultimas || []);

  } catch (error) {
    console.error(error);
    mostrarErroTabela("Erro ao carregar submissões do dashboard.");
  }
}

function preencherFiltroCursos(valorAtual = "") {
  const filtroCurso = document.getElementById("filtroCurso");

  filtroCurso.innerHTML = `<option value="">Todos os cursos</option>`;

  cursos.forEach((curso) => {
    const id = curso.id;
    const nome = curso.nome || `Curso ${id}`;

    filtroCurso.innerHTML += `
      <option value="${id}">${nome}</option>
    `;
  });

  filtroCurso.value = valorAtual;
}

function obterTotalStatus(porStatus, nomeStatus) {
  return Number(porStatus?.[nomeStatus] || 0);
}

function atualizarCards(resumo) {
  const porStatus = resumo?.por_status || {};

  document.getElementById("totalSubmissoes").textContent = resumo?.total || 0;
  document.getElementById("totalPendentes").textContent = obterTotalStatus(porStatus, "PENDENTE");
  document.getElementById("totalAprovadas").textContent = obterTotalStatus(porStatus, "APROVADA");
  document.getElementById("totalReprovadas").textContent = obterTotalStatus(porStatus, "REPROVADA");
}

function atualizarGraficoStatus(porStatus) {
  const ctx = document.getElementById("graficoStatus");

  const pendentes = obterTotalStatus(porStatus, "PENDENTE");
  const aprovadas = obterTotalStatus(porStatus, "APROVADA");
  const reprovadas = obterTotalStatus(porStatus, "REPROVADA");

  if (graficoStatus) {
    graficoStatus.destroy();
  }

  graficoStatus = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Pendentes", "Aprovadas", "Reprovadas"],
      datasets: [
        {
          data: [pendentes, aprovadas, reprovadas],
          backgroundColor: ["#facc15", "#22c55e", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function atualizarGraficoCursos(porCurso) {
  const ctx = document.getElementById("graficoCursos");

  const labels = porCurso.map((item) => item.nome || `Curso ${item.id}`);
  const valores = porCurso.map((item) => Number(item.total || 0));

  if (graficoCursos) {
    graficoCursos.destroy();
  }

  graficoCursos = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Submissões",
          data: valores,
          backgroundColor: "#5c7cfa",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

function obterStatus(item) {
  return (
    item.status_submissao_nome ||
    item.status_nome ||
    item.nome_status ||
    item.status_submissao ||
    ""
  )
    .toString()
    .toUpperCase();
}

function obterNomeCurso(item) {
  return (
    item.curso_nome ||
    item.nome_curso ||
    item.curso?.nome ||
    "Não informado"
  );
}

function obterNomeAluno(item) {
  return (
    item.aluno_nome ||
    item.nome_aluno ||
    item.aluno?.nome ||
    "Não informado"
  );
}

function obterNomeAtividade(item) {
  return item.atividade_categoria || "Não informado";
}

function atualizarTabela(ultimas) {
  const tbody = document.getElementById("tabelaUltimasSubmissoes");

  if (!ultimas.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Nenhuma submissão encontrada.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ultimas
    .map((item) => {
      const status = obterStatus(item);

      return `
        <tr>
          <td>${obterNomeAluno(item)}</td>
          <td>${obterNomeCurso(item)}</td>
          <td>${obterNomeAtividade(item)}</td>
          <td>
            <span class="badge-status ${classeStatus(status)}">
              ${status || "Não informado"}
            </span>
          </td>
          <td>${formatarData(item.data_envio)}</td>
        </tr>
      `;
    })
    .join("");
}

function classeStatus(status) {
  if (status === "PENDENTE") return "badge-pendente";
  if (status === "APROVADA") return "badge-aprovada";
  if (status === "REPROVADA") return "badge-reprovada";
  return "";
}

function formatarData(data) {
  if (!data) return "Não informado";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return data;
  }

  return dataObj.toLocaleDateString("pt-BR");
}

function mostrarErroTabela(mensagem) {
  const tbody = document.getElementById("tabelaUltimasSubmissoes");

  tbody.innerHTML = `
    <tr>
      <td colspan="5">${mensagem}</td>
    </tr>
  `;
}

function toggleMenu() {
  document.querySelector(".sidebar").classList.toggle("active");
}

function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "login.html";
}