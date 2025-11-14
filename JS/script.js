const CHAVE_ARMAZENAMENTO = "tarefasSalvas:v1";

const App = {
  estado: { tarefas: {}, ordem: [] },

  init() {
    this.cachearElementos();
    this.vincularEventos();
    this.carregarDoStorage(false);
    this.atualizarListas();
  },

  cachearElementos() {
    this.$formulario = document.getElementById("formTarefa");
    this.$titulo = document.getElementById("titulo");
    this.$responsavel = document.getElementById("responsavel");
    this.$dataInicio = document.getElementById("dataInicio");
    this.$dataFim = document.getElementById("dataFim");
    this.$prioridade = document.getElementById("prioridade");
    this.$anotacao = document.getElementById("anotacao");
    this.$idTarefa = document.getElementById("idTarefa");

    this.$listaPendentes = document.getElementById("listaPendentes");
    this.$listaConcluidas = document.getElementById("listaConcluidas");

    this.$qtdPendentes = document.getElementById("qtdPendentes");
    this.$qtdConcluidas = document.getElementById("qtdConcluidas");

    this.$btnSalvar = document.getElementById("btnSalvar");
    this.$btnRecuperar = document.getElementById("btnRecuperar");
    this.$btnLimpar = document.getElementById("btnLimpar");

    this.$btnZerarForm = document.getElementById("btnZerarForm");
  },

  vincularEventos() {
    this.$formulario.addEventListener("submit", e => {
      e.preventDefault();
      this.salvarOuEditarTarefa();
    });

    this.$btnZerarForm.addEventListener("click", () => this.limparFormulario());

    this.$btnSalvar.addEventListener("click", () => this.salvarNoStorage());
    this.$btnRecuperar.addEventListener("click", () => this.carregarDoStorage(true));
    this.$btnLimpar.addEventListener("click", () => this.limparStorage());
  },

  salvarOuEditarTarefa() {
    const id = this.$idTarefa.value || this.gerarId();

    const tarefa = {
      id,
      titulo: this.$titulo.value.trim(),
      responsavel: this.$responsavel.value,
      dataInicio: this.$dataInicio.value,
      dataFim: this.$dataFim.value,
      prioridade: this.$prioridade.value,
      anotacao: this.$anotacao.value,
      concluida: false,
      criadaEm: new Date().toISOString()
    };

    this.estado.tarefas[id] = tarefa;

    if (!this.estado.ordem.includes(id)) {
      this.estado.ordem.unshift(id);
    }

    this.atualizarListas();
    this.limparFormulario();
  },

  gerarId() {
    return "id_" + Math.random().toString(36).slice(2, 9);
  },

  limparFormulario() {
    this.$formulario.reset();
    this.$idTarefa.value = "";
  },

  atualizarListas() {
    this.$listaPendentes.innerHTML = "";
    this.$listaConcluidas.innerHTML = "";

    const pendentes = [];
    const concluidas = [];

    this.estado.ordem.forEach(id => {
      const t = this.estado.tarefas[id];
      if (!t) return;

      if (t.concluida) concluidas.push(t);
      else pendentes.push(t);
    });

    this.$qtdPendentes.textContent = pendentes.length;
    this.$qtdConcluidas.textContent = concluidas.length;

    pendentes.forEach(t => this.$listaPendentes.appendChild(this.criarCard(t)));
    concluidas.forEach(t => this.$listaConcluidas.appendChild(this.criarCard(t)));
  },

  criarCard(tarefa) {
    const div = document.createElement("div");
    div.className = "card mb-2 card-tarefa";

    div.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div>
            <div class="titulo-tarefa">${tarefa.titulo}</div>
            <small class="text-muted">${tarefa.responsavel} • ${tarefa.dataInicio} → ${tarefa.dataFim}</small>
          </div>
          <span class="badge bg-secondary">${tarefa.prioridade.toUpperCase()}</span>
        </div>

        <p class="small text-muted mt-2">${tarefa.anotacao || "Sem observações"}</p>

        <div class="d-flex gap-2 mt-2">
          ${tarefa.concluida
            ? `<button class="btn btn-danger btn-sm" data-id="${tarefa.id}" data-acao="excluir">Excluir</button>`
            : `
              <button class="btn btn-success btn-sm" data-id="${tarefa.id}" data-acao="concluir">Concluir</button>
              <button class="btn btn-warning btn-sm" data-id="${tarefa.id}" data-acao="editar">Editar</button>
            `
          }
        </div>
      </div>
    `;

    div.querySelectorAll("button").forEach(btn =>
      btn.addEventListener("click", () => this.executarAcao(btn.dataset))
    );

    return div;
  },

  executarAcao({ id, acao }) {
    if (acao === "concluir") {
      this.estado.tarefas[id].concluida = true;
    }

    if (acao === "excluir") {
      delete this.estado.tarefas[id];
      this.estado.ordem = this.estado.ordem.filter(x => x !== id);
    }

    if (acao === "editar") {
      const t = this.estado.tarefas[id];
      this.$idTarefa.value = t.id;
      this.$titulo.value = t.titulo;
      this.$responsavel.value = t.responsavel;
      this.$dataInicio.value = t.dataInicio;
      this.$dataFim.value = t.dataFim;
      this.$prioridade.value = t.prioridade;
      this.$anotacao.value = t.anotacao;
    }

    this.atualizarListas();
  },

  salvarNoStorage() {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(this.estado));
    alert("Tarefas salvas!");
  },

  carregarDoStorage(alertar = false) {
    const dados = localStorage.getItem(CHAVE_ARMAZENAMENTO);

    if (!dados) {
      if (alertar) alert("Nenhum dado salvo!");
      return;
    }

    this.estado = JSON.parse(dados);
    this.atualizarListas();

    if (alertar) alert("Tarefas recuperadas!");
  },

  limparStorage() {
    if (!confirm("Deseja apagar TODOS os dados salvos?")) return;

    localStorage.removeItem(CHAVE_ARMAZENAMENTO);
    this.estado = { tarefas: {}, ordem: [] };
    this.atualizarListas();

    alert("Todos os dados foram apagados!");
  }
};

App.init();
