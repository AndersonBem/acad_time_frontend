document.querySelector(".btn-secondary").onclick = function() {
    window.location.href = '../pages/login.html';
};

//montar URL
function montarURL(endpoint) {
    return CONFIG.BASE_URL.replace(/\/$/, '') + endpoint;
}

//  pegar token
function getToken() {
    return localStorage.getItem('access_token');
}

document.getElementById('recuperarForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert('Digite seu email!');
        return;
    }

    const dados = { email };

    // USANDO PADRÃO
    const url = CONFIG.BASE_URL.replace(/\/$/, '') + CONFIG.ENDPOINTS.recuperarsenha;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        console.log('Resposta API:', resultado);

        if (response.ok) {
            //  BACKEND FUNCIONOU
            localStorage.setItem('email_recuperacao', email);

            if (resultado.token) {
                localStorage.setItem('token_recuperacao', resultado.token);
            }

            const mensagem = document.createElement("div");
            mensagem.innerText = "Link enviado! Redirecionando...";
            mensagem.style.position = "fixed";
            mensagem.style.bottom = "20px";
            mensagem.style.left = "50%";
            mensagem.style.transform = "translateX(-50%)";
            mensagem.style.background = "#0d3b82";
            mensagem.style.color = "#fff";
            mensagem.style.padding = "12px 20px";
            mensagem.style.borderRadius = "8px";
            mensagem.style.zIndex = "9999";

            document.body.appendChild(mensagem);

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            //  API respondeu com erro
            localStorage.setItem('email_recuperacao', email);

            alert(resultado.erro || 'Erro na API, mas email salvo localmente.');
        }

    } catch (error) {
        //  SEM BACKEND / ERRO DE CONEXÃO
        console.error('Erro:', error);

        localStorage.setItem('email_recuperacao', email);

        alert(' No momento sem conexão com servidor, mas salvamos localmente');
    }
});