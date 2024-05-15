class TaskStorage {
  constructor() {
    this.tasksKey = "tasks";
  }

  getTasks() {
    const tasks = localStorage.getItem(this.tasksKey);
    return tasks ? JSON.parse(tasks) : [];
  }

  saveTasks(tasks) {
    localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
  }

  addTask(task) {
    const tasks = this.getTasks();
    tasks.push(task);
    this.saveTasks(tasks);
  }
}

class TaskRenderer {
  constructor(taskListElement) {
    this.taskListElement = taskListElement;
  }

  renderTasks(tasks, category, hideDone) {
    this.taskListElement.innerHTML = "";
    tasks
      .filter((task) => task.category === category && (!hideDone || !task.done))
      .forEach((task) => {
        const taskElement = document.createElement("li");
        taskElement.className = "task-item";
        taskElement.innerHTML = `
                      <p class="task-item__title">${task.title}</p>
                      <p class="task-item__description">${task.description}</p>
                      <div class="task-item__checkbox">
                          <div class="checkbox">
                              <input class="custom-checkbox" type="checkbox" id="task-${
                                task.id
                              }" ${task.done ? "checked" : ""}>
                              <label for="task-${task.id}">done</label>
                          </div>
                      </div>
                  `;
        const checkbox = taskElement.querySelector(".custom-checkbox");
        checkbox.addEventListener("change", () => {
          task.done = checkbox.checked;
          localStorage.setItem("tasks", JSON.stringify(tasks));
        });
        this.taskListElement.appendChild(taskElement);
      });
  }
}

class TaskHandler {
  constructor(storage, renderer) {
    this.storage = storage;
    this.renderer = renderer;
    this.currentCategory = "work";
    this.hideDone = false;
    this.modalIsOpened = false;

    this.taskForm = document.getElementById("task-form");
    this.taskTitleInput = document.getElementById("task-title");
    this.taskDescriptionInput = document.getElementById("task-description");
    this.taskModal = document.getElementById("task-modal");
    this.addTaskBtn = document.querySelector(".todo-header__add");
    this.closeBtn = document.querySelector(".close-btn");
    this.categoryButtons = document.querySelectorAll(
      ".sidebar-menu__item button"
    );
    this.hideDoneCheckbox = document.getElementById("hide-done");

    this.addTaskBtn.addEventListener("click", () =>
      !this.modalIsOpened ? this.openModal() : this.closeModal()
    );
    this.closeBtn.addEventListener("click", () => this.closeModal());
    this.taskForm.addEventListener("submit", (e) => this.addTask(e));
    this.hideDoneCheckbox.addEventListener("change", () =>
      this.toggleHideDone()
    );
    this.categoryButtons.forEach((button) =>
      button.addEventListener("click", (e) => {
        this.changeCategory(e);
        this.categoryButtons.forEach((button) =>
          button.classList.remove("active")
        );
        e.target.classList.add("active");
      })
    );
  }

  openModal() {
    this.taskModal.style.display = "block";
    this.modalIsOpened = true;
  }

  closeModal() {
    this.taskModal.style.display = "none";
    this.modalIsOpened = false;
  }

  addTask(e) {
    e.preventDefault();
    const newTask = {
      id: Date.now(),
      title: this.taskTitleInput.value,
      description: this.taskDescriptionInput.value,
      category: this.currentCategory,
      done: false,
    };
    this.storage.addTask(newTask);
    this.renderer.renderTasks(
      this.storage.getTasks(),
      this.currentCategory,
      this.hideDone
    );
    this.taskTitleInput.value = "";
    this.taskDescriptionInput.value = "";
    this.closeModal();
  }

  changeCategory(e) {
    this.currentCategory = e.target.dataset.categoryName;
    this.renderer.renderTasks(
      this.storage.getTasks(),
      this.currentCategory,
      this.hideDone
    );
  }

  toggleHideDone() {
    this.hideDone = this.hideDoneCheckbox.checked;
    this.renderer.renderTasks(
      this.storage.getTasks(),
      this.currentCategory,
      this.hideDone
    );
  }
}

class TodoApp {
  constructor() {
    this.storage = new TaskStorage();
    this.renderer = new TaskRenderer(
      document.querySelector(".todo-content__tasks")
    );
    this.handler = new TaskHandler(this.storage, this.renderer);

    this.renderer.renderTasks(
      this.storage.getTasks(),
      this.handler.currentCategory,
      this.handler.hideDone
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TodoApp();
});
