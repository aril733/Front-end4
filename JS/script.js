var Banco = {
  pendentes: [],
  feitas: []
};

function pegarEl(id1, id2) {
  return document.getElementById(id1) || (id2 ? document.getElementById(id2) : null);
}

var form = pegarEl("formTarefa", "formularioTarefa");
var campoId = pegarEl("idTarefa", "campoId");
var campoTitulo = pegarEl("campoTitulo", "title");
var campoResponsavel = pegarEl("campoResponsavel", "responsible");
var campoDataInicio = pegarEl("campoDataInicio", "startDate");
var campoDataFim = pegarEl("campoDataFim", "endDate");
var campoPrioridade = pegarEl("campoPrioridade", "priority");
var campoObservacao = pegarEl("campoObservacao", "note");

var listaPendentes = pegarEl("listaPendentes", "pendingList");
var listaConcluidas = pegarEl("listaConcluidas", "doneList");

var contadorPendentes = pegarEl("contadorPendentes", "pendingCount");
var contadorConcluidas = pegarEl("contadorConcluidas", "doneCount");

var botaoGravar = pegarEl("botaoGravar", "saveAllBtn");
var botaoRecuperar = pegarEl("botaoRecuperar", "loadAllBtn");
var botaoLimpar = pegarEl("botaoLimpar", "clearAllBtn");
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

function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderizarListas() {
  if (!listaPendentes || !listaConcluidas) return;

  listaPendentes.innerHTML = "";
  listaConcluidas.innerHTML = "";

  Banco.pendentes.forEach((t, i) => {
    var item = document.createElement("div");
    item.className = "card mb-2 card-tarefa";
    item.innerHTML =
      "<div class='card-body p-2'>" +
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
  });

  Banco.feitas.forEach((f, j) => {
    var item2 = document.createElement("div");
    item2.className = "card mb-2 card-tarefa";
    item2.innerHTML =
      "<div class='card-body p-2'>" +
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
  });

  if (contadorPendentes) contadorPendentes.textContent = Banco.pendentes.length;
  if (contadorConcluidas) contadorConcluidas.textContent = Banco.feitas.length;

  document.querySelectorAll(".btn-concluir").forEach(btn => {
    btn.onclick = () => marcarConcluida(parseInt(btn.dataset.i));
  });

  document.querySelectorAll(".btn-editar").forEach(btn => {
    btn.onclick = () => editarPendente(parseInt(btn.dataset.i));
  });

  document.querySelectorAll(".btn-excluir").forEach(btn => {
    btn.onclick = () => excluirConcluida(parseInt(btn.dataset.i));
  });
}

function adicionarTarefaDoFormulario() {
  var titulo = campoTitulo.value.trim();
  var inicio = campoDataInicio.value;
  var fim = campoDataFim.value;

  if (!titulo || !inicio || !fim) {
    mostrarMensagem("Preencha título, data início e data final.");
    return;
  }

  var tarefa = {
    titulo: titulo,
    responsavel: campoResponsavel?.value.trim() || "",
    dataInicio: inicio,
    dataFim: fim,
    prioridade: campoPrioridade?.value || "baixa",
    observacao: campoObservacao?.value.trim() || ""
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
  campoResponsavel.value = t.responsavel;
  campoDataInicio.value = t.dataInicio;
  campoDataFim.value = t.dataFim;
  campoPrioridade.value = t.prioridade;
  campoObservacao.value = t.observacao;

  Banco.pendentes.splice(indice, 1);
  renderizarListas();
}

function excluirConcluida(indice) {
  Banco.feitas.splice(indice, 1);
  renderizarListas();
}

function salvarNoLocal() {
  localStorage.setItem("tarefasSalvas:v1", JSON.stringify({
    pendentes: Banco.pendentes,
    feitas: Banco.feitas
  }));

  mostrarMensagem("Dados gravados.");
}

function carregarDoLocal() {
  var raw = localStorage.getItem("tarefasSalvas:v1");

  if (!raw) {
    mostrarMensagem("Nenhum dado salvo.");
    return;
  }

  try {
    var obj = JSON.parse(raw);

    Banco.pendentes = Array.isArray(obj.pendentes) ? obj.pendentes : [];
    Banco.feitas = Array.isArray(obj.feitas) ? obj.feitas : [];

    renderizarListas();
    mostrarMensagem("Dados recuperados.");
  } catch (e) {
    mostrarMensagem("Erro ao carregar.");
  }
}

function limparLocalStorage() {
  localStorage.removeItem("tarefasSalvas:v1");
  mostrarMensagem("LocalStorage limpo.");
}

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    adicionarTarefaDoFormulario();
  });
}

if (botaoGravar) botaoGravar.onclick = salvarNoLocal;
if (botaoRecuperar) botaoRecuperar.onclick = carregarDoLocal;
if (botaoLimpar) botaoLimpar.onclick = limparLocalStorage;

if (botaoLimparForm) {
  botaoLimparForm.onclick = () => {
    if (form) form.reset();
    if (campoId) campoId.value = "";
    mostrarMensagem("Formulário limpo.");
  };
}


window.addEventListener("load", () => {
  carregarDoLocal();
});
