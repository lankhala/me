const STAGES = [
    "ក្រុមថ្មី", "បង្កើតហ្វាល់ដាក់ឈ្មោះក្រុម", "បានចាប់ផ្តើមឌីហ្សាញ", 
    "ពិនិត្យ", "បានឆ្លងឌីហ្សាញ", "កែសម្រួល", "បញ្ជាក់ឌីហ្សាញ", 
    "ស្រង់បញ្ជី", "បញ្ជាក់បញ្ជី", "រៀបទំហំ", "ធ្វើផ្ទាំងសង្ខេប", 
    "ព្រីន", "ការងាររួចរាល់"
];

let tasks = JSON.parse(localStorage.getItem('khala_pro_v2')) || [];

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

// Load Saved Theme
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

function initBoard() {
    const board = document.getElementById('taskBoard');
    board.innerHTML = '';
    STAGES.forEach((stage, index) => {
        const col = document.createElement('div');
        col.className = 'stage-col';
        col.id = `col-${index}`; // ដាក់ ID ងាយស្រួល Scroll ទៅកាន់
        col.innerHTML = `<p>${stage}</p><div id="stage-${index}" class="task-list"></div>`;
        board.appendChild(col);
    });
    render();
}

function render() {
    STAGES.forEach((_, index) => {
        const el = document.getElementById(`stage-${index}`);
        if(el) el.innerHTML = '';
    });
    const historyList = document.getElementById('historyList');
    if(historyList) historyList.innerHTML = '';

    tasks.forEach(task => {
        if (task.isFinished) { renderHistoryItem(task); } 
        else { renderTaskCard(task); }
    });
}

function renderTaskCard(task) {
    const container = document.getElementById(`stage-${task.stage}`);
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
        <strong>${task.title}</strong>
        <p style="font-size: 0.85rem; opacity: 0.8; margin: 8px 0;">${task.desc || ''}</p>
        <button class="btn-next" onclick="changeStage('${task.id}', 1)">${task.stage === 12 ? '✅ បញ្ចប់' : 'បន្ទាប់ ➡️'}</button>
        ${task.stage > 0 ? `<button class="btn-prev" onclick="changeStage('${task.id}', -1)">⬅️ ថយក្រោយ</button>` : ''}
    `;
    container.appendChild(card);
}

function changeStage(id, direction) {
    const task = tasks.find(t => t.id === id);
    if (direction === 1) {
        if (task.stage < 12) {
            task.stage++;
            scrollToColumn(task.stage); // រំកិលអេក្រង់ទៅតាម
        } else {
            task.isFinished = true;
            task.endDate = new Date().toLocaleString();
        }
    } else {
        task.stage--;
        scrollToColumn(task.stage); // រំកិលអេក្រង់ថយមកវិញ
    }
    save();
}

// មុខងាររំកិលអេក្រង់ (Auto Scroll)
function scrollToColumn(stageIndex) {
    const col = document.getElementById(`col-${stageIndex}`);
    const wrapper = document.getElementById('boardWrapper');
    if (col && wrapper) {
        const offset = col.offsetLeft - (wrapper.clientWidth / 2) + (col.clientWidth / 2);
        wrapper.scrollTo({ left: offset, behavior: 'smooth' });
    }
}

function renderHistoryItem(task) {
    const historyList = document.getElementById('historyList');
    const item = document.createElement('div');
    item.className = 'task-card';
    item.innerHTML = `<strong>✅ ${task.title}</strong><p>${task.desc}</p>
        <small>បញ្ចប់៖ ${task.endDate}</small><br>
        <button class="btn-next" style="width:auto; padding:5px 15px;" onclick="restoreTask('${task.id}')">🔄 យកមកវិញ</button>`;
    historyList.appendChild(item);
}

window.restoreTask = (id) => {
    const task = tasks.find(t => t.id === id);
    task.isFinished = false;
    task.stage = 0;
    save();
};

function save() {
    localStorage.setItem('khala_pro_v2', JSON.stringify(tasks));
    render();
}

document.getElementById('taskForm').onsubmit = (e) => {
    e.preventDefault();
    tasks.push({ id: Date.now().toString(), title: document.getElementById('taskTitle').value, desc: document.getElementById('taskDesc').value, stage: 0, isFinished: false });
    e.target.reset();
    save();
};

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-btn, .view-section').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.view + 'View').classList.add('active');
    };
});

initBoard();