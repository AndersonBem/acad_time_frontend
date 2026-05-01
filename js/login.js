document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

  
    if (!email || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    const dados = {
        email: email,
        senha: senha
    };

    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.style.display = "flex";
    const url = CONFIG.BASE_URL.replace(/\/$/, '') + CONFIG.ENDPOINTS.login;

    try {
        loadingOverlay.style.display = "flex";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();

        console.log('Resposta da API:', resultado);

        if (response.ok) {
            const token = resultado.access;
            const usuario = resultado.usuario;
            if (usuario?.tipo === "aluno") {
                alert("Alunos não possuem acesso ao painel administrativo.");
                return;
            }

            if (token) {
                localStorage.setItem('access_token', token);
            }

            if (usuario) {
                localStorage.setItem('usuario_logado', JSON.stringify(usuario));
                localStorage.setItem('tipo_usuario', usuario.tipo);
            }

            alert(resultado.mensagem || 'Login realizado com sucesso.');
            window.location.href = '../pages/dashboard.html';
        } else {
            alert(resultado.erro || 'Email ou senha inválidos.');
        }

    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Não foi possível conectar ao servidor.');
    } finally {
        loadingOverlay.style.display = "none";
    }
});
