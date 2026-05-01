# 🎓 AcadTime - Frontend

Frontend do sistema AcadTime, uma plataforma para gerenciamento de atividades complementares acadêmicas.

https://acad-time-1.onrender.com

---

## 🚀 Sobre o Projeto

O AcadTime é um sistema desenvolvido para facilitar o controle de atividades complementares de alunos, permitindo:

- Envio de atividades
- Upload de certificados
- Acompanhamento de status (pendente, aprovado, rejeitado)
- Interação entre aluno, coordenador e administrador

Este repositório contém apenas o frontend da aplicação.

---

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Fetch API
- LocalStorage (para autenticação via JWT)

---

## 🔗 Integração com Backend

O frontend consome a API REST do backend AcadTime.

Base URL (produção):
https://acad-time.onrender.com

Autenticação:
- JWT (JSON Web Token)
- Token armazenado no localStorage

---

## 📂 Estrutura do Projeto

frontend/
├── css/
├── js/
├── pages/
├── index.html
└── config.js

---

## ⚙️ Configuração

1. Clonar o repositório:
git clone https://github.com/AndersonBem/acad_time_frontend.git

2. Abrir o projeto:
- Pode usar Live Server (VS Code)
- Ou abrir diretamente o index.html

---

## 🔧 Configurar API

No arquivo config.js, configure a URL da API:

const BASE_URL = "http://127.0.0.1:7000"; // ambiente local
// ou
const BASE_URL = "https://acad-time.onrender.com"; // produção

---

## 👤 Perfis de Usuário

- Aluno
- Coordenador
- SuperAdmin

Cada perfil possui permissões diferentes dentro da aplicação.

---

## 📦 Funcionalidades Implementadas

- Login com JWT
- Listagem de atividades
- Criação de submissões
- Upload de certificado
- Visualização de status
- Controle de acesso por perfil

---

## 🌐 Deploy

O frontend pode ser hospedado em:

- Netlify
- Vercel
- GitHub Pages
- Render

---

## 📌 Observações

- Este projeto depende do backend AcadTime para funcionar corretamente
- Certifique-se de que a API está ativa antes de utilizar

---

## 👨‍💻 Autores

Desenvolvido por:

- Matheus Goes Soares (https://github.com/MatheusGoesSoares)
- Lucas Mendes (https://github.com/Luc4s22)
- Anderson Alexandre (https://github.com/AndersonBem)

  
Recife - PE
