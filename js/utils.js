async function fazerRequisicao(url, metodo = 'GET', dados = null) {
    const opcoes = {
        method: metodo
    };

    if (dados) {
        opcoes.headers = {
            'Content-Type': 'application/json'
        };
        opcoes.body = JSON.stringify(dados);
    }

    const resposta = await fetch(url, opcoes);

    let conteudo;
    try {
        conteudo = await resposta.json();
    } catch {
        conteudo = { mensagem: 'Resposta sem JSON' };
    }

    return {
        ok: resposta.ok,
        status: resposta.status,
        dados: conteudo
    };
}

function toggleMenu() {
    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.toggle("active");
    }
}

function protegerPagina() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }
}

async function obterMensagemErro(response, mensagemPadrao = "Erro inesperado.") {
    let erro = null;

    try {
        erro = await response.json();
    } catch {
        try {
            erro = await response.text();
        } catch {
            return mensagemPadrao;
        }
    }

    if (!erro) {
        return mensagemPadrao;
    }

    if (typeof erro === "string") {
        return erro || mensagemPadrao;
    }

    if (erro.detail) {
        return erro.detail;
    }

    if (erro.mensagem) {
        return erro.mensagem;
    }

    if (erro.message) {
        return erro.message;
    }

    const mensagens = Object.entries(erro)
        .map(([campo, valor]) => {
            if (Array.isArray(valor)) {
                return `${campo}: ${valor.join(", ")}`;
            }

            if (typeof valor === "object") {
                return `${campo}: ${JSON.stringify(valor)}`;
            }

            return `${campo}: ${valor}`;
        })
        .join("\n");

    return mensagens || mensagemPadrao;
}

function mostrarErro(mensagem) {
    alert(mensagem);
}

function mostrarSucesso(mensagem) {
    alert(mensagem);
}