// Data Management
const tasks = {
    active: [],
    history: []
};

const STORAGE_KEY = 'tasks_management';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDesc = document.getElementById('taskDesc');
const activeList = document.getElementById('activeList');
const historyList = document.getElementById('historyList');
const tabBtns = document.querySelectorAll('.tab-btn');
const taskSections = document.querySelectorAll('.task-section');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTitle = document.getElementById('editTitle');
const editDesc = document.getElementById('editDesc');
const closeModal = document.getElementById('closeModal');
const cancelEdit = document.getElementById('cancelEdit');
const activeCount = document.getElementById('activeCount');
const historyCount = document.getElementById('historyCount');

let editingTaskId = null;
let editingTaskType = null;

// Initialize
function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask();
    });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    closeModal.addEventListener('click', () => closeEditModal());
    cancelEdit.addEventListener('click', () => closeEditModal());
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEdit();
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });
}

// Storage Functions
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        tasks.active = parsed.active || [];
        tasks.history = parsed.history || [];
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Task Management
function addTask() {
    const title = taskTitle.value.trim();
    const desc = taskDesc.value.trim();

    if (!title || !desc) {
        alert('សូមបំពេញឈ្មោះ និងពិពណ៌នាលម្អិត');
        return;
    }

    const task = {
        id: generateId(),
        title,
        desc,
        createdAt: getFormattedDate(),
        completedAt: null
    };

    tasks.active.push(task);
    saveTasks();
    renderTasks();
    taskForm.reset();
    taskTitle.focus();
}

function completeTask(id) {
    const taskIndex = tasks.active.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        const task = tasks.active[taskIndex];
        task.completedAt = getFormattedDate();
        tasks.history.push(task);
        tasks.active.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id, type) {
    if (confirm('តើអ្នកប្រាកដថាចង់លុបកិច្ចការនេះ?')) {
        if (type === 'active') {
            tasks.active = tasks.active.filter(t => t.id !== id);
        } else {
            tasks.history = tasks.history.filter(t => t.id !== id);
        }
        saveTasks();
        renderTasks();
    }
}

function openEditModal(id, type) {
    editingTaskId = id;
    editingTaskType = type;
    const taskList = type === 'active' ? tasks.active : tasks.history;
    const task = taskList.find(t => t.id === id);

    if (task) {
        editTitle.value = task.title;
        editDesc.value = task.desc;
        editModal.classList.remove('hidden');
        editTitle.focus();
    }
}

function closeEditModal() {
    editModal.classList.add('hidden');
    editingTaskId = null;
    editingTaskType = null;
    editForm.reset();
}

function saveEdit() {
    const title = editTitle.value.trim();
    const desc = editDesc.value.trim();

    if (!title || !desc) {
        alert('សូមបំពេញឈ្មោះ និងពិពណ៌នាលម្អិត');
        return;
    }

    const taskList = editingTaskType === 'active' ? tasks.active : tasks.history;
    const task = taskList.find(t => t.id === editingTaskId);

    if (task) {
        task.title = title;
        task.desc = desc;
        saveTasks();
        renderTasks();
        closeEditModal();
    }
}

// Rendering Functions
function renderTasks() {
    renderActiveTasks();
    renderHistoryTasks();
    updateCounts();
}

function updateCounts() {
    activeCount.textContent = tasks.active.length;
    historyCount.textContent = tasks.history.length;
}

function renderActiveTasks() {
    activeList.innerHTML = '';

    if (tasks.active.length === 0) {
        activeList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>មិនមានកិច្ចការ</p>
                <small>ចូលបង្កើតកិច្ចការថ្មីដោយបំពេញកម្រង់ខាងលើ</small>
            </div>
        `;
        return;
    }

    tasks.active.forEach(task => {
        activeList.appendChild(createTaskCard(task, 'active'));
    });
}

function renderHistoryTasks() {
    historyList.innerHTML = '';

    if (tasks.history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>មិនមានកិច្ចការដែលបានបញ្ចប់</p>
            </div>
        `;
        return;
    }

    tasks.history.forEach(task => {
        historyList.appendChild(createTaskCard(task, 'history'));
    });
}

function createTaskCard(task, type) {
    const card = document.createElement('div');
    card.className = `task-card ${type === 'history' ? 'completed' : ''}`;
    
    const completedInfo = task.completedAt 
        ? `<div class="task-date">✅ បានបញ្ចប់: ${task.completedAt}</div>`
        : '';

    const actions = type === 'active'
        ? `
            <div class="task-actions">
                <button class="btn-small btn-complete" onclick="completeTask('${task.id}')">✓ បញ្ចប់</button>
                <button class="btn-small btn-edit" onclick="openEditModal('${task.id}', 'active')">✎ កែ</button>
                <button class="btn-small btn-delete" onclick="deleteTask('${task.id}', 'active')">🗑 លុប</button>
            </div>
        `
        : `
            <div class="task-actions">
                <button class="btn-small btn-edit" onclick="openEditModal('${task.id}', 'history')">✎ កែ</button>
                <button class="btn-small btn-delete" onclick="deleteTask('${task.id}', 'history')">🗑 លុប</button>
            </div>
        `;

    card.innerHTML = `
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-desc">${escapeHtml(task.desc)}</div>
        <div class="task-meta">
            <div class="task-date">📅 បង្កើត: ${task.createdAt}</div>
            ${completedInfo}
        </div>
        ${actions}
    `;

    return card;
}

// Tab Switching
function switchTab(tabName) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    taskSections.forEach(section => section.classList.add('hidden'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.querySelector(`[data-section="${tabName}"]`).classList.remove('hidden');
}

// Start App
init();