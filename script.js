    /* --- JAVASCRIPT LOGIC --- */

    // Data Storage
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Initialize App
    window.onload = () => {
        renderFinance();
        renderTasks();
    };

    // Page Switcher
    function switchPage(page, el) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        document.getElementById(page + '-page').classList.add('active-page');
        el.classList.add('active');

        const title = page === 'finance' ? 'កាបូបលុយរបស់ខ្ញុំ' : 'បញ្ជីការងារត្រូវធ្វើ';
        document.getElementById('header-title').innerText = title;
        updateStats();
    }

    // Finance Functions
    function saveTransaction(type) {
        const desc = document.getElementById('fin-desc').value;
        let amount = parseFloat(document.getElementById('fin-amount').value);

        if (!desc || !amount) return alert("សូមបញ្ចូលព័ត៌មានឱ្យគ្រប់!");
        
        if (type === 'out') amount = -Math.abs(amount);

        transactions.push({ id: Date.now(), desc, amount });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        document.getElementById('fin-desc').value = '';
        document.getElementById('fin-amount').value = '';
        renderFinance();
    }

    function renderFinance() {
        const list = document.getElementById('finance-list');
        list.innerHTML = '';
        let total = 0;

        transactions.slice().reverse().forEach(item => {
            total += item.amount;
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <span>${item.desc}</span>
                <span class="${item.amount > 0 ? 'amount-pos' : 'amount-neg'}">
                    ${item.amount > 0 ? '+' : ''}${item.amount.toFixed(2)} $
                </span>
            `;
            list.appendChild(div);
        });

        document.getElementById('main-stat').innerText = `$ ${total.toFixed(2)}`;
    }

    // Time Functions
    function saveTask() {
        const name = document.getElementById('task-name').value;
        if (!name) return;

        tasks.push({ id: Date.now(), name, status: 'pending' });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        document.getElementById('task-name').value = '';
        renderTasks();
    }

    function renderTasks() {
        const list = document.getElementById('task-list');
        list.innerHTML = '';
        tasks.forEach((task, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <span>${task.name}</span>
                <button onclick="deleteTask(${index})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>
            `;
            list.appendChild(div);
        });
        updateStats();
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function updateStats() {
        const activePage = document.querySelector('.active-page').id;
        if (activePage === 'finance-page') {
            renderFinance();
        } else {
            document.getElementById('main-stat').innerText = `${tasks.length} ការងារ`;
        }
    }