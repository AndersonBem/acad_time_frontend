document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("redefinirForm");

    function getToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        return token ? token.trim() : null;
    }

    async function redefinirSenha(event) {
        event.preventDefault();

        const novaSenhaInput = document.getElementById("novaSenha");
        const novaSenha = novaSenhaInput.value.trim();
        const token = getToken();

        console.log("Token:", token);
        console.log("Senha preenchida:", !!novaSenha);

        if (!token) {
            alert("Token não encontrado.");
            return;
        }

        if (novaSenha.length < 4) {
            alert("Digite uma senha válida!");
            return;
        }

        const url = CONFIG.BASE_URL.replace(/\/$/, '') + CONFIG.ENDPOINTS.redefinirsenha;

        const payload = {
            token: token,
            nova_senha: novaSenha
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));

            console.log("Resposta API:", data);

            if (!response.ok) {
                alert(data.erro || "Erro ao redefinir senha");
                return;
            }

            alert("Senha redefinida com sucesso!");
            window.location.href = "login.html";

        } catch (err) {
            console.error("Erro na requisição:", err);
            alert("Erro de conexão com o servidor");
        }
    }

    if (form) {
        form.addEventListener("submit", redefinirSenha);
    }

});
