const CONFIG = {
    BASE_URL: 'https://acad-time.onrender.com',
    //BASE_URL: 'http://127.0.0.1:7000/',
    ENDPOINTS: {
        usuarios: '/usuarios/',
        coordenadores: '/coordenador/',
        alunos: '/aluno/',
        superadmin: '/superadmin/',
        login: '/login/',
        inscricao: '/inscricao/',
        coordenacaoCurso: '/coordenacaoCurso/',
        tipoAtividade: '/tipoAtividade/',
        regraAtividade: '/regraAtividade/',
        statusSubmissao: '/statusSubmissao/',
        atividadeComplementar: '/atividadeComplementar/',
        curso: '/curso/',
        submissao: '/submissao/',
        auditoria: '/auditoria/',
        notificacaoEmail: '/notificacaoEmail/',
        recuperarsenha: '/recuperar-senha/',
        redefinirsenha: '/redefinir-senha/'
      }
  };

/*
=====================================================
REGRAS GERAIS PARA O FRONT
=====================================================

1. Como montar URL:
const url = CONFIG.BASE_URL.replace(/\/$/, '') + CONFIG.ENDPOINTS.alunos;

2. Rotas protegidas precisam enviar:
Authorization: Bearer TOKEN

3. Token salvo em:
localStorage.getItem('access_toktestecoordenadorn')

4. Usuário logado:
localStorage.getItem('usuario_logado')

5. Padrão DRF:
- lista: /rota/
- detalhe: /rota/{id}/

6. GET não precisa de Content-Type
*/


/*
=====================================================
LOGIN
=====================================================

Rota: /login/
Método: POST
Autenticação: NÃO precisa token
emails para testes:
teste@acadtime.com
testealuno@acadtime.com
testecoordeandor@acadtime.com
testesuperadmin@acadtime.com
Body:
{
    "email": "teste@acadtime.com",
    "senha": "teste123"
}

Resposta:
{
    "mensagem": "Login realizado com sucesso.",
    "access": "TOKEN",
    "usuario": {
        "id": 1,
        "nome": "Nome",
        "email": "email",
        "tipo": "aluno | coordenador | superadmin"
    }
}

Após login:
localStorage.setItem('access_token', token)
localStorage.setItem('usuario_logado', usuario)
*/


/*
=====================================================
USUARIOS
=====================================================

Rota: /usuarios/
Métodos:
GET /usuarios/
GET /usuarios/{id}/

Observação:
Somente leitura (ReadOnlyModelViewSet)

Retorno:
Lista de usuários do sistema
*/


/*
=====================================================
COORDENADOR
=====================================================

Rota: /coordenador/

OBS: está mostrando o curso ao qual ele tem vinculo tbm
   
    {
        "id": 13,
        "nome": "Gabriel Dias",
        "email": "gabriel@email.com",
        "status": true,
        "telefone": "81999999999",
        "cursos": [
            {
                "curso": "ADS"
            }
        ]
    }


Métodos:
GET /coordenador/
GET /coordenador/{id}/
POST /coordenador/
PUT /coordenador/{id}/
PATCH /coordenador/{id}/
DELETE /coordenador/{id}/

POST:
{
    "nome": "Nome",
    "email": "email",
    "senha": "123456",
    "telefone": "81999999999" // opcional
}

PUT/PATCH:
{
    "nome": "Novo nome",
    "email": "novo@email.com",
    "status": true
}

Retorno:
{
    "id": 13,
    "nome": "Nome",
    "email": "email",
    "status": true
}
*/


/*
=====================================================
ALUNO
=====================================================

Rota: /aluno/

Métodos:
GET /aluno/
GET /aluno/{id}/
POST /aluno/
PUT /aluno/{id}/
PATCH /aluno/{id}/
DELETE /aluno/{id}/

IMPORTANTE:
Requer autenticação

Header:
Authorization: Bearer TOKEN

Exemplo GET:
fetch(url, {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${token}`
    }
})

Resposta:
[
    {
        "id": 1,
        "nome": "João",
        "email": "email",
        "total_horas": "10.00",
        "matricula": "2023001",
        "cursos": [
            {
                "curso": "ADS",
                "status": "ATIVO"
            }
        ]
    }
]

POST:
{
    "nome": "Nome",
    "email": "email",
    "senha": "123456",
    "matricula": "2023001"
}

PUT/PATCH:
{
    "nome": "Novo nome",
    "email": "novo@email.com",
    "matricula": "2023002"
}
*/


/*
=====================================================
SUPERADMIN
=====================================================

Rota: /superadmin/

Métodos:
GET /superadmin/
GET /superadmin/{id}/

IMPORTANTE:
Requer autenticação

Header:
Authorization: Bearer TOKEN

Observação:
Somente leitura

Retorno:
{
    "id": 17,
    "nome": "Admin",
    "email": "email"
}
*/

/*
========================
INSCRIÇÃO (VÍNCULO ALUNO-CURSO)
========================

Endpoint:
GET /inscricao/
GET /inscricao/{id}/
POST /inscricao/
PATCH /inscricao/{id}/

Descrição:
Representa o vínculo entre um aluno e um curso.
Cada aluno só pode ter uma inscrição por curso (não permite duplicidade).

========================
GET /inscricao/
========================
Retorna lista de inscrições.

Resposta:
[
  {
    "id_inscricao": 1,
    "nome_curso": "ADS",
    "nome_aluno": "João Silva",
    "numero_matricula": "2023001",
    "data_inscricao": "2026-04-09",
    "status_matricula": "ATIVO"
  }
]

========================
GET /inscricao/{id}/
========================
Retorna uma inscrição específica.

Resposta:
{
  "id_inscricao": 1,
  "nome_curso": "ADS",
  "nome_aluno": "João Silva",
  "numero_matricula": "2023001",
  "data_inscricao": "2026-04-09",
  "status_matricula": "ATIVO"
}

========================
POST /inscricao/
========================
Cria uma nova inscrição (vínculo aluno-curso).

Body:
{
  "aluno": 1,
  "curso": 2,
  "status_matricula": 1
}

Observações:
- aluno, curso e status_matricula devem ser IDs existentes
- data_inscricao é gerada automaticamente pelo backend
- não permite duplicar inscrição para o mesmo aluno e curso

Possíveis erros:
- aluno ou curso inexistente
- duplicidade (aluno já inscrito no curso)

========================
PATCH /inscricao/{id}/
========================
Atualiza apenas o status da inscrição.

Body:
{
  "status_matricula": 2
}

Observações:
- não permite alterar aluno ou curso
- usado para ações como: trancar, cancelar, ativar

========================
DELETE /inscricao/{id}/
========================
Não permitido.
Retorna erro 405 (Method Not Allowed).

========================
Resumo
========================
Entrada (POST/PATCH):
- usa IDs (aluno, curso, status)

Saída (GET):
- retorna dados amigáveis (nome do aluno, nome do curso, status)
*/

/*
========================
COORDENAÇÃO (VÍNCULO COORDENADOR-CURSO)
========================

Endpoint:
GET /coordenacaoCurso/
GET /coordenacaoCurso/{id}/
POST /coordenacaoCurso/
PATCH /coordenacaoCurso/{id}/

Descrição:
Representa o vínculo entre um coordenador e um curso.
Permite histórico de vínculos (um coordenador pode entrar, sair e voltar ao mesmo curso).

Regra principal:
- NÃO permite mais de um vínculo ativo (data_fim = null) para o mesmo coordenador e curso
- vínculos antigos são preservados (histórico)

========================
GET /coordenacaoCurso/
========================
Retorna lista de vínculos.

Resposta:
[
  {
    "id_coordenacao_curso": 1,
    "curso": 2,
    "nome_curso": "ADS",
    "coordenador": 3,
    "nome_coordenador": "Maria Souza",
    "data_inicio": "2026-04-09",
    "data_fim": null,
    "status": "ativo"
  }
]

========================
GET /coordenacaoCurso/{id}/
========================
Retorna um vínculo específico.

Resposta:
{
  "id_coordenacao_curso": 1,
  "curso": 2,
  "nome_curso": "ADS",
  "coordenador": 3,
  "nome_coordenador": "Maria Souza",
  "data_inicio": "2026-04-09",
  "data_fim": null,
  "status": "ativo"
}

========================
POST /coordenacaoCurso/
========================
Cria um novo vínculo coordenador-curso.

Body:
{
  "coordenador": 3,
  "curso": 2
}

Observações:
- coordenador e curso devem ser IDs existentes
- data_inicio é gerada automaticamente pelo backend
- cria sempre um NOVO vínculo (não reutiliza antigos)
- não permite criar se já existir vínculo ativo para o mesmo coordenador e curso

Possíveis erros:
- coordenador ou curso inexistente
- já existe vínculo ativo para esse coordenador e curso

========================
PATCH /coordenacaoCurso/{id}/
========================
Encerra um vínculo existente.

Body:
{
  "data_fim": "2026-05-01"
}

Observações:
- usado para encerrar vínculo (definir data_fim)
- não permite alterar coordenador ou curso
- data_fim não pode ser anterior à data_inicio
- para reativar, deve ser feito um novo POST (novo vínculo)

========================
DELETE /coordenacaoCurso/{id}/
========================
Não permitido.
Retorna erro 405 (Method Not Allowed).

========================
Resumo
========================
Entrada (POST/PATCH):
- usa IDs (coordenador, curso)
- PATCH usa data_fim para encerrar vínculo

Saída (GET):
- retorna dados amigáveis (nome do coordenador, nome do curso)
- status é calculado automaticamente:
  - "ativo" → data_fim = null
  - "encerrado" → data_fim preenchida
*/

/*
========================
TIPO DE ATIVIDADE
========================

Endpoint:
GET /tipo-atividade/
GET /tipo-atividade/{id}/
POST /tipo-atividade/
PATCH /tipo-atividade/{id}/
DELETE /tipo-atividade/{id}/

Descrição:
Representa os tipos de atividades complementares aceitas no sistema.
Ex: Curso, Palestra, Evento, Monitoria, etc.

========================
GET /tipo-atividade/
========================
Retorna lista de tipos de atividade.

Resposta:
[
  {
    "id": 1,
    "nome": "Curso"
  },
  {
    "id": 2,
    "nome": "Palestra"
  }
]

========================
GET /tipo-atividade/{id}/
========================
Retorna um tipo de atividade específico.

Resposta:
{
  "id": 1,
  "nome": "Curso"
}

========================
POST /tipo-atividade/
========================
Cria um novo tipo de atividade.

Body:
{
  "nome": "Workshop"
}

Observações:
- nome deve ser único
- não permite duplicidade de nomes

Possíveis erros:
- nome já existente

========================
PATCH /tipo-atividade/{id}/
========================
Atualiza o nome do tipo de atividade.

Body:
{
  "nome": "Evento Acadêmico"
}

Observações:
- nome continua sendo único
- não permite duplicidade

========================
DELETE /tipo-atividade/{id}/
========================
Remove o tipo de atividade.

Observações:
- permitido, mas deve-se garantir que não esteja sendo utilizado em regras

========================
Resumo
========================
Entrada (POST/PATCH):
- recebe apenas o campo nome

Saída (GET):
- retorna id e nome do tipo de atividade
*/

/*========================
REGRA DE ATIVIDADE (VÍNCULO CURSO-TIPO DE ATIVIDADE)
========================

Endpoint:
GET /regraAtividade/
GET /regraAtividade/{id}/
POST /regraAtividade/
PATCH /regraAtividade/{id}/
DELETE /regraAtividade/{id}/

Descrição:
Define as regras de atividades complementares para cada curso.
Relaciona um curso a um tipo de atividade, definindo limites e exigências.

Regra principal:
- NÃO permite duplicidade de (curso + tipo_atividade)
- cada combinação curso + tipo de atividade deve ser única

========================
GET /regraAtividade/
========================
Retorna lista de regras.

Resposta:
[
  {
    "id": 1,
    "tipo_atividade": 2,
    "tipo_atividade_nome": "Palestra",
    "curso": 1,
    "curso_nome": "ADS",
    "limite_horas": 40,
    "exige_comprovante": true
  }
]

========================
GET /regraAtividade/{id}/
========================
Retorna uma regra específica.

Resposta:
{
  "id": 1,
  "tipo_atividade": 2,
  "tipo_atividade_nome": "Palestra",
  "curso": 1,
  "curso_nome": "ADS",
  "limite_horas": 40,
  "exige_comprovante": true
}

========================
POST /regraAtividade/
========================
Cria uma nova regra de atividade para um curso.

Body:
{
  "tipo_atividade": 2,
  "curso": 1,
  "limite_horas": 40,
  "exige_comprovante": true
}

Observações:
- tipo_atividade e curso devem ser IDs existentes
- não permite criar regra duplicada para o mesmo curso e tipo de atividade

Possíveis erros:
- tipo_atividade ou curso inexistente
- já existe regra para essa combinação (curso + tipo_atividade)

========================
PATCH /regraAtividade/{id}/
========================
Atualiza uma regra existente.

Body:
{
  "limite_horas": 60,
  "exige_comprovante": false
}

Observações:
- pode alterar qualquer campo
- não permite gerar duplicidade de (curso + tipo_atividade)

========================
DELETE /regraAtividade/{id}/
========================
Remove a regra de atividade.

Observações:
- permitido
- deve-se garantir que não existam dependências futuras (ex: submissões)

========================
Resumo
========================
Entrada (POST/PATCH):
- usa IDs (tipo_atividade, curso)
- define limite_horas e exige_comprovante

Saída (GET):
- retorna dados enriquecidos:
  - nome do tipo de atividade
  - nome do curso

Regra de negócio:
- unicidade baseada em (curso + tipo_atividade)
- id é apenas identificador técnico
*/

/*
========================
STATUS DE SUBMISSÃO
========================

Endpoint:
GET /statusSubmissao/
GET /statusSubmissao/{id}/
POST /statusSubmissao/
PATCH /statusSubmissao/{id}/
DELETE /statusSubmissao/{id}/

Descrição:
Representa os possíveis status de uma submissão de atividade complementar.
Ex: Pendente, Aprovado, Rejeitado.

========================
GET /statusSubmissao/
========================
Retorna lista de status disponíveis.

Resposta:
[
  {
    "id": 1,
    "nome_status": "Pendente"
  },
  {
    "id": 2,
    "nome_status": "Aprovado"
  },
  {
    "id": 3,
    "nome_status": "Rejeitado"
  }
]

========================
GET /statusSubmissao/{id}/
========================
Retorna um status específico.

Resposta:
{
  "id": 1,
  "nome_status": "Pendente"
}

========================
POST /statusSubmissao/
========================
Cria um novo status.

Body:
{
  "nome_status": "Em análise"
}

Observações:
- nome_status deve ser único (recomendado)
- geralmente essa tabela é pré-populada e pouco alterada

Possíveis erros:
- nome duplicado

========================
PATCH /statusSubmissao/{id}/
========================
Atualiza o nome do status.

Body:
{
  "nome_status": "Em revisão"
}

Observações:
- mudanças podem impactar o entendimento do sistema
- deve ser usado com cautela

========================
DELETE /statusSubmissao/{id}/
========================
Remove um status.

Observações:
- permitido, mas NÃO recomendado se já estiver em uso
- pode causar inconsistência em submissões existentes

========================
Resumo
========================
Entrada (POST/PATCH):
- recebe nome_status

Saída (GET):
- retorna id e nome do status

Observação importante:
- essa tabela é usada como referência para o fluxo de submissão
- normalmente contém valores fixos (Pendente, Aprovado, Rejeitado)
- não possui regras complexas de negócio
*/

/*
========================
ATIVIDADE COMPLEMENTAR
========================

Endpoint:
GET /atividadeComplementar/
GET /atividadeComplementar/{id}/
POST /atividadeComplementar/
PATCH /atividadeComplementar/{id}/
DELETE /atividadeComplementar/{id}/

Descrição:
Representa a atividade complementar em si, ou seja, o material/registro acadêmico que poderá ser enviado posteriormente em uma submissão.

Essa entidade NÃO representa o envio para análise.
Ela representa apenas o conteúdo da atividade complementar cadastrada pelo aluno.

Exemplos:
- participação em palestra
- curso realizado
- evento acadêmico
- atividade de extensão

Fluxo no sistema:
- primeiro a atividade complementar é cadastrada
- depois ela pode ser enviada por meio da Submissão
- a análise, aprovação, status, certificado e feedback do coordenador pertencem ao fluxo de Submissão, não à AtividadeComplementar

========================
GET /atividadeComplementar/
========================
Retorna lista de atividades complementares.

Resposta:
[
  {
    "id_atividade_complementar": 1,
    "descricao": "Participação em palestra sobre segurança digital",
    "carga_horaria_solicitada": 10,
    "tipo_atividade": 2,
    "tipo_atividade_nome": "Palestra"
  }
]

========================
GET /atividadeComplementar/{id}/
========================
Retorna uma atividade complementar específica.

Resposta:
{
  "id_atividade_complementar": 1,
  "descricao": "Participação em palestra sobre segurança digital",
  "carga_horaria_solicitada": 10,
  "tipo_atividade": 2,
  "tipo_atividade_nome": "Palestra"
}

========================
POST /atividadeComplementar/
========================
Cria uma nova atividade complementar.

Body:
{
  "descricao": "Participação em palestra sobre segurança digital",
  "carga_horaria_solicitada": 10,
  "tipo_atividade": 2
}

Observações:
- tipo_atividade deve ser um ID existente
- essa entidade representa apenas a atividade em si, não o envio para análise

Possíveis erros:
- tipo_atividade inexistente
- dados obrigatórios ausentes

========================
PATCH /atividadeComplementar/{id}/
========================
Atualiza uma atividade complementar existente.

Body:
{
  "descricao": "Participação em palestra sobre LGPD",
  "carga_horaria_solicitada": 12
}

Observações:
- permite editar livremente os dados da atividade
- não envolve status, aprovação ou análise

========================
DELETE /atividadeComplementar/{id}/
========================
Remove uma atividade complementar.

Observações:
- permitido no estado atual do sistema
- futuramente, caso exista submissão vinculada, pode ser necessário revisar essa regra

========================
Resumo
========================
Entrada (POST/PATCH):
- usa tipo_atividade por ID
- recebe descrição e carga_horaria_solicitada

Saída (GET):
- retorna:
  - id_atividade_complementar
  - descricao
  - carga_horaria_solicitada
  - tipo_atividade
  - tipo_atividade_nome

Regra de negócio:
- AtividadeComplementar representa o item acadêmico entregue pelo aluno
- o envio dessa atividade para análise acontece em Submissão
- status, aprovação, certificado e feedback não pertencem a esta entidade
*/

/*
========================
CURSO
========================

⚠️ Observação importante:
- O endpoint de curso NÃO gerencia vínculos.
- Para vincular:
  - aluno ↔ curso → usar /inscricao/
  - coordenador ↔ curso → usar /coordenacaoCurso/
- Este endpoint é apenas para dados do curso.

Endpoint:
GET /curso/
GET /curso/{id}/
POST /curso/
PATCH /curso/{id}/
DELETE /curso/{id}/

Descrição:
Representa os dados base de um curso.
Não inclui diretamente alunos ou coordenadores vinculados.

========================
GET /curso/
========================
Retorna lista de cursos.

Resposta:
[
  {
    "idCurso": 1,
    "nome": "ADS",
    "codigo": "ADS001",
    "status": true,
    "cargaHoraria": 200,
    "descricao": "Curso de Análise e Desenvolvimento de Sistemas"
  }
]

========================
GET /curso/{id}/
========================
Retorna um curso específico.

Resposta:
{
  "idCurso": 1,
  "nome": "ADS",
  "codigo": "ADS001",
  "status": true,
  "cargaHoraria": 200,
  "descricao": "Curso de Análise e Desenvolvimento de Sistemas"
}

========================
POST /curso/
========================
Cria um novo curso.

Body:
{
  "nome": "ADS",
  "codigo": "ADS001",
  "status": true,
  "cargaHoraria": 200,
  "descricao": "Curso de Análise e Desenvolvimento de Sistemas"
}

Observações:
- Todos os campos seguem o model diretamente
- Não realiza vínculo com alunos ou coordenadores

Possíveis erros:
- campos obrigatórios não informados
- violação de regra de unicidade (se existir no banco)

========================
PATCH /curso/{id}/
========================
Atualiza dados do curso.

Body (exemplo):
{
  "nome": "ADS Atualizado",
  "status": false
}

Observações:
- Permite atualizar qualquer campo do curso
- Não altera vínculos existentes

========================
DELETE /curso/{id}/
========================
Remove um curso.

Observações:
- Pode afetar registros relacionados dependendo do comportamento do banco (CASCADE)

========================
Resumo
========================
Entrada (POST/PATCH):
- usa dados diretos do curso

Saída (GET):
- retorna dados simples do curso

Vínculos:
- aluno ↔ curso → /inscricao/
- coordenador ↔ curso → /coordenacaoCurso/
*/

/*
========================================
ENDPOINT: /submissao/
========================================

Observação importante:
Este endpoint faz parte de um fluxo de processo, não de um CRUD totalmente livre.
A submissão representa um envio acadêmico que passa por avaliação, então nem todos os perfis
podem executar todas as ações.

Fluxo definido:
Aluno cria submissão -> Coordenador avalia -> Status da submissão é alterado
A submissão NÃO deve ser excluída fisicamente, para preservar histórico e auditoria.

--------------------------------------------------
REGRAS GERAIS DE NEGÓCIO
--------------------------------------------------

---

1. CREATE (POST)

---

* Apenas ALUNO autenticado pode criar submissão.
* O aluno NÃO envia seu próprio id no body.
* O backend usa o usuário autenticado (request.user) para vincular a submissão ao aluno correto.
* O coordenador e o superadmin NÃO podem criar submissões.

Validações já aplicadas:

* usuário autenticado precisa ser aluno
* aluno precisa ter inscrição ativa no curso
* precisa existir regra da atividade para o curso
* limite de horas é validado no banco
* o envio de certificado é OBRIGATÓRIO
* o arquivo deve ser PDF, JPG, JPEG ou PNG

Campos esperados no create:
(form-data / multipart)

* curso: <id>
* atividade_complementar: <id>
* certificado_arquivo: <file>

Exemplo:
POST /submissao/

Body (form-data):
curso = 1
atividade_complementar = 2
certificado_arquivo = [arquivo PDF/JPG/PNG]

Resposta esperada:
201 Created

Exemplo de retorno:
{
"id_submissao": 9,
"data_envio": "2026-04-11",
"observacao_coordenador": null,
"aluno": 22,
"aluno_nome": "TesteAluno",
"curso": 1,
"curso_nome": "ADS",
"atividade_complementar": 2,
"status_submissao": 1,
"status_submissao_nome": "PENDENTE",
"certificado": 5,
"coordenador": 13
}


--------------------------------------------------
2) UPDATE / PATCH
--------------------------------------------------

Objetivo do PATCH:
Permitir que a submissão seja avaliada.

Quem pode atualizar:
- ALUNO: NÃO pode atualizar
- COORDENADOR: pode atualizar apenas submissões de cursos com vínculo ativo
- SUPERADMIN: pode atualizar

Campos liberados no update:
{
    "status_submissao": <id>,
    "observacao_coordenador": "texto"
}

Exemplo:
PATCH /submissao/{id}/

Body:
{
    "status_submissao": 2,
    "observacao_coordenador": "Submissão avaliada pelo coordenador."
}

Regras do update:
- aluno não pode alterar submissão
- coordenador só pode avaliar submissão do curso que coordena
- superadmin pode atualizar
- o coordenador que avaliou pode ser gravado automaticamente pelo backend
- o backend e o banco podem impedir alterações conforme regras de negócio
- submissões finalizadas podem ser bloqueadas por trigger no banco

Exemplo de erro esperado:
403 Forbidden
quando:
- aluno tenta atualizar
- coordenador tenta atualizar submissão sem vínculo com o curso

400 Bad Request
quando:
- a regra de negócio do banco impedir a operação
Exemplo:
"Submissão já finalizada e não pode ter o status alterado."

--------------------------------------------------
3) DELETE
--------------------------------------------------

DELETE NÃO é permitido.

Motivo:
A submissão representa um histórico de envio e avaliação acadêmica.
Mesmo rejeitada ou inválida, deve continuar registrada.

Decisão adotada:
- NÃO haverá exclusão física da submissão
- mudanças de situação devem ocorrer por ALTERAÇÃO DE STATUS
- isso preserva histórico, auditoria e consistência do processo

Resposta esperada:
403 Forbidden

Mensagem sugerida:
"Exclusão de submissão não é permitida. Utilize a alteração de status."

--------------------------------------------------
4) LEITURA / CONSULTA
--------------------------------------------------

Uso esperado:
- aluno consultar sua própria submissão e seu status
- coordenador consultar submissões para avaliar
- superadmin consultar submissões para administração

Campos importantes no retorno:
- id_submissao
- data_envio
- observacao_coordenador
- aluno
- aluno_nome
- curso
- curso_nome
- atividade_complementar
- status_submissao
- status_submissao_nome
- certificado
- coordenador

Observação:
O serializer de leitura pode retornar campos enriquecidos com nomes para facilitar o front,
como:
- aluno_nome
- curso_nome
- status_submissao_nome

--------------------------------------------------
5) COMPORTAMENTO ESPERADO POR PERFIL
--------------------------------------------------

ALUNO
- pode criar submissão
- pode consultar submissão
- não pode atualizar status
- não pode excluir

COORDENADOR
- não pode criar submissão
- pode consultar submissões do(s) curso(s) que coordena
- pode atualizar status e observação da submissão
- não pode excluir

SUPERADMIN
- não pode criar submissão
- pode consultar
- pode atualizar
- não pode excluir

--------------------------------------------------
6) OBSERVAÇÕES PARA FRONT-END
--------------------------------------------------

- O front não deve tentar enviar "aluno" no create.
- O front não deve exibir botão de edição para aluno.
- O front não deve exibir botão de exclusão.
- A tela do coordenador deve focar em avaliação:
  - alterar status
  - preencher observação_coordenador
- O front deve tratar respostas 403 e 400 com mensagens claras para o usuário.
- Quando houver erro vindo do banco por regra de negócio, a API deve retornar mensagem tratada,
  e o front deve exibir essa mensagem sem quebrar a interface.

--------------------------------------------------
7) OBSERVAÇÕES PARA BACK-END / EVOLUÇÃO FUTURA
--------------------------------------------------

- Este endpoint já segue uma lógica de fluxo, não apenas CRUD.
- O ideal é manter serializers separados:
  - SubmissaoReadSerializer
  - SubmissaoCreateSerializer
  - SubmissaoUpdateSerializer
- O endpoint deve continuar respeitando as triggers e funções do banco.
- A auditoria da submissão já existe no banco e pode ser evoluída depois
  para registrar usuário autenticado real, IP e outros metadados.
- No futuro, este comentário pode ser migrado para documentação formal da API.
*/
/**
 * LOG DE AUDITORIA (APENAS LEITURA - SUPERADMIN)
 *
 * Endpoint responsável por visualizar o histórico de ações realizadas no sistema.
 * Registra operações como criação, atualização, aprovação, rejeição e exclusão.
 *
 * 🔐 Permissão:
 * - Apenas usuários com perfil de superadmin podem acessar.
 *
 * 📥 GET /logauditoria/
 * - Lista todos os logs de auditoria (ordenados do mais recente para o mais antigo)
 *
 * 📥 GET /logauditoria/{id}/
 * - Retorna os detalhes de um log específico
 *
 * 📊 Campos retornados:
 * - id_log_auditoria
 * - data_hora
 * - nome_entidade (ex: "Submissao")
 * - id_entidade_afetada
 * - descricao (ex: "Submissão criada", "Submissão aprovada")
 * - ip_origem
 * - usuario (id)
 * - usuario_nome
 * - tipo_acao (id)
 * - tipo_acao_nome (CREATE, UPDATE, APPROVE, etc)
 * - valor_anterior (JSON)
 * - valor_novo (JSON)
 *
 * ⚠️ Observações:
 * - Este endpoint é somente leitura (não permite POST, PUT, PATCH ou DELETE)
 * - Logs são gerados automaticamente via trigger no banco de dados
 * - O campo valor_anterior e valor_novo representam o estado antes e depois da operação
 */

/*
========================================
ENDPOINT: notificacaoEmail
URL: /notificacaoEmail/
TIPO: READ ONLY
ACESSO: Apenas superadmin
OBJETIVO:
Listar o histórico técnico de notificações de e-mail enviadas pelo sistema,
incluindo assunto, corpo, destinatário, status do envio, tipo do evento,
mensagem de erro (quando existir) e a submissão relacionada.

REGRAS:
- Não permite criação manual.
- Não permite edição.
- Não permite exclusão.
- Deve ser usado apenas para consulta administrativa/técnica.
- Retorna as notificações da mais recente para a mais antiga.

GET /notificacaoEmail/
Lista todas as notificações de e-mail registradas no sistema.

Exemplo de resposta:
[
  {
    "id_notificacao_email": 15,
    "assunto": "Nova submissão pendente - ADS",
    "corpo": "Olá, Gabriel Dias...\n\n...",
    "data": "2026-04-13",
    "destinatario": "gabriel@email.com",
    "status_envio": "SUCESSO",
    "tipo_evento": "SUBMISSAO_CRIADA",
    "mensagem_erro": null,
    "submissao_id": 43
  }
]

GET /notificacaoEmail/{id}/
Retorna os detalhes de uma notificação específica.

Campos retornados:
- id_notificacao_email: identificador da notificação
- assunto: assunto do e-mail
- corpo: conteúdo enviado
- data: data do registro
- destinatario: e-mail que recebeu a notificação
- status_envio: resultado do envio
  Valores esperados:
  - "SUCESSO"
  - "FALHA"
- tipo_evento: evento que gerou a notificação
  Valores atuais:
  - "SUBMISSAO_CRIADA"
  - "SUBMISSAO_APROVADA"
  - "SUBMISSAO_REPROVADA"
- mensagem_erro: descrição do erro, quando houver falha
- submissao_id: id da submissão relacionada à notificação

Observação:
Esse endpoint é administrativo e serve para auditoria e rastreio técnico
das notificações de e-mail do sistema.
========================================
*/

/*
========================================
ENDPOINT: recuperarsenha
URL: /recuperar-senha/
TIPO: POST
ACESSO: Público (não requer autenticação)
OBJETIVO:
Permitir que o usuário solicite a recuperação de senha informando seu e-mail.
O sistema gera um token temporário e envia um link de redefinição por e-mail.

REGRAS:
- Recebe apenas e-mail.
- Não informa se o e-mail existe ou não no sistema (segurança).
- Sempre retorna mensagem genérica de sucesso.
- Gera token com validade (ex: 1 hora).
- O link enviado contém o token para redefinição de senha.

POST /recuperar-senha/
Solicita recuperação de senha.

Body esperado:
{
  "email": "usuario@email.com"
}

Resposta (sempre 200):
{
  "mensagem": "Se o e-mail existir, o link de recuperação foi enviado."
}

Observações:
- Esse endpoint apenas inicia o processo.
- A redefinição da senha ocorre em outro endpoint (redefinir-senha).
- O front deve direcionar o usuário para a tela de redefinição ao acessar o link enviado por e-mail.
========================================
*/

/*
========================================
ENDPOINT: redefinirsenha
URL: /redefinir-senha/
TIPO: POST
ACESSO: Público (não requer autenticação)
OBJETIVO:
Permitir que o usuário redefina sua senha utilizando um token temporário
recebido por e-mail no processo de recuperação de senha.

REGRAS:
- Recebe token e nova senha.
- O token deve existir, não pode estar expirado e não pode ter sido utilizado.
- Após uso, o token é invalidado (usado = true).
- A senha é armazenada de forma segura (hash).
- Não permite reutilização do token.

POST /redefinir-senha/
Redefine a senha do usuário.

Body esperado:
{
  "token": "token_recebido_por_email",
  "nova_senha": "novaSenha123"
}

Resposta de sucesso:
{
  "mensagem": "Senha redefinida com sucesso."
}

Possíveis erros:
{
  "erro": "Token inválido."
}

{
  "erro": "Token expirado."
}

{
  "erro": "Token já utilizado."
}

Observações:
- Esse endpoint é a segunda etapa do fluxo de recuperação de senha.
- O token é gerado no endpoint /recuperar-senha/.
- O front deve capturar o token da URL (ex: ?token=...) e enviar neste endpoint.
========================================
*/
