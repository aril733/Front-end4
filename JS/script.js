const CHAVE = "tarefasSalvas:v1";

var Banco = {
  pendentes: [],
  feitas: []
};

function pegarEl(id1, id2) {
  return document.getElementById(id1) || (id2 ? document.getElementById(id2) : null);
}

var form = pegarEl("formTarefa", "formularioTarefa");
var campoId = pegarEl("idTarefa", "campoId");
var campoTitulo = pegarEl("campoTitulo", "titulo");
var campoResponsavel = pegarEl("campoResponsavel", "responsavel");
var campoDataInicio = pegarEl("campoDataInicio", "dataInicio");
var campoDataFim = pegarEl("campoDataFim", "dataFim");
var campoPrioridade = pegarEl("campoPrioridade", "priority");
var campoObservacao = pegarEl("campoObservacao", "note");

var listaPendentes = pegarEl("listaPendentes", "pendingList");
var listaConcluidas = pegarEl("listaConcluidas", "doneList");

var contadorPendentes = pegarEl("contadorPendentes", "pendingCount");
var contadorConcluidas = pegarEl("contadorConcluidas", "doneCount");

var botaoGravar = pegarEl("botaoGravar", "botaoGravar") || pegarEl("saveAllBtn", "btnSalvar");
var botaoRecuperar = pegarEl("botaoRecuperar", "loadAllBtn") || pegarEl("btnRecuperar");
var botaoLimpar = pegarEl("botaoLimpar", "botaoLimpar") || pegarEl("clearAllBtn", "btnLimpar");
var botaoLimparForm = pegarEl("botaoLimparFormulario", "resetFormBtn");

function mostrarMensagem(texto, tempo = 2200) {
  var barra = document.getElementById("barraMensagem");
  if (!barra) {
    barra = document.createElement("div");
    barra.id = "barraMensagem";
    barra.style.position = "fixed";
    barra.style.top = "12px";
    barra.style.right = "12px";
    barra.style.padding = "8px 12px";
    barra.style.background = "rgba(0,0,0,0.75)";
    barra.style.color = "#fff";
    barra.style.borderRadius = "6px";
    barra.style.zIndex = 9999;
    document.body.appendChild(barra);
  }
  barra.textContent = texto;
  barra.style.opacity = "1";
  clearTimeout(barra._t);
  barra._t = setTimeout(() => { barra.style.opacity = "0"; }, tempo);
}

function renderizarListas() {
  if (!listaPendentes || !listaConcluidas) return;

  listaPendentes.innerHTML = "";
  listaConcluidas.innerHTML = "";

  for (var i = 0; i < Banco.pendentes.length; i++) {
    var t = Banco.pendentes[i];
    var item = document.createElement("div");
    item.className = "card mb-2 card-tarefa";
    item.innerHTML = "<div class='card-body p-2'>" +
      "<div class='d-flex justify-content-between align-items-start'>" +
        "<div><strong>" + escapeHtml(t.titulo) + "</strong><br><small class='text-muted'>" +
        escapeHtml(t.responsavel) + " • " + escapeHtml(t.dataInicio) + " → " + escapeHtml(t.dataFim) +
        "</small></div>" +
        "<div class='text-end'><small class='badge bg-secondary'>" + escapeHtml(t.prioridade) + "</small></div>" +
      "</div>" +
      "<div class='mt-2 small text-truncate'>" + escapeHtml(t.observacao || "—") + "</div>" +
      "<div class='mt-2 d-flex gap-2'>" +
        "<button class='btn btn-success btn-sm btn-concluir' data-i='" + i + "'>Concluir</button>" +
        "<button class='btn btn-warning btn-sm btn-editar' data-i='" + i + "'>Editar</button>" +
      "</div></div>";
    listaPendentes.appendChild(item);
  }

  for (var j = 0; j < Banco.feitas.length; j++) {
    var f = Banco.feitas[j];
    var item2 = document.createElement("div");
    item2.className = "card mb-2 card-tarefa";
    item2.innerHTML = "<div class='card-body p-2'>" +
      "<div class='d-flex justify-content-between align-items-start'>" +
        "<div><strong>" + escapeHtml(f.titulo) + "</strong><br><small class='text-muted'>" +
        escapeHtml(f.responsavel) + " • " + escapeHtml(f.dataInicio) + " → " + escapeHtml(f.dataFim) +
        "</small></div>" +
        "<div class='text-end'><small class='badge bg-secondary'>" + escapeHtml(f.prioridade) + "</small></div>" +
      "</div>" +
      "<div class='mt-2 small text-truncate'>" + escapeHtml(f.observacao || "—") + "</div>" +
      "<div class='mt-2 d-flex gap-2'>" +
        "<button class='btn btn-danger btn-sm btn-excluir' data-i='" + j + "'>Excluir</button>" +
      "</div></div>";
    listaConcluidas.appendChild(item2);
  }

  if (contadorPendentes) contadorPendentes.textContent = Banco.pendentes.length;
  if (contadorConcluidas) contadorConcluidas.textContent = Banco.feitas.length;

  var btnsConcluir = document.querySelectorAll(".btn-concluir");
  btnsConcluir.forEach(function(b) {
    b.onclick = function() {
      var idx = parseInt(this.dataset.i, 10);
      marcarConcluida(idx);
    };
  });

  var btnsEditar = document.querySelectorAll(".btn-editar");
  btnsEditar.forEach(function(b) {
    b.onclick = function() {
      var idx = parseInt(this.dataset.i, 10);
      editarPendente(idx);
    };
  });

  var btnsExcluir = document.querySelectorAll(".btn-excluir");
  btnsExcluir.forEach(function(b) {
    b.onclick = function() {
      var idx = parseInt(this.dataset.i, 10);
      excluirConcluida(idx);
    };
  });
}

function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function adicionarTarefaDoFormulario() {
  if (!campoTitulo || !campoDataInicio || !campoDataFim) {
    mostrarMensagem("Campos do formulário não encontrados.");
    return;
  }
  var titulo = campoTitulo.value.trim();
  var responsavel = (campoResponsavel ? campoResponsavel.value.trim() : "");
  var inicio = campoDataInicio.value;
  var fim = campoDataFim.value;
  var prioridade = (campoPrioridade ? campoPrioridade.value : "baixa");
  var observacao = (campoObservacao ? campoObservacao.value.trim() : "");

  if (!titulo || !inicio || !fim) {
    mostrarMensagem("Preencha título, data início e data final.");
    return;
  }

  var tarefa = {
    titulo: titulo,
    responsavel: responsavel,
    dataInicio: inicio,
    dataFim: fim,
    prioridade: prioridade,
    observacao: observacao
  };

  Banco.pendentes.unshift(tarefa);
  renderizarListas();
}

function marcarConcluida(indice) {
  var t = Banco.pendentes[indice];
  if (!t) return;
  Banco.pendentes.splice(indice, 1);
  Banco.feitas.unshift(t); 
  renderizarListas();
}

function editarPendente(indice) {
  var t = Banco.pendentes[indice];
  if (!t) return;
 
  if (campoId) campoId.value = "editar"; 
  campoTitulo.value = t.titulo;
  if (campoResponsavel) campoResponsavel.value = t.responsavel;
  campoDataInicio.value = t.dataInicio;
  campoDataFim.value = t.dataFim;
  if (campoPrioridade) campoPrioridade.value = t.prioridade;
  if (campoObservacao) campoObservacao.value = t.observacao;

  Banco.pendentes.splice(indice, 1);
  renderizarListas();
}

function excluirConcluida(indice) {
  Banco.feitas.splice(indice, 1);
  renderizarListas();
}

function salvarNoLocal() {
  var obj = {
    pendentes: Banco.pendentes,
    feitas: Banco.feitas
  };
  localStorage.setItem(CHAVE, JSON.stringify(obj));
  mostrarMensagem("Dados gravados no localStorage.");
}

function carregarDoLocal() {
  var raw = localStorage.getItem(CHAVE);
  if (!raw) {
    mostrarMensagem("Nenhum dado salvo no localStorage.");
    return;
  }

  try {
    var obj = JSON.parse(raw);

    Banco.pendentes = Array.isArray(obj.pendentes) ? obj.pendentes : [];

    Banco.feitas = [];

    renderizarListas();
    mostrarMensagem("Pendentes recuperadas. Concluídas mantidas apenas no localStorage.");
  } catch (e) {
    console.error("Erro ao ler localStorage:", e);
    mostrarMensagem("Erro ao recuperar dados (ver console).");
  }
}

function limparLocalStorage() {
  localStorage.removeItem(CHAVE);
  mostrarMensagem("LocalStorage limpo (dados removidos).");
}

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    adicionarTarefaDoFormulario();
  });
} else {
}

if (botaoGravar) botaoGravar.onclick = salvarNoLocal;
if (botaoRecuperar) botaoRecuperar.onclick = carregarDoLocal;
if (botaoLimpar) botaoLimpar.onclick = limparLocalStorage;
if (botaoLimparForm) botaoLimparForm.onclick = function() {
  if (form) form.reset();
  if (campoId) campoId.value = "";
  mostrarMensagem("Formulário limpo.");
}

window.addEventListener("load", function() {
  carregarDoLocal();
  renderizarListas();
});
