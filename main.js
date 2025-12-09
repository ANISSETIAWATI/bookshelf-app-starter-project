// --- DATA & STATE ---
const state = {
    activeTab: 'books', // books, notes, activity, finance, schedule
    isMobileMenuOpen: false,
    
    // Data
    books: [
        { id: 1, title: 'Filosofi Teras', author: 'Henry Manampiring', year: '2019', isComplete: false },
        { id: 2, title: 'Atomic Habits', author: 'James Clear', year: '2018', isComplete: true },
    ],
    
    noteBooks: [
        { 
            id: 'ideas', title: 'Gudang Ide 💡', color: 'background-color: #fef9c3; border-color: #fde047;', icon: '✨',
            pages: [{ id: 1, title: 'Ide Skripsi', content: 'Analisis dampak media sosial terhadap minat baca mahasiswa...', date: '2023-10-24', stickers: ['✨', '🌸'] }]
        },
        { 
            id: 'diary', title: 'Diary Harian 🎀', color: 'background-color: #fce7f3; border-color: #f9a8d4;', icon: '🧸',
            pages: [{ id: 2, title: 'Hari yang Produktif', content: 'Hari ini berhasil menyelesaikan tugas Algoritma tepat waktu! Rasanya lega sekali.', date: '2023-10-25', stickers: ['🧸', '🧁'] }]
        },
        { 
            id: 'important', title: 'Catatan Penting 📌', color: 'background-color: #dbeafe; border-color: #93c5fd;', icon: '📑',
            pages: []
        }
    ],
    openBookId: null,
    currentPageIndex: 0,
    isAddingPage: false,
    noteForm: { title: '', content: '', stickers: [] },
    
    activities: [
        { id: 1, task: 'Baca 20 halaman jurnal', done: false },
        { id: 2, task: 'Bayar uang kas himpunan', done: true }
    ],
    
    expenses: [
        { id: 1, title: 'Nasi Padang', amount: 25000, category: 'Makan', date: new Date().toISOString().split('T')[0] },
        { id: 2, title: 'Fotokopi Modul', amount: 15000, category: 'Tugas', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
        { id: 3, title: 'Ojol ke Kampus', amount: 12000, category: 'Transport', date: new Date().toISOString().split('T')[0] },
    ],
    
    schedule: [
        { id: 1, subject: 'Algoritma Pemrograman', day: 'Senin', startTime: '08:00', endTime: '10:00', room: 'R. 304', lecturer: 'Pak Budi' },
        { id: 2, subject: 'Matematika Diskrit', day: 'Selasa', startTime: '10:00', endTime: '12:00', room: 'Lab Komputer', lecturer: 'Bu Siti' },
        { id: 3, subject: 'Basis Data', day: 'Senin', startTime: '13:00', endTime: '15:00', room: 'R. 202', lecturer: 'Pak Andi' },
    ],
    selectedDay: 'Senin',
    searchQuery: ''
};

const stickersCollection = ['🌸', '🎀', '✨', '🧸', '🧁', '🩰', '💌', '🐰', '⭐', '🍓', '🎵', '🌿'];
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const categories = {
    'Makan': { icon: 'coffee', color: 'background-color: #ffedd5; color: #ea580c;' },
    'Transport': { icon: 'bus', color: 'background-color: #dbeafe; color: #2563eb;' },
    'Belanja': { icon: 'shopping-bag', color: 'background-color: #f3e8ff; color: #9333ea;' },
    'Tugas': { icon: 'file-text', color: 'background-color: #dcfce7; color: #16a34a;' },
    'Lainnya': { icon: 'wallet', color: 'background-color: #f3f4f6; color: #4b5563;' }
};

// --- RENDER FUNCTIONS ---

function render() {
    renderSidebarNav();
    renderHeader();
    updateStats();
    
    const contentDiv = document.getElementById('app-content');
    contentDiv.innerHTML = ''; 

    switch(state.activeTab) {
        case 'books': contentDiv.innerHTML = getBooksHTML(); break;
        case 'notes': contentDiv.innerHTML = getNotesHTML(); break;
        case 'activity': contentDiv.innerHTML = getActivityHTML(); break;
        case 'finance': contentDiv.innerHTML = getFinanceHTML(); break;
        case 'schedule': contentDiv.innerHTML = getScheduleHTML(); break;
    }
    
    lucide.createIcons();
}

function updateStats() {
    const totalExpense = state.expenses
        .filter(e => e.date === new Date().toISOString().split('T')[0])
        .reduce((acc, curr) => acc + curr.amount, 0);
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
    const todayClasses = state.schedule.filter(s => s.day.toLowerCase() === today.toLowerCase()).length;

    document.getElementById('stat-books').innerText = state.books.filter(b => b.isComplete).length;
    document.getElementById('stat-classes').innerText = todayClasses;
    document.getElementById('stat-expenses').innerText = `Rp ${totalExpense.toLocaleString('id-ID')}`;
}

function renderSidebarNav() {
    const nav = document.querySelector('#sidebar nav');
    nav.innerHTML = `
        ${getNavLink('books', 'book', 'Koleksi Buku')}
        ${getNavLink('notes', 'pen-tool', 'Catatan & Ide')}
        ${getNavLink('activity', 'calendar', 'Aktivitas Harian')}
        ${getNavLink('finance', 'wallet', 'Dompet Mahasiswa')}
        ${getNavLink('schedule', 'calendar-clock', 'Jadwal Kuliah')}
    `;
}

function getNavLink(id, icon, label) {
    const isActive = state.activeTab === id;
    return `<button onclick="setTab('${id}')" class="nav-btn ${isActive ? 'active' : ''}">
        <i data-lucide="${icon}" style="width: 20px; height: 20px;"></i> ${label}
    </button>`;
}

function renderHeader() {
    const titles = {
        'books': 'Rak Buku Saya',
        'notes': state.openBookId ? '' : 'Koleksi Catatan',
        'activity': 'Target Harian',
        'finance': 'Dompet Mahasiswa',
        'schedule': 'Jadwal Kuliah'
    };
    const subtitles = {
        'books': 'Kelola koleksi bacaanmu.',
        'notes': state.openBookId ? '' : 'Pilih buku untuk mulai menulis.',
        'activity': 'Pantau produktivitasmu hari ini.',
        'finance': 'Pantau budget biar nggak boncos.',
        'schedule': 'Jangan sampai ada kelas yang terlewat!'
    };
    
    document.getElementById('page-title').innerText = titles[state.activeTab];
    document.getElementById('page-subtitle').innerText = subtitles[state.activeTab];
}

// --- HTML TEMPLATES ---

function getBooksHTML() {
    const filtered = state.books.filter(b => b.title.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const unread = filtered.filter(b => !b.isComplete);
    const read = filtered.filter(b => b.isComplete);

    return `
    <div class="grid lg-grid-cols-2 animate-fade-in">
        <div class="card">
            <h2 class="font-serif" style="color: #9d174d; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; border-bottom: 1px solid #fbcfe8; padding-bottom: 0.5rem;">Tambah Buku Baru</h2>
            <form onsubmit="handleAddBook(event)" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <input id="bookTitle" required class="input-field" placeholder="Judul Buku..." />
                <input id="bookAuthor" required class="input-field" placeholder="Penulis..." />
                <div class="flex gap-4">
                    <input id="bookYear" type="number" required class="input-field" placeholder="Tahun" style="flex: 1;" />
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input id="bookComplete" type="checkbox" style="width: 1.25rem; height: 1.25rem; accent-color: var(--primary);" /> 
                        <span style="font-size: 0.875rem; color: var(--text-muted);">Selesai?</span>
                    </label>
                </div>
                <button type="submit" class="btn btn-primary w-full" style="margin-top: 0.5rem;">Simpan ke Rak</button>
            </form>
        </div>

        <div class="flex flex-col gap-6">
            <div class="relative">
                <input oninput="state.searchQuery = this.value; render()" value="${state.searchQuery}" class="input-field" style="padding-left: 2.5rem;" placeholder="Cari judul buku..." />
                <i data-lucide="search" class="absolute" style="left: 0.75rem; top: 0.85rem; color: #f472b6; width: 18px; height: 18px;"></i>
            </div>

            <div class="card" style="min-height: 200px;">
                <h3 class="font-serif" style="color: #9d174d; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="book-open" style="width: 18px;"></i> Sedang Dibaca
                </h3>
                <div>
                    ${unread.length === 0 ? '<p class="text-center" style="color: #9ca3af; padding: 1rem;">Rak kosong...</p>' : unread.map(b => `
                        <div class="book-item">
                            <div>
                                <h4 style="font-weight: 700; color: #1f2937;">${b.title}</h4>
                                <p style="font-size: 0.75rem; color: #6b7280;">${b.author} (${b.year})</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="toggleBook(${b.id})" class="btn-icon" style="color: #22c55e;" title="Selesai"><i data-lucide="check-circle" style="width: 20px;"></i></button>
                                <button onclick="deleteBook(${b.id})" class="btn-icon" style="color: #ef4444;" title="Hapus"><i data-lucide="trash-2" style="width: 20px;"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="background-color: rgba(253, 242, 248, 0.8); border: 1px solid #fbcfe8; padding: 1.5rem; border-radius: 1rem;">
                <h3 class="font-serif" style="color: #9d174d; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="check-square" style="width: 18px;"></i> Selesai Dibaca
                </h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${read.length === 0 ? '<p class="text-center" style="color: #9ca3af; padding: 1rem;">Belum ada yang selesai.</p>' : read.map(b => `
                        <div style="background: white; border: 1px solid #fce7f3; padding: 1rem; border-radius: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="font-weight: 700; color: #831843; text-decoration: line-through;">${b.title}</h4>
                                <p style="font-size: 0.75rem; color: #db2777;">${b.author}</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="toggleBook(${b.id})" class="btn-icon" style="color: #d97706;" title="Baca Lagi"><i data-lucide="rotate-ccw" style="width: 18px;"></i></button>
                                <button onclick="deleteBook(${b.id})" class="btn-icon" style="color: #f87171;" title="Hapus"><i data-lucide="trash-2" style="width: 18px;"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
}

function getNotesHTML() {
    if (state.openBookId) {
        // Open Book View
        const book = state.noteBooks.find(b => b.id === state.openBookId);
        const page = book.pages[state.currentPageIndex];
        const totalPages = book.pages.length;

        let contentInner = '';

        if (state.isAddingPage) {
            contentInner = `
                <div class="animate-fade-in flex flex-col h-full">
                    <h3 class="font-serif" style="font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 1rem; border-bottom: 2px solid #fbcfe8; padding-bottom: 0.5rem;">Halaman Baru ✨</h3>
                    <input id="noteTitle" value="${state.noteForm.title}" oninput="state.noteForm.title = this.value" style="width: 100%; font-size: 1.25rem; font-weight: 700; background: transparent; border: none; border-bottom: 1px solid #d1d5db; outline: none; padding: 0.5rem 0; margin-bottom: 1rem;" placeholder="Judul Cerita..." />
                    
                    <div style="background-color: #fdf2f8; padding: 0.75rem; border-radius: 0.75rem; margin-bottom: 1rem;">
                        <p style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase; display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="smile" style="width: 12px;"></i> Pilih Stiker (Maks 5)</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                            ${stickersCollection.map(s => `
                                <button onclick="toggleSticker('${s}')" class="sticker-btn ${state.noteForm.stickers.includes(s) ? 'selected' : ''}">${s}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <textarea id="noteContent" oninput="state.noteForm.content = this.value" style="flex: 1; width: 100%; background: transparent; border: none; resize: none; outline: none; font-size: 1.125rem; color: #374151; line-height: 32px; background-image: linear-gradient(#e5e7eb 1px, transparent 1px); background-size: 100% 32px;" placeholder="Mulai menulis disini...">${state.noteForm.content}</textarea>
                    
                    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; border-top: 1px solid #e5e7eb; padding-top: 0.5rem;">
                        <button onclick="state.isAddingPage = false; render()" class="btn" style="color: #6b7280; background: #f3f4f6;">Batal</button>
                        <button onclick="savePage()" class="btn btn-primary">Simpan Halaman</button>
                    </div>
                </div>
            `;
        } else if (totalPages > 0) {
            contentInner = `
                <div class="animate-fade-in h-full flex flex-col relative group">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; border-bottom: 2px dotted #d1d5db; padding-bottom: 1rem;">
                        <div>
                            <h2 class="font-serif" style="font-size: 1.875rem; font-weight: 700; color: #1f2937;">${page.title}</h2>
                            <p style="font-size: 0.875rem; color: #6b7280; font-family: monospace; margin-top: 0.25rem;">${page.date}</p>
                        </div>
                        <div style="display: flex; gap: 0.25rem;">
                            ${(page.stickers || []).map((s, i) => `<span class="animate-bounce-slow" style="font-size: 1.875rem; animation-delay: ${i*0.2}s">${s}</span>`).join('')}
                        </div>
                    </div>
                    <div style="flex: 1; overflow-y: auto; padding-right: 0.5rem; white-space: pre-line;" class="custom-scrollbar">
                        ${page.content}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid #f3f4f6;">
                        <span style="font-size: 0.75rem; color: #9ca3af; font-family: monospace;">Halaman ${state.currentPageIndex + 1} dari ${totalPages}</span>
                        <button onclick="deletePage()" class="btn-icon" style="color: #d1d5db;" title="Robek Halaman"><i data-lucide="trash-2" style="width: 24px;"></i></button>
                    </div>
                </div>
            `;
        } else {
            contentInner = `
                <div class="animate-fade-in flex flex-col items-center justify-center h-full text-center" style="color: #9ca3af;">
                    <i data-lucide="book" style="width: 64px; height: 64px; margin-bottom: 1rem; color: #fbcfe8;"></i>
                    <p>Buku ini masih kosong.</p>
                    <button onclick="state.isAddingPage = true; render()" style="margin-top: 1rem; color: var(--primary); font-weight: 700; text-decoration: underline;">Mulai Menulis</button>
                </div>
            `;
        }

        return `
            <div class="animate-fade-in flex flex-col" style="height: calc(100vh - 180px);">
                <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
                    <button onclick="state.openBookId = null; state.isAddingPage = false; render()" style="display: flex; align-items: center; gap: 0.5rem; color: #6b7280;">
                        <i data-lucide="arrow-left" style="width: 20px;"></i> Kembali ke Rak
                    </button>
                    <h2 class="font-serif" style="font-size: 1.25rem; font-weight: 700; color: #1f2937; display: flex; align-items: center; gap: 0.5rem;">
                        <span>${book.icon}</span> ${book.title}
                    </h2>
                    <button onclick="state.isAddingPage = true; state.noteForm = {title:'', content:'', stickers:[]}; render()" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        <i data-lucide="plus" style="width: 16px;"></i> Tulis Baru
                    </button>
                </div>

                <div class="notebook-container flex justify-center items-center">
                    <button onclick="prevPage()" ${state.currentPageIndex === 0 || state.isAddingPage ? 'disabled' : ''} class="absolute" style="left: 1rem; padding: 0.75rem; background: white; border-radius: 50%; box-shadow: var(--shadow-md); color: var(--primary); z-index: 30; opacity: ${state.currentPageIndex === 0 || state.isAddingPage ? '0.3' : '1'};">
                        <i data-lucide="arrow-left" style="width: 24px;"></i>
                    </button>

                    <div style="width: 100%; max-width: 42rem; height: 100%; position: relative;">
                        <div class="notebook-paper">
                            <div class="notebook-rings">
                                ${[...Array(6)].map(() => `<div class="ring"></div>`).join('')}
                            </div>
                            <div style="margin-left: 2rem; padding: 2rem; height: 100%;">
                                ${contentInner}
                            </div>
                        </div>
                    </div>

                    <button onclick="nextPage()" ${state.currentPageIndex === totalPages - 1 || totalPages === 0 || state.isAddingPage ? 'disabled' : ''} class="absolute" style="right: 1rem; padding: 0.75rem; background: white; border-radius: 50%; box-shadow: var(--shadow-md); color: var(--primary); z-index: 30; opacity: ${state.currentPageIndex === totalPages - 1 || totalPages === 0 || state.isAddingPage ? '0.3' : '1'};">
                        <i data-lucide="arrow-right" style="width: 24px;"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="animate-fade-in">
                <div class="text-center" style="padding: 1.5rem 0 2rem 0;">
                    <h2 class="font-serif" style="font-size: 1.5rem; font-weight: 700; color: #831843;">Pilih Buku Catatanmu</h2>
                    <p style="color: #6b7280; margin-top: 0.25rem;">Setiap buku punya cerita yang berbeda.</p>
                </div>
                <div class="grid lg-grid-cols-3" style="padding-bottom: 3rem;">
                    ${state.noteBooks.map(book => `
                        <div onclick="openBook('${book.id}')" class="book-cover-3d" style="${book.color}">
                            <div class="absolute" style="left: 0; top: 0; bottom: 0; width: 1rem; background: rgba(0,0,0,0.05); border-radius: 0 0 0 1rem;"></div>
                            <div style="font-size: 3.75rem; margin-bottom: 1rem;">${book.icon}</div>
                            <h3 class="font-serif" style="font-weight: 700; font-size: 1.5rem; color: #1f2937; margin-bottom: 0.5rem;">${book.title}</h3>
                            <div style="width: 4rem; height: 4px; background: rgba(156, 163, 175, 0.3); border-radius: 99px; margin-bottom: 1rem;"></div>
                            <p style="font-size: 0.875rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em;">${book.pages.length} Halaman</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

function getActivityHTML() {
    return `
    <div style="max-width: 48rem; margin: 0 auto;" class="animate-fade-in">
        <div class="card" style="padding: 2rem;">
            <div class="flex justify-between items-center" style="margin-bottom: 1.5rem;">
                <h2 class="font-serif" style="font-size: 1.5rem; font-weight: 700; color: #9d174d; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="target"></i> Aktivitas Hari Ini
                </h2>
                <span style="background: #fce7f3; color: #be185d; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700;">
                    ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
            </div>
            
            <form onsubmit="handleAddActivity(event)" class="flex gap-2" style="margin-bottom: 2rem;">
                <input id="activityInput" required class="input-field" placeholder="Apa targetmu hari ini?" style="background-color: #fdf2f8;" />
                <button type="submit" class="btn btn-primary" style="border-radius: 0.75rem;"><i data-lucide="plus"></i></button>
            </form>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${state.activities.length === 0 ? '<p class="text-center" style="color: #9ca3af; padding: 1.5rem;">Belum ada aktivitas. Yuk mulai produktif!</p>' : state.activities.map(act => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 0.75rem; border: 1px solid ${act.done ? '#f3f4f6' : '#fbcfe8'}; background: ${act.done ? '#f9fafb' : 'white'}; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 1rem; cursor: pointer; flex: 1;" onclick="toggleActivity(${act.id})">
                            <div style="width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 2px solid ${act.done ? '#22c55e' : '#d1d5db'}; background: ${act.done ? '#22c55e' : 'transparent'}; display: flex; align-items: center; justify-content: center;">
                                ${act.done ? '<i data-lucide="check" style="width: 12px; color: white;"></i>' : ''}
                            </div>
                            <span style="font-size: 1.125rem; ${act.done ? 'color: #9ca3af; text-decoration: line-through;' : 'color: #374151; font-weight: 500;'}">${act.task}</span>
                        </div>
                        <button onclick="deleteActivity(${act.id})" class="btn-icon" style="color: #d1d5db;"><i data-lucide="x"></i></button>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>`;
}

function getFinanceHTML() {
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        const total = state.expenses.filter(e => e.date === dateStr).reduce((acc, curr) => acc + curr.amount, 0);
        chartData.push({ day: dayName, amount: total, date: dateStr });
    }
    const maxAmount = Math.max(...chartData.map(d => d.amount), 1);
    const todayStr = today.toISOString().split('T')[0];

    return `
    <div class="grid lg-grid-cols-3 animate-fade-in">
        <div class="flex flex-col gap-6">
            <div class="card">
                <h2 class="font-serif" style="font-size: 1.25rem; font-weight: 700; color: #9d174d; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="plus-circle"></i> Catat Pengeluaran
                </h2>
                <form onsubmit="handleAddExpense(event)" class="flex flex-col gap-3">
                    <input id="expTitle" required class="input-field" placeholder="Contoh: Makan Siang" />
                    <input id="expAmount" type="number" required class="input-field" placeholder="Rp 0" />
                    <div class="grid grid-cols-2" style="gap: 0.5rem; grid-template-columns: 1fr 1fr;">
                        <select id="expCategory" class="input-field">
                            ${Object.keys(categories).map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                        <input id="expDate" type="date" value="${todayStr}" class="input-field" />
                    </div>
                    <button class="btn btn-primary w-full" style="margin-top: 0.5rem;">Simpan</button>
                </form>
            </div>
            <div style="background: linear-gradient(135deg, #ec4899, #fb7185); padding: 1.5rem; border-radius: 1rem; color: white; box-shadow: var(--shadow-md);">
                <h3 style="font-weight: 500; font-size: 0.875rem; margin-bottom: 0.25rem; display: flex; gap: 0.5rem; color: #fce7f3;"><i data-lucide="coins" style="width: 16px;"></i> Total Hari Ini</h3>
                <p style="font-size: 1.875rem; font-weight: 700;">Rp ${chartData[chartData.length-1].amount.toLocaleString('id-ID')}</p>
            </div>
        </div>

        <div class="lg-col-span-2 flex flex-col gap-6">
            <div class="card">
                <h2 class="font-serif" style="font-size: 1.25rem; font-weight: 700; color: #9d174d; margin-bottom: 1.5rem; display: flex; gap: 0.5rem;">
                    <i data-lucide="trending-up"></i> Grafik 7 Hari Terakhir
                </h2>
                <div class="chart-bar-container">
                    ${chartData.map(d => `
                        <div class="chart-col">
                            <div class="chart-bar ${d.date === todayStr ? 'active' : 'inactive'}" style="height: ${(d.amount / maxAmount) * 100}%;"></div>
                            <span style="font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem; font-weight: 500;">${d.day}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <h2 class="font-serif" style="font-size: 1.25rem; font-weight: 700; color: #9d174d; margin-bottom: 1rem;">Riwayat Transaksi</h2>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 250px; overflow-y: auto;" class="custom-scrollbar">
                    ${state.expenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => {
                        const cat = categories[item.category] || categories['Lainnya'];
                        return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #f3f4f6; border-radius: 0.75rem; background: white;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="padding: 0.75rem; border-radius: 50%; ${cat.color}"><i data-lucide="${cat.icon}" style="width: 20px;"></i></div>
                                <div>
                                    <h4 style="font-weight: 700; color: #1f2937;">${item.title}</h4>
                                    <p style="font-size: 0.75rem; color: #6b7280;">${item.category} • ${new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="font-weight: 700; color: #db2777;">- Rp ${item.amount.toLocaleString('id-ID')}</span>
                                <button onclick="deleteExpense(${item.id})" class="btn-icon" style="color: #d1d5db;"><i data-lucide="trash-2" style="width: 16px;"></i></button>
                            </div>
                        </div>`;
                    }).join('')}
                    ${state.expenses.length === 0 ? '<p class="text-center" style="color: #9ca3af;">Belum ada data.</p>' : ''}
                </div>
            </div>
        </div>
    </div>`;
}

function getScheduleHTML() {
    const filteredClasses = state.schedule
        .filter(s => s.day === state.selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return `
    <div class="animate-fade-in flex flex-col gap-6">
        <div class="day-pills">
            ${days.map(day => `
                <button onclick="setScheduleDay('${day}')" class="pill ${state.selectedDay === day ? 'active' : ''}">
                    ${day}
                </button>
            `).join('')}
        </div>

        <div class="grid lg-grid-cols-3">
            <div class="lg-col-span-2 flex flex-col gap-4">
                ${filteredClasses.length === 0 ? `
                    <div class="card text-center" style="padding: 3rem; display: flex; flex-direction: column; align-items: center; color: #9ca3af;">
                        <i data-lucide="calendar-off" style="width: 48px; height: 48px; margin-bottom: 1rem; color: #fbcfe8;"></i>
                        <p>Tidak ada jadwal kuliah di hari ${state.selectedDay}.</p>
                        <p style="font-size: 0.875rem;">Istirahat atau kerjain tugas yuk!</p>
                    </div>
                ` : filteredClasses.map(item => `
                    <div class="card" style="padding: 1.25rem; border-left: 4px solid #ec4899; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="display: inline-flex; align-items: center; gap: 0.5rem; color: #db2777; font-weight: 700; background: #fdf2f8; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; margin-bottom: 0.5rem;">
                                <i data-lucide="clock" style="width: 16px;"></i> ${item.startTime} - ${item.endTime}
                            </div>
                            <h3 style="font-size: 1.25rem; font-weight: 700; color: #1f2937;">${item.subject}</h3>
                            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; color: #4b5563;">
                                <div style="display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="map-pin" style="width: 16px; color: #9ca3af;"></i> ${item.room}</div>
                                <div style="display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="user" style="width: 16px; color: #9ca3af;"></i> ${item.lecturer}</div>
                            </div>
                        </div>
                        <button onclick="deleteSchedule(${item.id})" class="btn-icon" style="color: #d1d5db;"><i data-lucide="trash-2"></i></button>
                    </div>
                `).join('')}
            </div>

            <div class="lg-col-span-1">
                <div class="card" style="position: sticky; top: 6rem;">
                    <h2 class="font-serif" style="font-size: 1.125rem; font-weight: 700; color: #9d174d; margin-bottom: 1rem; border-bottom: 1px solid #fbcfe8; padding-bottom: 0.5rem;">Tambah Jadwal</h2>
                    <form onsubmit="handleAddSchedule(event)" class="flex flex-col gap-3">
                        <input id="schSubject" required class="input-field" placeholder="Nama Matkul" />
                        <div class="grid grid-cols-2" style="gap: 0.5rem; grid-template-columns: 1fr 1fr;">
                            <select id="schDay" class="input-field" style="background: white;">
                                ${days.map(d => `<option value="${d}" ${d === state.selectedDay ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>
                            <input id="schRoom" class="input-field" placeholder="Ruangan" />
                        </div>
                        <div class="grid grid-cols-2" style="gap: 0.5rem; grid-template-columns: 1fr 1fr;">
                            <input id="schStart" type="time" required class="input-field" />
                            <input id="schEnd" type="time" required class="input-field" />
                        </div>
                        <input id="schLecturer" class="input-field" placeholder="Dosen" />
                        <button type="submit" class="btn btn-primary w-full" style="margin-top: 0.5rem;">Tambah Kelas</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

// --- LOGIC HANDLERS ---

function setTab(tab) {
    state.activeTab = tab;
    state.isMobileMenuOpen = false;
    updateMobileMenuUI();
    render();
}

function toggleMobileMenu() {
    state.isMobileMenuOpen = !state.isMobileMenuOpen;
    updateMobileMenuUI();
}

function updateMobileMenuUI() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    const icon = document.getElementById('mobile-menu-icon');
    
    if (state.isMobileMenuOpen) {
        sidebar.classList.add('open');
        overlay.classList.remove('hidden');
        icon.setAttribute('data-lucide', 'x');
    } else {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
        icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
}

function handleAddBook(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const year = document.getElementById('bookYear').value;
    const isComplete = document.getElementById('bookComplete').checked;
    state.books.push({ id: Date.now(), title, author, year, isComplete });
    render();
}
function toggleBook(id) {
    const b = state.books.find(b => b.id === id);
    if (b) b.isComplete = !b.isComplete;
    render();
}
function deleteBook(id) {
    state.books = state.books.filter(b => b.id !== id);
    render();
}

function openBook(id) {
    state.openBookId = id;
    state.currentPageIndex = 0;
    state.isAddingPage = false;
    render();
}
function toggleSticker(sticker) {
    if (state.noteForm.stickers.includes(sticker)) {
        state.noteForm.stickers = state.noteForm.stickers.filter(s => s !== sticker);
    } else if (state.noteForm.stickers.length < 5) {
        state.noteForm.stickers.push(sticker);
    }
    render();
}
function savePage() {
    if (!state.noteForm.title) return alert("Judul tidak boleh kosong!");
    const newPage = {
        id: Date.now(),
        title: state.noteForm.title,
        content: state.noteForm.content,
        stickers: state.noteForm.stickers,
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
    const book = state.noteBooks.find(b => b.id === state.openBookId);
    book.pages.unshift(newPage);
    state.isAddingPage = false;
    state.currentPageIndex = 0;
    state.noteForm = { title: '', content: '', stickers: [] };
    render();
}
function prevPage() { if(state.currentPageIndex > 0) { state.currentPageIndex--; render(); }}
function nextPage() { 
    const book = state.noteBooks.find(b => b.id === state.openBookId);
    if(state.currentPageIndex < book.pages.length - 1) { state.currentPageIndex++; render(); }
}
function deletePage() {
    if(confirm("Yakin ingin merobek halaman ini?")) {
        const book = state.noteBooks.find(b => b.id === state.openBookId);
        book.pages.splice(state.currentPageIndex, 1);
        if(state.currentPageIndex > 0) state.currentPageIndex--;
        render();
    }
}

function handleAddActivity(e) {
    e.preventDefault();
    const input = document.getElementById('activityInput');
    if(!input.value) return;
    state.activities.push({ id: Date.now(), task: input.value, done: false });
    render();
}
function toggleActivity(id) {
    const act = state.activities.find(a => a.id === id);
    if(act) act.done = !act.done;
    render();
}
function deleteActivity(id) {
    state.activities = state.activities.filter(a => a.id !== id);
    render();
}

function handleAddExpense(e) {
    e.preventDefault();
    const title = document.getElementById('expTitle').value;
    const amount = parseInt(document.getElementById('expAmount').value);
    const category = document.getElementById('expCategory').value;
    const date = document.getElementById('expDate').value;
    state.expenses.push({ id: Date.now(), title, amount, category, date });
    render();
}
function deleteExpense(id) {
    state.expenses = state.expenses.filter(e => e.id !== id);
    render();
}

function setScheduleDay(day) {
    state.selectedDay = day;
    render();
}
function handleAddSchedule(e) {
    e.preventDefault();
    const subject = document.getElementById('schSubject').value;
    const day = document.getElementById('schDay').value;
    const room = document.getElementById('schRoom').value;
    const startTime = document.getElementById('schStart').value;
    const endTime = document.getElementById('schEnd').value;
    const lecturer = document.getElementById('schLecturer').value;
    state.schedule.push({ id: Date.now(), subject, day, room, startTime, endTime, lecturer });
    render();
}
function deleteSchedule(id) {
    state.schedule = state.schedule.filter(s => s.id !== id);
    render();
}

// Initial Render
render();