// ===== Task Manager: add, complete, delete and persist tasks =====

const STORAGE_KEY = "taskManager.tasks";

const form = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const formError = document.getElementById("formError");
const counter = document.getElementById("counter");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

document.getElementById("today").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
});

// ---------- Storage ----------
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Actions ----------
function addTask(title, priority) {
  tasks.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

// ---------- Rendering ----------
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task priority-${task.priority}` + (task.completed ? " completed" : "");
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.title = "Mark as completed";

  const text = document.createElement("div");
  text.className = "text";
  const title = document.createElement("span");
  title.className = "title";
  title.textContent = task.title;
  const meta = document.createElement("span");
  meta.className = "meta";
  meta.textContent = "Added " + new Date(task.createdAt).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });
  text.append(title, meta);

  const badge = document.createElement("span");
  badge.className = `badge ${task.priority}`;
  badge.textContent = task.priority;

  const del = document.createElement("button");
  del.className = "delete-btn";
  del.innerHTML = "&#10005;";
  del.title = "Delete task";

  li.append(checkbox, text, badge, del);
  return li;
}

function render() {
  const visible = tasks.filter((t) =>
    currentFilter === "all" ? true : currentFilter === "completed" ? t.completed : !t.completed
  );

  taskList.innerHTML = "";
  visible.forEach((t) => taskList.appendChild(createTaskElement(t)));

  const pending = tasks.filter((t) => !t.completed).length;
  counter.textContent = `${pending} pending / ${tasks.length - pending} completed`;
  emptyState.classList.toggle("show", visible.length === 0);
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    formError.textContent = "Please enter a task before adding.";
    taskInput.focus();
    return;
  }
  if (tasks.some((t) => t.title.toLowerCase() === title.toLowerCase() && !t.completed)) {
    formError.textContent = "This task is already in your pending list.";
    return;
  }
  formError.textContent = "";
  addTask(title, priorityInput.value);
  taskInput.value = "";
  taskInput.focus();
});

// Event delegation: one listener handles toggle and delete for every task
taskList.addEventListener("click", (e) => {
  const li = e.target.closest(".task");
  if (!li) return;
  if (e.target.classList.contains("delete-btn")) {
    deleteTask(li.dataset.id);
  } else if (e.target.matches("input[type='checkbox']") || e.target.closest(".text")) {
    toggleTask(li.dataset.id);
  }
});

filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  })
);

document.getElementById("clearCompleted").addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  render();
});

render();
