(function () {
  "use strict";

  var STORAGE_KEY = "mis-tareas.v1";

  var form = document.getElementById("task-form");
  var input = document.getElementById("task-input");
  var list = document.getElementById("task-list");
  var emptyState = document.getElementById("empty-state");
  var taskCount = document.getElementById("task-count");
  var clearCompletedBtn = document.getElementById("clear-completed");
  var filterButtons = document.querySelectorAll(".filters__btn");

  var tasks = loadTasks();
  var currentFilter = "all";

  // ---- Persistence ----
  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      /* storage unavailable or full — fail silently */
    }
  }

  // ---- Helpers ----
  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getFilteredTasks() {
    if (currentFilter === "active") {
      return tasks.filter(function (t) { return !t.completed; });
    }
    if (currentFilter === "completed") {
      return tasks.filter(function (t) { return t.completed; });
    }
    return tasks;
  }

  // ---- Rendering ----
  function render() {
    var filtered = getFilteredTasks();
    list.innerHTML = "";

    filtered.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task" + (task.completed ? " is-completed" : "");
      li.dataset.id = task.id;

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task__checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", "Marcar como completada");

      var text = document.createElement("span");
      text.className = "task__text";
      text.textContent = task.text;

      var del = document.createElement("button");
      del.type = "button";
      del.className = "task__delete";
      del.setAttribute("aria-label", "Eliminar tarea");
      del.innerHTML = "&times;";

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(del);
      list.appendChild(li);
    });

    var hasTasks = tasks.length > 0;
    emptyState.hidden = filtered.length > 0;
    if (!hasTasks) {
      emptyState.textContent = "No hay tareas aquí. ¡Agrega la primera! 🎯";
    } else if (filtered.length === 0) {
      emptyState.textContent = "No hay tareas en este filtro.";
    }

    updateCount();
  }

  function updateCount() {
    var pending = tasks.filter(function (t) { return !t.completed; }).length;
    var label = pending === 1 ? "1 tarea pendiente" : pending + " tareas pendientes";
    taskCount.textContent = tasks.length === 0 ? "0 tareas" : label;
  }

  // ---- Actions ----
  function addTask(textValue) {
    var text = textValue.trim();
    if (!text) return;
    tasks.push({ id: createId(), text: text, completed: false });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map(function (t) {
      return t.id === id ? Object.assign({}, t, { completed: !t.completed }) : t;
    });
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(function (t) { return !t.completed; });
    saveTasks();
    render();
  }

  // ---- Events ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addTask(input.value);
    input.value = "";
    input.focus();
  });

  list.addEventListener("click", function (e) {
    var li = e.target.closest(".task");
    if (!li) return;
    var id = li.dataset.id;

    if (e.target.classList.contains("task__checkbox")) {
      toggleTask(id);
    } else if (e.target.closest(".task__delete")) {
      deleteTask(id);
    }
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.dataset.filter;
      filterButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });
      render();
    });
  });

  // ---- Init ----
  render();
})();
