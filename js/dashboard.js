protegerPagina();
let submissoes = [];
let cursos = [];
let graficoStatus = null;
let graficoCursos = null;

const ENDPOINTS = {
  submissoes: CONFIG.BASE_URL + CONFIG.ENDPOINTS.submissao,
  cursos: CONFIG.BASE_URL + CONFIG.ENDPOINTS.curso,
};

document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();

  document
    .getElementById("btnAtualizarDashboard")
    .addEventListener("click", aplicarFiltros);

  document
    .getElementById("filtroCurso")
    .addEventListener("change", aplicarFiltros);

  document
    .getElementById("filtroStatus")
    .addEventListener("change", aplicarFiltros);
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

async function carregarDashboard() {
  try {
    const dadosSubmissoes = await buscarDados(ENDPOINTS.submissoes);

    submissoes = Array.isArray(dadosSubmissoes)
      ? dadosSubmissoes
      : dadosSubmissoes.results || [];

    cursos = [
      ...new Map(
        submissoes
          .filter((item) => item.curso && item.curso_nome)
          .map((item) => [
            item.curso,
            {
              id_curso: item.curso,
              nome: item.curso_nome,
            },
          ])
      ).values(),
    ];

    preencherFiltroCursos();
    aplicarFiltros();

  } catch (error) {
    console.error(error);
    mostrarErroTabela("Erro ao carregar submissões do dashboard.");
  }
}

function preencherFiltroCursos() {
  const filtroCurso = document.getElementById("filtroCurso");

  filtroCurso.innerHTML = `<option value="">Todos os cursos</option>`;

  cursos.forEach((curso) => {
    const id = curso.id_curso || curso.id || curso.curso;
    const nome = curso.nome || curso.nome_curso || curso.curso_nome || `Curso ${id}`;

    filtroCurso.innerHTML += `
      <option value="${id}">${nome}</option>
    `;
  });
}

function aplicarFiltros() {
  const cursoSelecionado = document.getElementById("filtroCurso").value;
  const statusSelecionado = document.getElementById("filtroStatus").value;

  let dadosFiltrados = [...submissoes];

  if (cursoSelecionado) {
    dadosFiltrados = dadosFiltrados.filter((item) => {
      const cursoId = item.curso || item.id_curso || item.curso_id;
      return String(cursoId) === String(cursoSelecionado);
    });
  }

  if (statusSelecionado) {
    dadosFiltrados = dadosFiltrados.filter((item) => {
      const status = obterStatus(item);
      return status === statusSelecionado;
    });
  }

  atualizarCards(dadosFiltrados);
  atualizarGraficoStatus(dadosFiltrados);
  atualizarGraficoCursos(dadosFiltrados);
  atualizarTabela(dadosFiltrados);
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
    buscarNomeCursoPorId(item.curso) ||
    "Não informado"
  );
}

function buscarNomeCursoPorId(id) {
  const curso = cursos.find((c) => String(c.id_curso || c.id) === String(id));
  return curso ? curso.nome || curso.nome_curso : null;
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

function atualizarCards(dados) {
  const total = dados.length;
  const pendentes = dados.filter((item) => obterStatus(item) === "PENDENTE").length;
  const aprovadas = dados.filter((item) => obterStatus(item) === "APROVADA").length;
  const reprovadas = dados.filter((item) => obterStatus(item) === "REPROVADA").length;

  document.getElementById("totalSubmissoes").textContent = total;
  document.getElementById("totalPendentes").textContent = pendentes;
  document.getElementById("totalAprovadas").textContent = aprovadas;
  document.getElementById("totalReprovadas").textContent = reprovadas;
}

function atualizarGraficoStatus(dados) {
  const ctx = document.getElementById("graficoStatus");

  const pendentes = dados.filter((item) => obterStatus(item) === "PENDENTE").length;
  const aprovadas = dados.filter((item) => obterStatus(item) === "APROVADA").length;
  const reprovadas = dados.filter((item) => obterStatus(item) === "REPROVADA").length;

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

function atualizarGraficoCursos(dados) {
  const ctx = document.getElementById("graficoCursos");

  const contagemPorCurso = {};

  dados.forEach((item) => {
    const nomeCurso = obterNomeCurso(item);
    contagemPorCurso[nomeCurso] = (contagemPorCurso[nomeCurso] || 0) + 1;
  });

  const labels = Object.keys(contagemPorCurso);
  const valores = Object.values(contagemPorCurso);

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

function atualizarTabela(dados) {
  const tbody = document.getElementById("tabelaUltimasSubmissoes");

  if (!dados.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Nenhuma submissão encontrada.</td>
      </tr>
    `;
    return;
  }

  const ultimas = dados.slice(0, 8);

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

