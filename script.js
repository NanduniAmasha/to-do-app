let confirmCallback = null;
let currentFilter = 'all';

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  updateDarkModeButton();
}

function updateDarkModeButton() {
  let btn = document.querySelector('.dark-mode-btn');
  if (document.body.classList.contains('dark-mode')) {
    btn.textContent = '☀️ Light';
  } else {
    btn.textContent = '🌙 Dark';
  }
}

// Load Dark Mode Preference
function loadDarkMode() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    updateDarkModeButton();
  }
}

// Filter Tasks
function filterTasks(filter) {
  currentFilter = filter;
  
  // Update active button using data-filter attribute
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Filter tasks
  document.querySelectorAll('#taskList li').forEach(li => {
    let isCompleted = li.querySelector('input[type="checkbox"]').checked;
    let shouldShow = false;
    
    if (filter === 'all') {
      shouldShow = true;
    } else if (filter === 'completed') {
      shouldShow = isCompleted;
    } else if (filter === 'pending') {
      shouldShow = !isCompleted;
    }
    
    li.classList.toggle('hidden', !shouldShow);
  });
}

// Custom popup message function
function showPopup(message) {
  document.getElementById("popupMessage").textContent = message;
  document.getElementById("popupOverlay").style.display = "flex";
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
}

// Custom confirm function
function showConfirm(message, callback) {
  document.getElementById("confirmMessage").textContent = message;
  document.getElementById("confirmOverlay").style.display = "flex";
  confirmCallback = callback;
}

function confirmYes() {
  document.getElementById("confirmOverlay").style.display = "none";
  if (confirmCallback) {
    confirmCallback(true);
  }
}

function confirmNo() {
  document.getElementById("confirmOverlay").style.display = "none";
  if (confirmCallback) {
    confirmCallback(false);
  }
}

function saveTasks() {
  let tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    let span = li.querySelector("span");
    let checkbox = li.querySelector("input[type='checkbox']");
    tasks.push({
      text: span.textContent,
      completed: checkbox.checked
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => {
    let li = document.createElement("li");
    li.innerHTML = `
      <div class="left">
        <input type="checkbox" onclick="toggleComplete(this)" ${task.completed ? 'checked' : ''}>
        <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
      </div>

      <div class="icons">
        <i class="bx bx-edit ${task.completed ? 'disabled' : ''}" onclick="editTask(this)"></i>
        <i class="bx bx-trash" onclick="deleteTask(this)"></i>
      </div>
    `;
    document.getElementById("taskList").appendChild(li);
  });
  // Apply current filter
  filterTasks(currentFilter);
}

let editSpan = null;

// Custom edit modal function
function showEdit(span) {
  editSpan = span;
  document.getElementById("editMessage").textContent = "Edit your task:";
  document.getElementById("editInput").value = span.textContent;
  document.getElementById("editOverlay").style.display = "flex";
  document.getElementById("editInput").focus();
}

function saveEdit() {
  let newTask = document.getElementById("editInput").value;
  
  if (newTask === "") {
    showPopup("⚠ Task cannot be empty!");
    return;
  }
  
  editSpan.textContent = newTask;
  document.getElementById("editOverlay").style.display = "none";
  saveTasks();
  filterTasks(currentFilter);
  showPopup("✓ Task updated successfully!");
}

function closeEdit() {
  document.getElementById("editOverlay").style.display = "none";
}

function addTask() {
  let input = document.getElementById("newTask");
  let task = input.value;

  if (task.trim() === "") {
    showPopup("Please Enter a Task");
    return;
  }

  let li = document.createElement("li");

  li.innerHTML = `
    <div class="left">
      <input type="checkbox" onclick="toggleComplete(this)">
      <span>${task}</span>
    </div>

    <div class="icons">
      <i class="bx bx-edit" onclick="editTask(this)"></i>
      <i class="bx bx-trash" onclick="deleteTask(this)"></i>
    </div>
  `;

  document.getElementById("taskList").appendChild(li);
  input.value = "";
  saveTasks();
  
  // Reapply filter to show newly added task
  filterTasks(currentFilter);
  
  showPopup("✓ Task added successfully!");
}

function deleteTask(icon) {
  showConfirm("Are you sure you want to delete this task?", function(confirmed) {
    if (confirmed) {
      icon.parentElement.parentElement.remove();
      saveTasks();
      filterTasks(currentFilter);
      showPopup("✓ Task deleted successfully!");
    }
  });
}

function editTask(icon) {
  if (icon.classList.contains("disabled")) {
    return;
  }
  
  let span = icon.parentElement.parentElement.querySelector("span");
  showEdit(span);
}

function toggleComplete(checkbox) {
  let span = checkbox.nextElementSibling;
  let editIcon = checkbox.parentElement.parentElement.querySelector(".bx-edit");
  
  span.classList.toggle("completed");
  editIcon.classList.toggle("disabled");
  saveTasks();
  
  // Reapply filter
  filterTasks(currentFilter);
  
  if (span.classList.contains("completed")) {
    showPopup("✓ Task marked as completed!");
  } else {
    showPopup("↩ Task marked as incomplete!");
  }
}

// Load tasks and dark mode when page loads
window.onload = function() {
  loadDarkMode();
  loadTasks();
};

document.getElementById("newTask").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addTask();
  }
});