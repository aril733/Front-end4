const STORAGE_KEY = "todoVariant:v1";

const App = {
  state: { tasks: {}, order: [] },

  init() {
    this.cache();
    this.bind();
    this.loadFromStorage(false); 
    this.updateLists();
  },

  cache() {
    this.$form = document.getElementById("taskForm");
    this.$title = document.getElementById("title");
    this.$responsible = document.getElementById("responsible");
    this.$startDate = document.getElementById("startDate");
    this.$endDate = document.getElementById("endDate");
    this.$priority = document.getElementById("priority");
    this.$note = document.getElementById("note");
    this.$taskId = document.getElementById("taskId");

    this.$pendingList = document.getElementById("pendingList");
    this.$doneList = document.getElementById("doneList");

    this.$pendingCount = document.getElementById("pendingCount");
    this.$doneCount = document.getElementById("doneCount");

    this.$saveAll = document.getElementById("saveAllBtn");
    this.$loadAll = document.getElementById("loadAllBtn");
    this.$clearAll = document.getElementById("clearAllBtn");

    this.$reset = document.getElementById("resetFormBtn");
  },

  bind() {
    this.$form.addEventListener("submit", e => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.$reset.addEventListener("click", () => this.resetForm());

    this.$saveAll.addEventListener("click", () => this.saveStorage());
    this.$loadAll.addEventListener("click", () => this.loadFromStorage(true));
    this.$clearAll.addEventListener("click", () => this.clearStorage());
  },

  handleSubmit() {
    const id = this.$taskId.value || this.generateId();

    const task = {
      id,
      title: this.$title.value.trim(),
      responsible: this.$responsible.value,
      startDate: this.$startDate.value,
      endDate: this.$endDate.value,
      priority: this.$priority.value,
      note: this.$note.value,
      done: false,
      createdAt: new Date().toISOString()
    };

    this.state.tasks[id] = task;

    if (!this.state.order.includes(id)) {
      this.state.order.unshift(id);
    }

    this.updateLists();
    this.resetForm();
  },

  generateId() {
    return "t_" + Math.random().toString(36).slice(2, 9);
  },

  resetForm() {
    this.$form.reset();
    this.$taskId.value = "";
  },

  updateLists() {
    this.$pendingList.innerHTML = "";
    this.$doneList.innerHTML = "";

    const pending = [];
    const done = [];

    this.state.order.forEach(id => {
      const t = this.state.tasks[id];
      if (!t) return;

      if (t.done) done.push(t);
      else pending.push(t);
    });

    this.$pendingCount.textContent = pending.length;
    this.$doneCount.textContent = done.length;

    pending.forEach(t => this.$pendingList.appendChild(this.card(t)));
    done.forEach(t => this.$doneList.appendChild(this.card(t)));
  },

  card(task) {
    const div = document.createElement("div");
    div.className = "card mb-2 card-task";

    div.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div>
            <div class="task-title">${task.title}</div>
            <small class="text-muted">${task.responsible} • ${task.startDate} → ${task.endDate}</small>
          </div>
          <span class="badge bg-secondary">${task.priority.toUpperCase()}</span>
        </div>

        <p class="small text-muted mt-2">${task.note || "Sem observações"}</p>

        <div class="d-flex gap-2 mt-2">
          ${task.done
            ? `<button class="btn btn-danger btn-sm" data-id="${task.id}" data-act="delete">Excluir</button>`
            : `
              <button class="btn btn-success btn-sm" data-id="${task.id}" data-act="done">Marcar feita</button>
              <button class="btn btn-warning btn-sm" data-id="${task.id}" data-act="edit">Editar</button>
            `
          }
        </div>
      </div>
    `;

    div.querySelectorAll("button").forEach(btn =>
      btn.addEventListener("click", () => this.handleAction(btn.dataset))
    );

    return div;
  },

  handleAction({ id, act }) {
    if (act === "done") {
      this.state.tasks[id].done = true;
    }

    if (act === "delete") {
      delete this.state.tasks[id];
      this.state.order = this.state.order.filter(x => x !== id);
    }

    if (act === "edit") {
      const t = this.state.tasks[id];
      this.$taskId.value = t.id;
      this.$title.value = t.title;
      this.$responsible.value = t.responsible;
      this.$startDate.value = t.startDate;
      this.$endDate.value = t.endDate;
      this.$priority.value = t.priority;
      this.$note.value = t.note;
    }

    this.updateLists();
  },

  saveStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    alert("Dados gravados!");
  },

  loadFromStorage(showAlert = false) {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      if (showAlert) alert("Nenhum dado salvo!");
      return;
    }

    this.state = JSON.parse(raw);
    this.updateLists();

    if (showAlert) alert("Dados recuperados!");
  },

  clearStorage() {
    if (!confirm("Tem certeza que deseja apagar TODOS os dados do armazenamento?")) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    this.state = { tasks: {}, order: [] };
    this.updateLists();
    alert("Todos os dados foram apagados!");
  }
};

App.init();
