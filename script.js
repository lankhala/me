// Data Management
let teams = [];
let currentTeamId = null;
let currentFilterStatus = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTeamsFromStorage();
    renderTeamsList();
});

// Load teams from localStorage
function loadTeamsFromStorage() {
    const stored = localStorage.getItem('teams');
    if (stored) {
        teams = JSON.parse(stored);
    }
}

// Save teams to localStorage
function saveTeamsToStorage() {
    localStorage.setItem('teams', JSON.stringify(teams));
    renderTeamsList();
}

// Add Team
function addTeam() {
    const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
    const teamName = document.getElementById('teamName').value.trim();
    const memberCount = parseInt(document.getElementById('memberCount').value);
    const status = document.getElementById('status').value;
    const teamClass = document.getElementById('teamClass').value.trim();

    if (!invoiceNumber || !teamName || !memberCount || !teamClass) {
        alert('សូមបំពេញព័ត៌មានលម្អិតទាំងអស់');
        return;
    }

    const team = {
        id: Date.now(),
        invoiceNumber,
        teamName,
        memberCount,
        status,
        teamClass,
        members: Array(memberCount).fill(''),
        createdDate: new Date().toLocaleDateString('km-KH'),
        coverage: '',
        updatedDate: new Date().toLocaleDateString('km-KH')
    };

    teams.push(team);
    saveTeamsToStorage();

    // Show members input section
    currentTeamId = team.id;
    showMembersInput(memberCount);

    // Clear form
    document.getElementById('invoiceNumber').value = '';
    document.getElementById('teamName').value = '';
    document.getElementById('memberCount').value = '';
    document.getElementById('status').value = 'រង់ចាំ';
    document.getElementById('teamClass').value = '';
}

// Show members input
function showMembersInput(count) {
    const section = document.getElementById('membersSection');
    const list = document.getElementById('membersList');
    
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="member-input-group">
                <span>${i + 1}</span>
                <input type="text" placeholder="ឈ្មោះសមាជិក" id="member-${i}">
            </div>
        `;
    }
    
    list.innerHTML = html;
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}

// Save members names
function saveMembersNames() {
    if (currentTeamId) {
        const team = teams.find(t => t.id === currentTeamId);
        if (team) {
            for (let i = 0; i < team.memberCount; i++) {
                const input = document.getElementById(`member-${i}`);
                team.members[i] = input ? input.value.trim() : '';
            }
            team.updatedDate = new Date().toLocaleDateString('km-KH');
            saveTeamsToStorage();
            
            // Reset
            currentTeamId = null;
            document.getElementById('membersSection').style.display = 'none';
            alert('✅ រក្សាឈ្មោះសមាជិកបានដោយជោគជ័យ');
        }
    }
}

// Filter teams
function filterTeams(status) {
    currentFilterStatus = status;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTeamsList();
}

// Render teams list
function renderTeamsList() {
    const list = document.getElementById('teamsList');
    
    let filtered = teams;
    if (currentFilterStatus !== 'all') {
        filtered = teams.filter(t => t.status === currentFilterStatus);
    }

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 30px;">មិនមានក្រុមនៅដែរ</p>';
        return;
    }

    let html = '';
    filtered.forEach(team => {
        const completedMembers = team.members.filter(m => m).length;
        html += `
            <div class="team-card status-${team.status.replace(/\s+/g, '-')}" onclick="openTeamModal(${team.id})">
                <div class="team-info">
                    <h3>${team.invoiceNumber} - ${team.teamName}</h3>
                    <p><strong>ឈុត:</strong> ${team.teamClass}</p>
                    <p><strong>សមាជិក:</strong> ${completedMembers}/${team.memberCount}</p>
                    <p><strong>បង្កើត:</strong> ${team.createdDate}</p>
                </div>
                <div style="text-align: right;">
                    <div class="team-status status-${team.status.replace(/\s+/g, '-')}">${team.status}</div>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
}

// Open team modal
function openTeamModal(teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    currentTeamId = teamId;
    const modal = document.getElementById('teamModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `${team.invoiceNumber} - ${team.teamName}`;

    const completedMembers = team.members.filter(m => m).length;
    const membersList = team.members.filter(m => m).map(m => `<li>${m}</li>`).join('');

    let html = `
        <p><strong>លេខវិក្កយបត្រ:</strong> <span>${team.invoiceNumber}</span></p>
        <p><strong>ឈ្មោះក្រុម:</strong> <span>${team.teamName}</span></p>
        <p><strong>ឈុត:</strong> <span>${team.teamClass}</span></p>
        <p><strong>ចំនួនសមាជិក:</strong> <span>${team.memberCount}</span></p>
        <p><strong>ឈ្មោះបានបញ្ចូល:</strong> <span>${completedMembers}/${team.memberCount}</span></p>
        <p><strong>ស្ថានភាព:</strong> <span>${team.status}</span></p>
        <p><strong>កាលបរិច្ឆេទបង្កើត:</strong> <span>${team.createdDate}</span></p>
        <p><strong>កាលបរិច្ឆេទកែសម្រួល:</strong> <span>${team.updatedDate}</span></p>
    `;

    if (membersList) {
        html += `
            <div class="members-list-modal">
                <h4>📝 បញ្ជីឈ្មោះ</h4>
                <ul>${membersList}</ul>
            </div>
        `;
    }

    modalBody.innerHTML = html;
    modal.classList.add('show');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('teamModal');
    modal.classList.remove('show');
    currentTeamId = null;
}

// Print team cover
function printTeamCover() {
    const team = teams.find(t => t.id === currentTeamId);
    if (!team) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>ក្វឺរក្រុម</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 40px; }
                .cover { border: 3px solid #333; padding: 60px; margin: 30px; }
                h1 { font-size: 28px; margin: 20px 0; }
                p { font-size: 18px; margin: 15px 0; }
                .footer { margin-top: 80px; border-top: 2px solid #333; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="cover">
                <h1>${team.teamName}</h1>
                <p><strong>លេខវិក្កយបត្រ:</strong> ${team.invoiceNumber}</p>
                <p><strong>ឈុត:</strong> ${team.teamClass}</p>
                <p><strong>ចំនួនសមាជិក:</strong> ${team.memberCount}</p>
                <p><strong>ស្ថានភាព:</strong> ${team.status}</p>
                <div class="footer">
                    <p>បង្កើត: ${team.createdDate}</p>
                </div>
            </div>
        </body>
        </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

// Print team list
function printTeamList() {
    const team = teams.find(t => t.id === currentTeamId);
    if (!team) return;

    const membersList = team.members.filter(m => m).map((m, i) => `<tr><td>${i + 1}</td><td>${m}</td></tr>`).join('');

    const printWindow = window.open('', '', 'height=600,width=800');
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>បញ្ជីឈ្មោះ</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #333; padding: 10px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; }
                .header-info { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>បញ្ជីឈ្មោះក្រុម</h1>
            <div class="header-info">
                <p><strong>ក្រុម:</strong> ${team.teamName}</p>
                <p><strong>លេខវិក្កយបត្រ:</strong> ${team.invoiceNumber}</p>
                <p><strong>ឈុត:</strong> ${team.teamClass}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">ល.រ</th>
                        <th>ឈ្មោះសមាជិក</th>
                    </tr>
                </thead>
                <tbody>
                    ${membersList}
                </tbody>
            </table>
            <p style="text-align: right; margin-top: 40px;">កាលបរិច្ឆេទ: ________________</p>
        </body>
        </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
}

// Delete team
function deleteTeam() {
    if (confirm('តើអ្នកប្រាកដថាចង់លុបក្រុមនេះឬ?')) {
        teams = teams.filter(t => t.id !== currentTeamId);
        saveTeamsToStorage();
        closeModal();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('teamModal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
}