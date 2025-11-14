const CHAVE_ARMAZENAMENTO = "tarefasSalvas:v1";

const App = {
  estado: { tarefas: {}, ordem: [] },

  init() {
    this.pegarElementos();
    this.adicionarEventos();
    this.carregarDoStorage(false);
    this.atualizarListas();
  },

  pegarElementos() {
    // Formulário
    this.$formulario = document.getElementById("formularioTarefa");
    this.$campoTitulo = document.getElementById("campoTitulo");
    this.$campoResponsavel = document.getElementById("campoResponsavel");
    this.$campoDataInicio = document.getElementById("campoDataInicio");
    this.$campoDataFim = document.getElementById("campoDataFim");
    this.$campoPrioridade = document.getElementById("campoPrioridade");
    this.$campoObservacao = document.getElementById("campoObservacao");
    this.$campoId = document.getElementById("campoId");

    // Listas
    this.$listaPendentes = document.getElementById("listaPendentes");
    this.$listaConcluidas = document.getElementById("listaConcluidas");

    // Contadores
    this.$contadorPendentes = document.getElementById("contadorPendentes");
    this.$contadorConcluidas = document.getElementById("contadorConcluidas");

    // Botões
    this.$botaoGravar = document.getElementById("botaoGravar");
    this.$botaoRecuperar = document.getElementById("botaoRecuperar");
    this.$botaoLimpar = document.getElementById("botaoLimpar");
    this.$botaoLimparFormulario = document.getElementById("botaoLimparFormulario");
  },

  adicionarEventos() {
    this.$formulario.addEventListener("submit", e => {
      e.preventDefault();
      this.salvarOuEditarTarefa();
    });

    this.$botaoLimparFormulario.addEventListener("click", () => this.limparFormulario());

    this.$botaoGravar.addEventListener("click", () => this.salvarNoStorage());
    this.$botaoRecuperar.addEventListener("click", () => this.carregarDoStorage(true));
    this.$botaoLimpar.addEventListener("click", () => this.limparStorage());
  },

  salvarOuEditarTarefa() {
    const id = this.$campoId.value || this.gerarId();

    const tarefa = {
      id,
      titulo: this.$campoTitulo.value.trim(),
      responsavel: this.$campoResponsavel.value,
      dataInicio: this.$campoDataInicio.value,
      dataFim: this.$campoDataFim.value,
      prioridade: this.$campoPrioridade.value,
      observacao: this.$campoObservacao.value,
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
    this.$campoId.value = "";
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

    this.$contadorPendentes.textContent = pendentes.length;
    this.$contadorConcluidas.textContent = concluidas.length;

    pendentes.forEach(t => this.$listaPendentes.appendChild(this.criarCard(t)));
    concluidas.forEach(t => this.$listaConcluidas.appendChild(this.criarCard(t)));
  },

  criarCard(tarefa) {
    const card = document.createElement("div");
    card.className = "card mb-2 card-tarefa";

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div>
            <div class="titulo-tarefa">${tarefa.titulo}</div>
            <small class="text-muted">${tarefa.responsavel} • ${tarefa.dataInicio} → ${tarefa.dataFim}</small>
          </div>
          <span class="badge bg-secondary">${tarefa.prioridade.toUpperCase()}</span>
        </div>

        <p class="small text-muted mt-2">${tarefa.observacao || "Sem observações"}</p>

        <div class="d-flex gap-2 mt-2">
          ${tarefa.concluida
            ? `<button class="btn btn-danger btn-sm" data-id="${tarefa.id}" data-acao="excluir">Excluir</button>`
            : `
              <button class="btn btn-success btn-sm" data-id="${tarefa.id}" data-acao="concluir">Concluir</button>
              <button class="btn btn-warning btn-sm" data-id="${tarefa.id}" data-acao="editar">Editar</button>
            `}
        </div>
      </div>
    `;

    card.querySelectorAll("button").forEach(btn =>
      btn.addEventListener("click", () => this.executarAcao(btn.dataset))
    );

    return card;
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
      this.$campoId.value = t.id;
      this.$campoTitulo.value = t.titulo;
      this.$campoResponsavel.value = t.responsavel;
      this.$campoDataInicio.value = t.dataInicio;
      this.$campoDataFim.value = t.dataFim;
      this.$campoPrioridade.value = t.prioridade;
      this.$campoObservacao.value = t.observacao;
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
