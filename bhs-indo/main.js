const API_URL = `${window.location.origin}/transactions`; // Sesuaikan dengan endpoint transaksi
const API_ACTIVITY_URL = `${window.location.origin}/activities`;
const API_SCHEDULE_URL = `${window.location.origin}/schedules`;

// --- REGISTRASI PWA UNTUK MODE OFFLINE ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/bhs-indo/sw.js');
  });
}



// --- INITIALIZE INDEXEDDB ---
const DB_NAME = 'MyShelfDB';
const DB_VERSION = 3;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            // Pastikan semua store dibuat dengan benar
            if (!db.objectStoreNames.contains('schedules')) db.createObjectStore('schedules', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('activities')) db.createObjectStore('activities', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('expenses')) db.createObjectStore('expenses', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('sync-queue')) db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

// Fungsi bantu simpan data massal ke Lokal
async function saveToLocal(storeName, data) {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    data.forEach(item => store.put(item));
    return tx.complete;
}

// Fungsi bantu ambil data dari Lokal
async function getFromLocal(storeName) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        store.getAll().onsuccess = (e) => resolve(e.target.result);
    });
}
// --- INJECT CSS TEMA GELAP & PROFIL ---
// --- INJECT CSS TEMA GELAP & PROFIL (VERSI PAKSA MUNCUL) ---
// --- INJECT CSS TEMA GELAP & PROFIL (POSISI LEBIH PAS) ---
const style = document.createElement('style');
style.innerHTML = `
    /* Container Profil di Pojok Kanan Atas (Sejajar Judul) */
    #header-controls { 
        position: absolute; 
        top: -5px;   /* KUNCI: Tarik ke atas supaya tidak menabrak grafik */
        right: 0;    /* Mepet kanan */
        display: flex; 
        align-items: center; 
        gap: 0.75rem; 
        z-index: 50;
    }

    /* Tombol Tema (Matahari/Bulan) */
    .theme-btn { 
        background: transparent; /* Transparan biar clean */
        border: 1px solid #fbcfe8; 
        color: #db2777; 
        width: 36px; height: 36px; border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        cursor: pointer; transition: all 0.3s;
    }
    .theme-btn:hover { background: #fdf2f8; transform: rotate(15deg); }

    /* Kapsul Profil */
    .profile-pill {
        display: flex; align-items: center; gap: 8px; 
        background: white; 
        padding: 4px 12px 4px 4px; /* Padding lebih ramping */
        border-radius: 99px; 
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
        cursor: pointer;
        transition: all 0.2s;
    }
    .profile-pill:hover { border-color: #fbcfe8; box-shadow: 0 4px 6px -1px rgba(236, 72, 153, 0.1); }
    
    .profile-img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1px solid #ec4899; }
    .profile-name { font-weight: 600; color: #374151; font-size: 0.85rem; }


    /* --- CSS PORTOFOLIO EKSKLUSIF --- */
    .circuit-bg {
        background: radial-gradient(circle at 10% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(219, 39, 119, 0.05) 0%, transparent 40%);
        border: 2px solid #fce7f3;
        position: relative;
        overflow: hidden;
    }
    
    /* Efek garis sirkuit dekoratif */
    .circuit-line {
        position: absolute;
        background: linear-gradient(90deg, #ec4899, transparent);
        height: 2px;
        opacity: 0.2;
    }

    .node-point {
        width: 8px; height: 8px;
        background: #ec4899;
        border-radius: 50%;
        box-shadow: 0 0 10px #ec4899;
    }

    .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(253, 242, 248, 0.5);
        border-radius: 24px;
        padding: 1.5rem;
    }

    .skill-chip {
        padding: 5px 12px;
        font-size: 0.7rem;
        font-weight: 800;
        border-radius: 8px;
        background: white;
        color: #db2777;
        border: 1px solid #fbcfe8;
        box-shadow: 2px 2px 0px #fbcfe8;
    }


    /* --- ANIMATED CIRCUIT CORE --- */
    .avatar-core {
        width: 150px; height: 150px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 2px solid #ec4899;
        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; /* Bentuk organik tidak kaku */
        display: flex; align-items: center; justify-content: center;
        font-size: 3.5rem; font-weight: 900; color: #1f2937;
        box-shadow: 0 0 30px rgba(236, 72, 153, 0.3);
        animation: morph 8s ease-in-out infinite; /* Animasi bergerak lambat */
        position: relative;
    }

    @keyframes morph {
        0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
        100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
    }

    .circuit-card {
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(15px);
        border-radius: 24px;
        border: 1px solid rgba(236, 72, 153, 0.1);
        padding: 1.5rem;
        position: relative;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .circuit-card:hover {
        transform: scale(1.02) translateY(-5px);
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 20px 40px rgba(236, 72, 153, 0.1);
    }

    /* Garis Penghubung antar Komponen */
    .trace-line {
        position: absolute;
        background: linear-gradient(90deg, #ec4899, transparent);
        height: 2px; width: 50px;
        z-index: -1;
    }

    

    /* --- DARK MODE STYLES --- */
    body.dark-mode { background-color: #111827 !important; color: #f3f4f6 !important; }
    body.dark-mode .card { background-color: #1f2937 !important; border-color: #374151 !important; color: #f3f4f6; }
    
    /* Warna Text di Dark Mode */
    body.dark-mode h1, body.dark-mode h2, body.dark-mode h3, body.dark-mode h4, body.dark-mode .font-serif { color: #fbcfe8 !important; }
    body.dark-mode p, body.dark-mode span, body.dark-mode label { color: #d1d5db !important; }
    body.dark-mode .text-muted { color: #9ca3af !important; }

    /* Input & Form di Dark Mode */
    body.dark-mode .input-field { 
        background-color: #374151 !important; 
        color: white !important; 
        border-color: #4b5563 !important; 
    }
    body.dark-mode .input-field::placeholder { color: #9ca3af; }
    body.dark-mode select { background-color: #374151 !important; }

    /* Sidebar & Komponen Lain di Dark Mode */
    body.dark-mode .sidebar { background-color: #1f2937 !important; border-right-color: #374151 !important; }
    
    /* Widget Profil di Dark Mode */
    body.dark-mode .profile-pill { background-color: #374151 !important; border-color: #4b5563 !important; }
    body.dark-mode .profile-name { color: #f3f4f6 !important; }
    body.dark-mode .theme-btn { border-color: #4b5563; color: #fbcfe8; }
    body.dark-mode .theme-btn:hover { background-color: #374151; }

    /* --- STYLE "MINI NOTES" AESTHETIC (UPGRADED) --- */
    
    /* --- CSS TEMA TEDDY BEAR PINK (Mulai Edit Dari Sini) --- */

    /* 1. Container Layout (Ubah jadi Grid 2 Kolom: Kiri List, Kanan Kalender) */
    .masonry-container {
        display: grid;
        grid-template-columns: 1fr 1fr; 
        gap: 2rem;
        margin-top: 2rem;
    }
    @media (max-width: 768px) { .masonry-container { grid-template-columns: 1fr; } }

    /* 2. Desain Kartu (Wadah Pink Muda) */
    .note-card {
        background: #ffe4e9; /* Pink muda banget */
        border-radius: 24px;
        padding: 1.5rem;
        border: none;
        box-shadow: 0 4px 0 rgba(255, 105, 180, 0.1);
        position: relative;
    }
    
    /* Hapus efek hover lama */
    .note-card:hover { transform: none; box-shadow: 0 4px 0 rgba(255, 105, 180, 0.1); border: none; }
    .note-card::after, .holes-top, .sticker-deco { display: none; }

    /* 3. Header Kartu (Kita sembunyikan atau sesuaikan) */
    .note-header {
        display: none; /* Kita tidak butuh header kartu standar */
    }

    /* 4. List Item: Task Row (Kapsul Pink Tua) */
    .task-item-compact {
        background: #ff91c6; /* Pink agak tua */
        border-radius: 50px; /* Bulat kapsul */
        margin-bottom: 12px;
        padding: 0.8rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        color: white;
        border: 2px solid white; /* List putih di pinggir */
        transition: transform 0.2s;
    }
    .task-item-compact:hover { transform: scale(1.02); background: #ff80bf; }

    /* 5. Tombol Aksi (Check & Trash) */
    .action-btn-group {
        display: flex;
        gap: 8px;
    }
    
    /* Checkbox jadi Tombol Hijau (UNDONE = putih / DONE = hijau) */
    .check-btn-teddy {
        width: 32px; height: 32px;
        background: white; /* Default: putih untuk menunjukkan belum selesai */
        border: 2px solid #e5e7eb; /* Border netral */
        border-radius: 8px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #00c853; /* Ikon hijau saat belum selesai */
        transition: transform 0.15s, background 0.2s, color 0.2s, border-color 0.2s;
        box-shadow: none;
    }
    .check-btn-teddy:hover {
        transform: scale(1.05);
        border-color: rgba(0,200,83,0.4);
        background: rgba(0,200,83,0.06);
    }

    /* Ketika aktivitas sudah selesai beri warna hijau penuh */
    .check-btn-teddy.done {
        background: #00c853;
        color: white;
        border-color: #00c853;
        box-shadow: 0 2px 6px rgba(0,200,83,0.18);
    }

    /* Tombol Hapus jadi Merah */
    .del-btn-teddy {
        width: 32px; height: 32px;
        background: #ff5252; /* Merah */
        border: 2px solid white;
        border-radius: 8px;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: white;
        transition: transform 0.2s;
    }
    .del-btn-teddy:hover { transform: scale(1.1); }

    /* --- HEADER UTAMA (Pink Besar dengan Input) --- */
    .daily-header-container {
        background: #ff69b4; /* Hot Pink */
        border-radius: 30px;
        padding: 2rem;
        box-shadow: 0 8px 0 rgba(0,0,0,0.05);
        border: 4px solid white; /* Border putih tebal */
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        color: white;
    }
    .header-washi { display: none; }

    .header-text {
        display: flex; justify-content: space-between; width: 100%; align-items: center;
    }
    .header-text h2 { font-size: 1.2rem; font-weight: bold; margin: 0; text-shadow: 1px 1px 0 rgba(0,0,0,0.1); }
    .header-text p { margin: 0; font-weight: 600; opacity: 0.9; }

    /* Input Group (Kapsul Transparan) */
    /* --- UPDATE: PROFESSIONAL INPUT GROUP --- */

/* Container pembungkus input (Glass Style) */
.aesthetic-input-group {
    background: rgba(255, 255, 255, 0.05); /* Lebih transparan & clean */
    border: 1px solid rgba(255, 255, 255, 0.2); /* Garis lebih tipis & profesional */
    border-radius: 14px; /* Sudut lebih modern (tidak terlalu bulat) */
    padding: 0.5rem 0.5rem 0.5rem 1.2rem;
    display: flex;
    flex: 1;
    backdrop-filter: blur(10px); /* Efek kaca lebih kuat */
    transition: all 0.3s ease;
}

.aesthetic-input-group:focus-within {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4); /* Highlight saat mengetik */
}

/* Kotak tempat mengetik */
.aesthetic-input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    color: #ffffff;
    font-weight: 500; /* Font weight lebih seimbang */
    font-size: 1rem;
    letter-spacing: 0.025em;
}

.aesthetic-input::placeholder {
    color: rgba(255, 255, 255, 0.5); /* Placeholder lebih halus */
}

/* Tombol modern dengan aksen warna solid */
.aesthetic-btn {
    width: 40px;
    height: 40px;
    background: #3b82f6; /* Warna biru profesional (Indigo/Blue) */
    border: none; /* Tanpa border putih tebal agar lebih clean */
    border-radius: 10px; /* Bentuk kotak membulat modern */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.aesthetic-btn:hover {
    background: #2563eb;
    transform: translateY(-1px); /* Efek angkat sedikit saat hover */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}


    /* KALENDER STYLE (Kolom Kanan) */
    .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center; gap: 8px;
        margin-top: 1rem;
    }
    .cal-day-name { color: #ff69b4; font-weight: bold; font-size: 0.9rem; }
    .cal-num { 
        width: 30px; height: 30px; 
        display: flex; align-items: center; justify-content: center; 
        border-radius: 50%; color: #ff80ab; font-weight: 600; cursor: pointer; margin: 0 auto;
    }
    .cal-num:hover { background: white; color: #ff69b4; }
    .cal-num.active { background: #ff4081; color: white; box-shadow: 0 2px 4px rgba(255,64,129,0.3); }

    /* Override Profil & Dark Mode (Supaya tetap kelihatan) */
    #header-controls { top: 1.5rem; right: 1.5rem; }
    .profile-pill { background: rgba(255,255,255,0.9); border: none; }
    
    /* --- STYLE MODAL DETAIL (BLUR BACKGROUND) --- */
    #schedule-modal.modal-overlay {
        position: fixed;
        top: 0; 
        left: 0; 
        width: 100vw; /* Menggunakan vw agar melampaui sidebar */
        height: 100vh; /* Menggunakan vh agar menutupi seluruh layar */
        background: rgba(255, 255, 255, 0.4); /* Tingkatkan opasitas sedikit agar blur lebih terasa */
        backdrop-filter: blur(15px); /* Tingkatkan kekuatan blur */
        -webkit-backdrop-filter: blur(15px); /* Wajib untuk Safari/Chrome iOS */
        display: none; 
        align-items: center; 
        justify-content: center;
        z-index: 99999; /* Pastikan angka ini paling tinggi dibanding Sidebar/Header */
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        pointer-events: none; /* Supaya tidak menghalangi klik saat tidak aktif */
    }
    #schedule-modal.modal-overlay.active { display: flex; }
    
    .modal-body {
        background: white;
        width: 90%;
        max-width: 450px;
        padding: 2rem;
        border-radius: 28px;
        box-shadow: 0 25px 50px -12px rgba(236, 72, 153, 0.2);
        border: 1px solid #fbcfe8;
    }
    .dark-mode .modal-body { background: #1f2937; border-color: #374151; }
    
    

    /* --- MODERN CARD & BUTTON STYLE --- */
    .schedule-card {
        background: white;
        border-radius: 20px;
        padding: 1.5rem;
        border: 1px solid #fce7f3;
        box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.05); /* Bayangan Pink Lembut */
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        transition: transform 0.2s ease;
    }
    
    .schedule-card:hover { transform: translateY(-3px); }
.info-row {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #6b7280;
        font-size: 0.85rem;
        margin-top: 8px;
    }

    .btn-action-group {
        display: flex;
        gap: 8px;
    }

    .btn-task {
        background: #fdf2f8;
        color: #db2777;
        width: 36px; height: 36px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        border: none; cursor: pointer;
    }

    /* Tombol Aksi di Kartu */
    .action-group { display: flex; gap: 8px; }
    .btn-action {
        width: 38px; height: 38px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; border: none; cursor: pointer;
    }
    .btn-add-task { background: #fdf2f8; color: #db2777; }
    .btn-add-task:hover { background: #db2777; color: white; }
    .btn-delete { background: #f9fafb; color: #9ca3af; }
    .btn-delete:hover { background: #fee2e2; color: #ef4444; }

    /* MODAL BLUR FULL SCREEN */
    .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
        display: none; align-items: center; justify-content: center;
        z-index: 99999;
    }
    .modal-overlay.active { display: flex; }


    /* --- CSS KOLEKSI CATATAN MODERN --- */
    .notes-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        padding: 1rem;
    }

    .notebook-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(15px);
        border-radius: 30px;
        padding: 2.5rem 1.5rem;
        text-align: center;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .notebook-card:hover {
        transform: translateY(-15px);
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
    }

    /* Aksen Cahaya di Belakang Ikon */
    .icon-blob {
        width: 80px; height: 80px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 2.5rem;
        position: relative;
        transition: transform 0.3s ease;
    }
    .notebook-card:hover .icon-blob { transform: scale(1.1) rotate(10deg); }

    .note-stats {
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 1px;
        color: #9ca3af;
        margin-top: 1rem;
        text-transform: uppercase;
    }



    .expense-item {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
}

.status-pending {
    color: #f39c12; /* Warna Oranye */
    font-style: italic;
    font-weight: bold;
}

.status-success {
    color: #27ae60; /* Warna Hijau */
}

    
`;
document.head.appendChild(style);
// --- DATA & STATE ---
const state = {
    activeTab: 'finance', // Kita set default ke Finance biar langsung kelihatan hasilnya
    isMobileMenuOpen: false,
    chartDate: new Date(),
    
    // Data dummy untuk fitur lain (Buku, Note, dll) biarkan saja
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
    
    // ARRAY EXPENSES KITA KOSONGKAN DULU (Nanti diisi dari Database)
    expenses: [],
    
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

// --- API FUNCTIONS (BARU) ---

// 1. Fungsi Ambil Data dari Backend
// --- PERBAIKAN 1: AMBIL DATA ---
async function fetchSchedulesFromDB() {
    try {
        const response = await fetch(API_SCHEDULE_URL);
        const result = await response.json();
        const rawData = result.data || result;

        state.schedule = rawData.map(item => ({
            ...item,
            tugas: Array.isArray(item.tugas) ? item.tugas : (item.tugas ? JSON.parse(item.tugas) : [])
        }));

        // SIMPAN KE LOKAL UNTUK OFFLINE
        await saveToLocal('schedules', state.schedule);
        render();
    } catch (error) {
        console.warn("Offline: Mengambil Jadwal dari IndexedDB...");
        state.schedule = await getFromLocal('schedules'); // AMBIL DARI LOKAL
        render();
        showNotification("Mode Offline Aktif", "error");
    }
}
// --- RENDER FUNCTIONS ---

function render() {
    renderSidebarNav();
    renderHeader();
    updateStats();
    
    const contentDiv = document.getElementById('app-content');
    if (!contentDiv) return;
    contentDiv.innerHTML = ''; 

    // Pastikan case 'schedule' memanggil getScheduleHTML
    switch(state.activeTab) {
        case 'books': contentDiv.innerHTML = getBooksHTML(); break;
        case 'notes': contentDiv.innerHTML = getNotesHTML(); break;
        case 'activity': contentDiv.innerHTML = getActivityHTML(); startRealtimeClock(); break;
        case 'finance': contentDiv.innerHTML = getFinanceHTML(); break;
        case 'schedule': contentDiv.innerHTML = getScheduleHTML(); break; 
        case 'profile': contentDiv.innerHTML = getProfileHTML(); break;
    }
    
    lucide.createIcons();
}

function updateStats() {
    const totalExpense = state.expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
    
    // Tambahkan pengecekan agar tidak error jika .day kosong
    const todayClasses = state.schedule.filter(s => {
        const dayName = s.day || s.hari || ''; // Ambil dari 'day' atau 'hari'
        return dayName.toLowerCase() === today.toLowerCase();
    }).length;

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
    // DAFTAR JUDUL HALAMAN
    const titles = {
        'books': 'Rak Buku Saya',
        'notes': 'Koleksi Catatan',
        'activity': 'Target Harian',
        'finance': 'Dompet Mahasiswa',
        'schedule': 'Jadwal Kuliah',
        'profile': 'Profil Saya' // <--- INI WAJIB DITAMBAH
    };
    
    // DAFTAR SUB-JUDUL
    const subtitles = {
        'books': 'Kelola koleksi bacaanmu.',
        'notes': 'Tulis ide cemerlangmu di sini.',
        'activity': 'Pantau produktivitasmu hari ini.',
        'finance': 'Pantau budget biar nggak boncos.',
        'schedule': 'Jangan sampai ada kelas yang terlewat!',
        'profile': 'Kelola data diri dan akunmu.' // <--- INI JUGA
    };
    
    // Update Teks Judul
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    
    // Cek biar ga error kalau judulnya ga ketemu
    titleEl.innerText = titles[state.activeTab] || 'Aplikasi Mahasiswa';
    
    if(state.activeTab === 'finance') {
        subtitleEl.style.display = 'none'; 
    } else {
        subtitleEl.style.display = 'block';
        subtitleEl.innerText = subtitles[state.activeTab] || '';
    }

    // Pastikan Container Header Relative
    const headerContainer = titleEl.parentElement;
    headerContainer.style.position = 'relative'; 

    // --- WIDGET PROFIL ---
    let controls = document.getElementById('header-controls');
    
    if (!controls) {
        controls = document.createElement('div');
        controls.id = 'header-controls';
        
        const isDark = localStorage.getItem('theme') === 'dark';
        if(isDark) document.body.classList.add('dark-mode');

        controls.innerHTML = `
            <button onclick="toggleTheme()" class="theme-btn" title="Ganti Tema">
                <i id="theme-icon" data-lucide="${isDark ? 'sun' : 'moon'}" style="width: 20px;"></i>
            </button>

            <div class="profile-pill" onclick="state.activeTab = 'profile'; render();" title="Lihat Profil">
                <img src="https://ui-avatars.com/api/?name=Anis+Setiawati&background=fbcfe8&color=db2777" class="profile-img">
                <span class="profile-name">Anis S.</span>
                <i data-lucide="chevron-down" style="width: 16px; color: #9ca3af;"></i>
            </div>
        `;
        
        headerContainer.appendChild(controls);
        lucide.createIcons();
    }
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
    return `
    <div class="animate-fade-in">
        <div style="text-align: center; margin-bottom: 3rem;">
            <h1 class="font-serif" style="font-size: 2.5rem; font-weight: 800; color: #1f2937;">Pilih Buku Catatanmu</h1>
            <p style="color: #6b7280; margin-top: 0.5rem;">Simpan setiap ide dan memori dalam wadah yang tepat.</p>
        </div>

        <div class="notes-container">
            <div class="notebook-card" style="box-shadow: 0 10px 20px -5px rgba(252, 211, 77, 0.2);" onclick="openNotebook('ideas')">
                <div class="icon-blob" style="background: #fef3c7; color: #d97706;">✨</div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #1f2937;">Gudang Ide 💡</h3>
                <p style="font-size: 0.85rem; color: #6b7280; margin-top: 8px;">Tempat segala inspirasi liar bermuara.</p>
                <div class="note-stats">1 Halaman</div>
            </div>

            <div class="notebook-card" style="box-shadow: 0 10px 20px -5px rgba(244, 114, 182, 0.2);" onclick="openNotebook('diary')">
                <div class="icon-blob" style="background: #fdf2f8; color: #db2777;">🧸</div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #1f2937;">Diary Harian 🎀</h3>
                <p style="font-size: 0.85rem; color: #6b7280; margin-top: 8px;">Cerita manis tentang hari-hari yang dilalui.</p>
                <div class="note-stats">1 Halaman</div>
            </div>

            <div class="notebook-card" style="box-shadow: 0 10px 20px -5px rgba(96, 165, 250, 0.2);" onclick="openNotebook('important')">
                <div class="icon-blob" style="background: #eff6ff; color: #2563eb;">📄</div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #1f2937;">Catatan Penting 📌</h3>
                <p style="font-size: 0.85rem; color: #6b7280; margin-top: 8px;">Data krusial yang tak boleh terlupakan.</p>
                <div class="note-stats">0 Halaman</div>
            </div>
        </div>
    </div>`;
}



function getFinanceHTML() {
    // 1. Total Semua Uang Keluar
    const grandTotal = state.expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Cari Statistik Kilat
    const maxTx = state.expenses.length > 0 
        ? state.expenses.reduce((prev, curr) => (Number(prev.amount) > Number(curr.amount)) ? prev : curr)
        : { title: '-', amount: 0 };

    const catCounts = {};
    state.expenses.forEach(e => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
    const topCat = Object.keys(catCounts).length > 0
        ? Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b)
        : '-';

    // 2. Data Grafik (DINAMIS)
    const chartData = [];
    
    // Gunakan state.chartDate sebagai jangkar (bukan hari ini lagi)
    const anchorDate = new Date(state.chartDate); 
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Jakarta' };

    // Hitung Rentang Tanggal untuk Judul (Misal: 10 Des - 16 Des)
    const endDate = new Date(anchorDate);
    const startDate = new Date(anchorDate);
    startDate.setDate(endDate.getDate() - 6);
    
    const dateRangeStr = `${startDate.toLocaleDateString('id-ID', {day:'numeric', month:'short'})} - ${endDate.toLocaleDateString('id-ID', {day:'numeric', month:'short'})}`;
    
    // Loop 7 hari ke belakang dari anchorDate
    for (let i = 6; i >= 0; i--) {
        const d = new Date(anchorDate);
        d.setDate(anchorDate.getDate() - i);
        
        const bucketKey = d.toLocaleDateString('id-ID', options);
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        
        const total = state.expenses
            .filter(e => {
                const expenseDate = new Date(e.date);
                const expenseKey = expenseDate.toLocaleDateString('id-ID', options);
                return expenseKey === bucketKey;
            })
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
            
        chartData.push({ day: dayName, amount: total });
    }

    const maxAmount = Math.max(...chartData.map(d => d.amount), 1);
    const todayStr = new Date().toLocaleDateString('en-CA'); // Untuk form input tetap hari ini

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
                <h3 style="font-weight: 500; font-size: 0.875rem; margin-bottom: 0.25rem; display: flex; gap: 0.5rem; color: #fce7f3;">
                    <i data-lucide="coins" style="width: 16px;"></i> Total Pengeluaran
                </h3>
                <p style="font-size: 1.875rem; font-weight: 700;">Rp ${grandTotal.toLocaleString('id-ID')}</p>
            </div>

            <div class="card">
                <h3 class="font-serif" style="font-size: 1.125rem; font-weight: 700; color: #9d174d; margin-bottom: 1rem; border-bottom: 1px solid #fbcfe8; padding-bottom: 0.5rem;">
                    Statistik Kilat ⚡
                </h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="background: #fee2e2; padding: 0.5rem; border-radius: 50%; color: #ef4444;"><i data-lucide="alert-circle" style="width: 20px;"></i></div>
                        <div>
                            <p style="font-size: 0.75rem; color: #6b7280;">Jajan Terboros</p>
                            <div style="font-weight: 700; color: #1f2937;">${maxTx.title}</div>
                            <div style="font-size: 0.875rem; color: #db2777;">Rp ${Number(maxTx.amount).toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="background: #dbeafe; padding: 0.5rem; border-radius: 50%; color: #3b82f6;"><i data-lucide="pie-chart" style="width: 20px;"></i></div>
                        <div>
                            <p style="font-size: 0.75rem; color: #6b7280;">Sering Keluar Buat</p>
                            <span style="background: #fdf2f8; color: #be185d; padding: 0.1rem 0.6rem; border-radius: 99px; font-size: 0.875rem; font-weight: 700;">
                                ${topCat}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg-col-span-2 flex flex-col gap-6">
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 class="font-serif" style="font-size: 1.25rem; font-weight: 700; color: #9d174d; display: flex; gap: 0.5rem;">
                        <i data-lucide="trending-up"></i> Grafik Pengeluaran Mingguan
                    </h2>
                    
                    <div style="display: flex; align-items: center; gap: 0.5rem; background: #fdf2f8; padding: 0.25rem; border-radius: 0.5rem;">
                        <button onclick="changeChartWeek(-1)" class="btn-icon" style="color: #be185d; padding: 0.25rem;"><i data-lucide="chevron-left" style="width: 20px;"></i></button>
                        <span style="font-size: 0.875rem; font-weight: 600; color: #be185d; min-width: 100px; text-align: center;">${dateRangeStr}</span>
                        <button onclick="changeChartWeek(1)" class="btn-icon" style="color: #be185d; padding: 0.25rem;"><i data-lucide="chevron-right" style="width: 20px;"></i></button>
                        <button onclick="resetChartDate()" class="btn-icon" style="color: #be185d; padding: 0.25rem; margin-left: 0.25rem; border-left: 1px solid #fbcfe8;" title="Hari Ini"><i data-lucide="rotate-ccw" style="width: 16px;"></i></button>
                    </div>
                </div>

                <div class="chart-bar-container" style="display: flex; justify-content: space-between; align-items: flex-end; height: 180px; padding-top: 1rem;">
                    ${chartData.map(d => `
                        <div class="chart-col" style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%;">
                            <div style="flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 0.5rem;">
                                <div style="
                                    width: 30%; 
                                    border-radius: 99px; 
                                    transition: height 0.5s ease; 
                                    background-color: ${d.amount > 0 ? '#ec4899' : '#fce7f3'};
                                    height: ${(d.amount / maxAmount) * 100}%;
                                    min-height: 4px;
                                " title="Rp ${d.amount.toLocaleString('id-ID')}"></div>
                            </div>
                            <span style="font-size: 0.75rem; color: #6b7280; font-weight: 600;">${d.day}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <h2 class="font-serif" style="font-size: 1.25rem; font-weight: 700; color: #9d174d; margin-bottom: 1rem;">Riwayat Transaksi</h2>
                <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 250px; overflow-y: auto;" class="custom-scrollbar">
                    ${state.expenses.sort((a,b) => new Date(b.date) - new Date(a.date)).map(item => {
                        const cat = categories[item.category] || categories['Lainnya'];
                        const displayDate = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                        return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #f3f4f6; border-radius: 0.75rem; background: white;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="padding: 0.75rem; border-radius: 50%; ${cat.color}"><i data-lucide="${cat.icon}" style="width: 20px;"></i></div>
                                <div>
                                    <h4 style="font-weight: 700; color: #1f2937;">${item.title}</h4>
                                    <p style="font-size: 0.75rem; color: #6b7280;">${item.category} • ${displayDate}</p>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="font-weight: 700; color: #db2777;">- Rp ${Number(item.amount).toLocaleString('id-ID')}</span>
                                <button onclick="deleteExpense('${item.id}')" class="btn-icon" style="color: #d1d5db;"><i data-lucide="trash-2" style="width: 16px;"></i></button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    </div>`;
}

function getActivityHTML() {
    // 1. SETUP TANGGAL
    if (!state.activityDate || state.activityDate === 'Invalid Date') {
        state.activityDate = new Date().toISOString().split('T')[0];
    }
    const dateObj = new Date(state.activityDate);
    // Format Header: "Today, 18/12/25"
    const dateHeader = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // 2. FILTER DATA (Tampilkan per hari)
    const dailyActivities = state.activities.filter(a => {
        if (!a.date) return true; 
        return a.date === state.activityDate;
    });
    // Urutkan: Belum selesai di atas
    dailyActivities.sort((a, b) => a.done - b.done);

    // 3. GENERATE KALENDER (Otomatis)
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Minggu

    
    let calHTML = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<div class="cal-day-name">${d}</div>`).join('');
    
    // Kotak kosong
    for(let i=0; i<firstDay; i++) calHTML += `<div></div>`;
    
    // Angka Tanggal
    for(let d=1; d<=daysInMonth; d++) {
        const isActive = d === dateObj.getDate() ? 'active' : '';
        calHTML += `<div class="cal-num ${isActive}" onclick="changeDateFromCalendar(${d})">${d}</div>`;
    }

    return `
    <div class="animate-fade-in" style="max-width: 900px; margin: 0 auto; padding: 1rem;">
        
        <div class="daily-header-container">
            <div class="header-text">
                <h2>Tambahkan aktivitas hari ini</h2>
                <p>Today, ${dateHeader}</p>
            </div>
            
            <form onsubmit="handleAddActivity(event)" class="aesthetic-input-group">
                <input id="activityInput" required placeholder="Tulis aktivitasmu..." class="aesthetic-input" autocomplete="off" />
                <button type="submit" class="aesthetic-btn">
                    <i data-lucide="plus" style="width: 24px; color: white;"></i>
                </button>
            </form>
        </div>

        <div class="masonry-container">
            
            <div class="note-card" style="min-height: 300px;">
                ${dailyActivities.length === 0 ? 
                    `<div style="text-align:center; color:#ff80ab; padding-top:2rem;">
                        <i data-lucide="heart" style="width:32px; margin-bottom:10px;"></i><br>
                        List kosong, ayo isi!
                     </div>` : ''}

                ${dailyActivities.map(act => `
                    <div id="task-${act.id}" class="task-item-compact" style="${act.done ? 'opacity:0.6; background:#eeb5cc;' : ''}">
                        
                        <div style="flex: 1;">
                            <div class="task-title" style="font-weight:600; font-size:1rem; ${act.done ? 'text-decoration:line-through;' : ''}">
                                ${act.task}
                            </div>
                            <div style="font-size:0.75rem; opacity:0.9;">
                            <span class="activity-time" data-id="${act.id}">${getCurrentTimeHHMM()}</span> / ${dateHeader}
                            </div>
                        </div>
                        
                        <div class="action-btn-group">
                            <div class="check-btn-teddy ${act.done ? 'done' : ''}" data-activity-id="${act.id}"
                                onclick="toggleActivity('${act.id}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleActivity('${act.id}'); }" role="button" tabindex="0" title="${act.done ? 'Batalkan selesai' : 'Tandai selesai'}" aria-pressed="${act.done ? 'true' : 'false'}">
                                <i data-lucide="check" style="width:18px;"></i>
                            </div>
                            <div class="del-btn-teddy" data-activity-id="${act.id}" onclick="deleteActivity('${act.id}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); deleteActivity('${act.id}'); }" role="button" tabindex="0" title="Hapus">
                                <i data-lucide="trash-2" style="width:18px;"></i>
                            </div>
                        </div>

                    </div>
                `).join('')}
            </div>

            <div class="note-card" style="background:#ffe4e9; color:#ff4081;">
                <div style="text-align:center; font-weight:bold; font-size:1.2rem; margin-bottom:1rem; color:#ff69b4;">
                    < ${year} >
                </div>
                
                <div class="cal-grid">
                    ${calHTML}
                </div>
            </div>

        </div>
    </div>`;
}

function getCurrentTimeHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}.${mm}`;
}

function startRealtimeClock() {
  function updateTimes() {
    const timeStr = getCurrentTimeHHMM();
    document.querySelectorAll('.activity-time').forEach(el => {
      el.textContent = timeStr;
    });
  }
  updateTimes();
  setInterval(updateTimes, 60000); // update tiap menit
}

// Helper: Klik Kalender
function changeDateFromCalendar(day) {
    const d = new Date(state.activityDate);
    d.setDate(day);
    state.activityDate = d.toISOString().split('T')[0];
    render();
}

function getScheduleHTML() {
    const filteredClasses = state.schedule
        .filter(s => (s.hari || s.day) === state.selectedDay)
        .sort((a, b) => (a.mulai || a.startTime).localeCompare(b.mulai || b.startTime));

    return `
    <div class="animate-fade-in flex flex-col gap-6">
        <div class="day-pills">
            ${days.map(day => `
                <button onclick="setScheduleDay('${day}')" class="pill ${state.selectedDay === day ? 'active' : ''}">
                    ${day}
                </button>
            `).join('')}
        </div>

        <div class="grid lg-grid-cols-3 gap-6">
            <div class="lg-col-span-2 flex flex-col gap-4">
                ${filteredClasses.length === 0 ? `
                    <div class="card text-center" style="padding: 3rem; color: #9ca3af;">
                        <i data-lucide="calendar-off" style="width: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Libur kuliah! Tidak ada jadwal di hari ${state.selectedDay}.</p>
                    </div>
                ` : filteredClasses.map(item => `
                    
<div class="schedule-card" style="border-left: 6px solid #ec4899; margin-bottom: 1.25rem; border-radius: 20px; padding: 1.5rem; background: white; display: flex; justify-content: space-between; align-items: flex-start;">
    <div style="flex: 1;">
        <h3 style="font-size: 1.6rem; font-weight: 800; color: #1f2937; margin-bottom: 0.5rem; line-height: 1.2;">
            ${(item.matkul || item.subject)}
        </h3>

        <div style="font-size: 0.85rem; font-weight: 700; color: #db2777; background: #fdf2f8; padding: 4px 10px; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 0.75rem;">
            <i data-lucide="clock" style="width: 14px;"></i> ${(item.mulai || item.startTime)} - ${(item.selesai || item.endTime)}
        </div>
        
        <div style="display: flex; align-items: center; gap: 12px; font-size: 0.85rem; color: #6b7280;">
            <span style="display: flex; align-items: center; gap: 4px;">
                <i data-lucide="map-pin" style="width: 14px;"></i> ${(item.ruangan || item.room)}
            </span>
            <span style="color: #d1d5db;">|</span>
            <span style="display: flex; align-items: center; gap: 4px;">
                <i data-lucide="user" style="width: 14px;"></i> ${(item.dosen || item.lecturer)}
            </span>
        </div>

        ${Array.isArray(item.tugas) && item.tugas.length > 0 ? `
            <div style="margin-top: 1.25rem; display: flex; flex-direction: column; gap: 8px;">
                ${item.tugas.map(t => `
                    <div style="padding: 10px; background: #fff5f7; border-radius: 12px; border: 1px dashed #fbcfe8; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <p style="font-size: 0.8rem; font-weight: 700; color: #be185d; margin: 0;">📝 ${t.nama}</p>
                            <p style="font-size: 0.65rem; color: #db2777; margin: 0;">⏰ Deadline: ${t.deadline || '-'}</p>
                        </div>
                        <button onclick="deleteSingleTask('${item.id}', '${t.id}')" style="background: none; border: none; color: #fca5a5; cursor: pointer;">
                            <i data-lucide="x-circle" style="width: 16px;"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
    
    <div style="display: flex; gap: 8px; margin-left: 1rem;">
        <button onclick="showAddTaskModal('${item.id}')" class="btn-task" style="background: #fdf2f8; color: #db2777; border: none; padding: 10px; border-radius: 12px; cursor: pointer;">
            <i data-lucide="plus-circle" style="width: 20px;"></i>
        </button>
        <button onclick="deleteSchedule('${item.id}')" style="color: #d1d5db; border: none; background: none; cursor: pointer; padding: 10px;">
            <i data-lucide="trash-2" style="width: 20px;"></i>
        </button>
    </div>
</div>

                        

                        
                `).join('')}
            </div>
            
            <div class="lg-col-span-1">
                <div class="card" style="position: sticky; top: 6rem;">
                    <h2 class="font-serif" style="color: #9d174d; font-weight: 800; margin-bottom: 1.5rem; font-size: 1.25rem;">Tambah Jadwal</h2>
                    
                    <form onsubmit="handleAddSchedule(event)" style="display: flex; flex-direction: column; gap: 1rem;">
                        <input id="schSubject" required class="input-field" placeholder="Nama Mata Kuliah" />
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <select id="schDay" class="input-field" style="background: white;">
                                ${days.map(d => `<option value="${d}" ${d === state.selectedDay ? 'selected' : ''}>${d}</option>`).join('')}
                            </select>
                            <input id="schRoom" class="input-field" placeholder="Ruangan" />
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <div>
                                <label style="font-size: 0.7rem; font-weight: 700; color: #9ca3af; margin-left: 4px;">MULAI</label>
                                <input id="schStart" type="time" required class="input-field" />
                            </div>
                            <div>
                                <label style="font-size: 0.7rem; font-weight: 700; color: #9ca3af; margin-left: 4px;">SELESAI</label>
                                <input id="schEnd" type="time" required class="input-field" />
                            </div>
                        </div>

                        <input id="schLecturer" class="input-field" placeholder="Dosen Pengampu" />
                        
                        <button type="submit" class="btn btn-primary w-full" style="padding: 12px; border-radius: 12px; margin-top: 0.5rem;">
                            Simpan Jadwal Baru
                        </button>
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

// --- BOOK HANDLERS (MASIH LOCAL STORAGE/ARRAY) ---
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

// --- NOTES HANDLERS ---
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

// --- ACTIVITY HANDLERS ---
async function handleAddActivity(e) {
    e.preventDefault();
    const input = document.getElementById('activityInput');
    if(!input || !input.value.trim()) return;

    // Pastikan tanggal aman
    if (!state.activityDate || state.activityDate === 'Invalid Date') {
        state.activityDate = new Date().toISOString().split('T')[0];
    }

    const newActivity = {
        // id: Date.now(), // Hapus ini, biarkan Database yang bikin ID otomatis (biar rapi)
        task: input.value,
        done: false,
        date: state.activityDate,
        completedTime: null
    };

    try {
        const response = await fetch(API_ACTIVITY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newActivity)
        });

        if (response.ok) {
            // Ambil data terbaru biar sinkron
            fetchActivitiesFromDB(); 
            input.value = ''; // Kosongkan input
            input.focus();
        }
    } catch (error) {
        alert("Gagal menyimpan aktivitas.");
        console.error(error);
    }
}

async function toggleActivity(id) {
    console.log('toggleActivity klik id:', id);
    const act = state.activities.find(a => String(a.id) === String(id));
    if (!act) {
        console.warn('Aktivitas tidak ditemukan untuk id:', id);
        return;
    }

    const prevDone = act.done;
    const prevCompletedTime = act.completedTime;

    const isDoneNow = !act.done;
    const completedTimeNow = isDoneNow
        ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : null;

    // Update state optimistically
    act.done = isDoneNow;
    act.completedTime = completedTimeNow;

    // Update DOM for this activity only (no full re-render -> no flicker)
    const taskEl = document.getElementById(`task-${id}`);
    const checkBtn = document.querySelector(`[data-activity-id="${id}"]`);
    const titleEl = taskEl ? taskEl.querySelector('.task-title') : null;
    const timeEl = document.querySelector(`.activity-time[data-id="${id}"]`);

    if (checkBtn) {
        // temporarily disable to avoid double clicks
        checkBtn.dataset.busy = '1';
        checkBtn.style.pointerEvents = 'none';
        checkBtn.style.opacity = '0.9';

        if (isDoneNow) {
            checkBtn.classList.add('done');
            checkBtn.setAttribute('aria-pressed', 'true');
            checkBtn.setAttribute('title', 'Batalkan selesai');
        } else {
            checkBtn.classList.remove('done');
            checkBtn.setAttribute('aria-pressed', 'false');
            checkBtn.setAttribute('title', 'Tandai selesai');
        }
    }

    if (titleEl) {
        titleEl.style.textDecoration = isDoneNow ? 'line-through' : 'none';
    }
    if (taskEl) {
        taskEl.style.opacity = isDoneNow ? '0.6' : '';
        taskEl.style.background = isDoneNow ? '#eeb5cc' : '';
    }
    if (timeEl) {
        timeEl.textContent = isDoneNow ? (act.completedTime || getCurrentTimeHHMM()) : getCurrentTimeHHMM();
    }

    // Cute toast
    const msg = isDoneNow ? `Yeay! Kamu menyelesaikan: ${act.task} 🎉🐰` : `Aktivitas dibatalkan: ${act.task} 😅`;
    if (isDoneNow) showNotification(msg, 'cute'); else showNotification(msg, 'success');

    // Persist to server
    try {
        const response = await fetch(`${API_ACTIVITY_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                done: isDoneNow,
                completedTime: completedTimeNow
            })
        });
        if (!response.ok) throw new Error('Server error');
    } catch (error) {
        console.error('Gagal update status:', error);
        // Revert state & DOM
        act.done = prevDone;
        act.completedTime = prevCompletedTime;

        if (checkBtn) {
            if (prevDone) {
                checkBtn.classList.add('done');
                checkBtn.setAttribute('aria-pressed', 'true');
                checkBtn.setAttribute('title', 'Batalkan selesai');
            } else {
                checkBtn.classList.remove('done');
                checkBtn.setAttribute('aria-pressed', 'false');
                checkBtn.setAttribute('title', 'Tandai selesai');
            }
        }
        if (titleEl) titleEl.style.textDecoration = prevDone ? 'line-through' : 'none';
        if (taskEl) {
            taskEl.style.opacity = prevDone ? '0.6' : '';
            taskEl.style.background = prevDone ? '#eeb5cc' : '';
        }
        if (timeEl) timeEl.textContent = getCurrentTimeHHMM();

        showNotification('Gagal mengupdate status. Coba lagi nanti.', 'error');
    } finally {
        if (checkBtn) {
            delete checkBtn.dataset.busy;
            checkBtn.style.pointerEvents = '';
            checkBtn.style.opacity = '';
        }
    }
}

async function deleteActivity(id) {
    if(!confirm("Hapus aktivitas ini?")) return;

    const act = state.activities.find(a => String(a.id) === String(id));
    if (!act) {
        showNotification('Aktivitas tidak ditemukan.', 'error');
        return;
    }

    const oldActivities = [...state.activities];

    // Optimistic - remove from state immediately
    state.activities = state.activities.filter(a => String(a.id) !== String(id));

    // Remove DOM element smoothly (no full re-render -> no flicker)
    const taskEl = document.getElementById(`task-${id}`);
    const delBtn = document.querySelector(`.del-btn-teddy[data-activity-id="${id}"]`);
    if (taskEl) {
        taskEl.style.transition = 'opacity 0.18s, transform 0.18s';
        taskEl.style.opacity = '0';
        taskEl.style.transform = 'translateX(8px)';
        setTimeout(() => taskEl.remove(), 200);
    }

    // disable delete button while calling server
    if (delBtn) {
        delBtn.dataset.busy = '1';
        delBtn.style.pointerEvents = 'none';
        delBtn.style.opacity = '0.6';
    }

    try {
        const response = await fetch(`${API_ACTIVITY_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Gagal delete');
        showNotification('Aktivitas berhasil dihapus 🗑️', 'success');
    } catch (error) {
        console.error('Gagal menghapus dari server:', error);
        showNotification('Gagal menghapus aktivitas. Coba lagi nanti.', 'error');
        // Revert state and restore UI
        state.activities = oldActivities;
        render();
    } finally {
        if (delBtn) {
            delete delBtn.dataset.busy;
            delBtn.style.pointerEvents = '';
            delBtn.style.opacity = '';
        }
    }
}

// --- FINANCE HANDLERS (SUDAH KONEK BACKEND!) ---

// 2. Fungsi Tambah Data (POST ke Backend)
// --- PERBAIKAN 2: TAMBAH DATA ---
async function handleAddExpense(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('name').value,
        amount: document.getElementById('amount').value,
        date: new Date().toISOString()
    };

    if (navigator.onLine) {
        // JIKA ONLINE: Langsung kirim ke Hapi Server
        await sendToServer(data);
        renderToUI(data, false); // Tanda centang hijau
    } else {
        // JIKA OFFLINE: Masukkan ke gudang IndexedDB
        const transaction = db.transaction(['offline_expenses'], 'readwrite');
        transaction.objectStore('offline_expenses').add(data);
        
        renderToUI(data, true); // Tanda pending oranye
        alert('Data disimpan lokal (Offline)');
    }
}

async function deleteExpense(id) {
    if(!confirm("Yakin mau hapus data ini selamanya?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        // --- INI PERBAIKANNYA ---
        // response.ok = TRUE kalau server bilang "Oke" (Status 200-299)
        // Jadi kita gak perlu ngecek isi teks pesannya apa.
        if (response.ok) {
            // Langsung hapus dari layar biar cepat
            state.expenses = state.expenses.filter(e => e.id !== id);
            render(); 
            
            showNotification("Data berhasil dihapus! 🗑️");
        } else {
            // Kalau server beneran error (Status 400/500)
            const result = await response.json();
            alert("Gagal menghapus: " + (result.message || "Error server"));
        }
    } catch (error) {
        console.error("Error delete:", error);
        alert("Gagal menghapus data. Cek koneksi server.");
    }
}

// --- SCHEDULE HANDLERS ---
function setScheduleDay(day) {
    state.selectedDay = day;
    render();
}

async function handleAddSchedule(e) {
    e.preventDefault();
    
    const newSchedule = {
        subject: document.getElementById('schSubject').value,
        day: document.getElementById('schDay').value,
        room: document.getElementById('schRoom').value,
        startTime: document.getElementById('schStart').value,
        endTime: document.getElementById('schEnd').value,
        lecturer: document.getElementById('schLecturer').value
    };

    try {
        const response = await fetch(API_SCHEDULE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSchedule)
        });

        if (response.ok) {
            showNotification("Jadwal kuliah berhasil disimpan! 📚");
            e.target.reset(); // Bersihkan form
            fetchSchedulesFromDB(); // Tarik data terbaru dari server
        }
    } catch (error) {
        console.error("Gagal menyimpan jadwal:", error);
        showNotification("Gagal menghubungi server.", "error");
    }
}

async function deleteSchedule(id) {
    if(!confirm("Hapus jadwal kuliah ini?")) return;

    try {
        const response = await fetch(`${API_SCHEDULE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification("Jadwal telah dihapus 🗑️");
            fetchSchedulesFromDB(); // Sinkronkan ulang data
        }
    } catch (error) {
        console.error("Gagal menghapus jadwal:", error);
        showNotification("Gagal menghapus jadwal dari server.", "error");
    }
}

function closeMobileMenu() {
   const sidebar = document.getElementById('sidebar');
   sidebar.classList.remove('active');
}

// Initial Render (Jalankan saat web pertama dibuka)
render();

// AMBIL DATA DARI SUPABASE OTOMATIS
fetchExpensesFromDB();
fetchActivitiesFromDB();
fetchSchedulesFromDB();




// --- FUNGSI NAVIGASI GRAFIK ---
function changeChartWeek(offset) {
    // Geser tanggal sebanyak 7 hari (Maju/Mundur)
    state.chartDate.setDate(state.chartDate.getDate() + (offset * 7));
    render(); // Refresh tampilan
}

function resetChartDate() {
    state.chartDate = new Date(); // Kembali ke Hari Ini
    render();
}






// --- FUNGSI NOTIFIKASI CANTIK (TOAST) ---
function showNotification(message, type = 'success') {
    // 1. Buat elemen notifikasi
    const toast = document.createElement('div');
    
    // 2. Atur Style biar Cantik (Pink & Clean)
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = 'white';
    toast.style.borderLeft = '6px solid #ec4899'; // Default garis Pink Tebal
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = 'sans-serif';
    toast.style.transform = 'translateX(120%)'; // Sembunyi dulu di kanan
    toast.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)'; // Efek membal

    // 3. Tentukan Ikon, Warna & Judul
    let iconColor = '#ec4899';
    let icon = 'check-circle';
    let titleText = 'Berhasil!';

    if (type === 'error') {
        iconColor = '#ef4444';
        icon = 'alert-circle';
        titleText = 'Gagal!';
        toast.style.borderLeft = '6px solid #ef4444';
    } else if (type === 'cute') {
        iconColor = '#ff6fa3';
        icon = 'smile';
        titleText = 'Yeay!';
        toast.style.borderLeft = '6px solid #ff6fa3';
    }
    
    toast.innerHTML = `
        <i data-lucide="${icon}" style="color: ${iconColor}; width: 24px; height: 24px;"></i>
        <div>
            <h4 style="font-weight: 700; color: #1f2937; margin: 0; font-size: 0.95rem;">${titleText}</h4>
            <p style="color: #6b7280; margin: 0; font-size: 0.85rem;">${message}</p>
        </div>
    `;

    // 4. Masukkan ke Layar
    document.body.appendChild(toast);
    lucide.createIcons(); // Render ikon

    // 5. Animasi Masuk (Slide In)
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // 6. Hilang Otomatis setelah 3 detik
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 500); // Hapus elemen setelah animasi selesai
    }, 3000);
}




// --- FUNGSI GANTI TEMA (DARK/LIGHT) ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    // Toggle class dark-mode
    body.classList.toggle('dark-mode');
    
    // Cek kondisi sekarang
    const isDark = body.classList.contains('dark-mode');
    
    // Ganti Ikon (Matahari <-> Bulan)
    if (isDark) {
        icon.setAttribute('data-lucide', 'sun');
        localStorage.setItem('theme', 'dark'); // Simpan ke memori browser
    } else {
        icon.setAttribute('data-lucide', 'moon');
        localStorage.setItem('theme', 'light');
    }
    
    // Render ulang ikon agar berubah
    lucide.createIcons();
}

// Panggil sekali saat start untuk memastikan ikon benar
document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});





// --- HALAMAN PROFIL ---
// --- FUNGSI HALAMAN PROFIL (Tempel di Paling Bawah File main.js) ---
function getProfileHTML() {
    return `
    <div class="animate-fade-in flex flex-col gap-10" style="padding: 1rem;">
        
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
            <div class="avatar-core">
                AS
                <div style="position: absolute; top: -10px; right: -10px; width: 20px; height: 20px; background: #ec4899; border-radius: 50%; box-shadow: 0 0 15px #ec4899;"></div>
            </div>
            
            <div style="text-align: center;">
                <h1 class="font-serif" style="font-size: 2.8rem; font-weight: 900; color: #1f2937; margin-bottom: 0.5rem;">Anis Setiawati</h1>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <span style="background: #fdf2f8; color: #db2777; padding: 6px 16px; border-radius: 30px; font-size: 0.75rem; font-weight: 800; border: 1px solid #fbcfe8;">ELECTRICAL ENGINEER</span>
                    <span style="background: #eff6ff; color: #2563eb; padding: 6px 16px; border-radius: 30px; font-size: 0.75rem; font-weight: 800; border: 1px solid #bfdbfe;">FULLSTACK DEVELOPER</span>
                </div>
            </div>
        </div>

        <div class="grid lg-grid-cols-2 gap-8">
            <div class="circuit-card">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;">
                    <div style="padding: 10px; background: #ec4899; color: white; border-radius: 12px;"><i data-lucide="zap"></i></div>
                    <h3 style="font-weight: 800; color: #1f2937;">Power Source (Education)</h3>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div style="position: relative; padding-left: 20px; border-left: 2px solid #fbcfe8;">
                        <h4 style="font-weight: 800; font-size: 1rem;">Universitas Lampung</h4>
                        <p style="font-size: 0.8rem; color: #db2777; font-weight: 700;">Teknik Elektro (2023 - Sekarang)</p>
                    </div>
                    <div style="position: relative; padding-left: 20px; border-left: 2px solid #fbcfe8;">
                        <h4 style="font-weight: 800; font-size: 1rem;">MAN 1 Lampung Tengah</h4>
                        <p style="font-size: 0.8rem; color: #6b7280;">IPA (2020 - 2023)</p>
                    </div>
                </div>
            </div>

            <div class="circuit-card">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;">
                    <div style="padding: 10px; background: #1f2937; color: white; border-radius: 12px;"><i data-lucide="cpu"></i></div>
                    <h3 style="font-weight: 800; color: #1f2937;">System Logic (Skills)</h3>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <span class="skill-chip">JavaScript</span> <span class="skill-chip">Node.js</span> 
                    <span class="skill-chip">Hapi Framework</span> <span class="skill-chip">PWA</span>
                    <span class="skill-chip" style="color: #2563eb; border-color: #bfdbfe;">Python</span> 
                    <span class="skill-chip" style="color: #2563eb; border-color: #bfdbfe;">SQL</span>
                    <span class="skill-chip" style="color: #2563eb; border-color: #bfdbfe;">R-Language</span>
                </div>
            </div>
        </div>

        <div class="circuit-card" style="grid-column: span 1 / -1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 2rem;">
                <div style="padding: 10px; background: #db2777; color: white; border-radius: 12px;"><i data-lucide="package"></i></div>
                <h3 style="font-weight: 800; color: #1f2937;">Output Components (Projects)</h3>
            </div>
            
            <div class="grid md-grid-cols-3 gap-6">
                <div style="padding: 1.5rem; background: #fdf2f8; border-radius: 20px; border: 1px solid #fbcfe8;">
                    <h5 style="font-weight: 800; color: #db2777;">CIPPUNG Translator</h5>
                    <p style="font-size: 0.75rem; color: #6b7280; margin-top: 8px;">Penerjemah Bahasa Lampung berbasis web dengan Dictionary-Lookup.</p>
                </div>
                <div style="padding: 1.5rem; background: #fdf2f8; border-radius: 20px; border: 1px solid #fbcfe8;">
                    <h5 style="font-weight: 800; color: #db2777;">MyShelf Organizer</h5>
                    <p style="font-size: 0.75rem; color: #6b7280; margin-top: 8px;">Manajemen akademik lengkap dengan jadwal, tugas, dan dompet mahasiswa.</p>
                </div>
                <div style="padding: 1.5rem; background: #fdf2f8; border-radius: 20px; border: 1px solid #fbcfe8;">
                    <h5 style="font-weight: 800; color: #db2777;">Bookshelf API</h5>
                    <p style="font-size: 0.75rem; color: #6b7280; margin-top: 8px;">Backend system menggunakan Node.js untuk penyimpanan data buku.</p>
                </div>
            </div>
        </div>
    </div>`;
}






// --- EFEK CURSOR JEJAK PERI (FAERIE DUST) ---
document.addEventListener('mousemove', function(e) {
    // 1. Buat Bintang
    const star = document.createElement('div');
    star.className = 'faerie-dust';
    document.body.appendChild(star);

    // 2. Posisi di Ujung Mouse
    star.style.left = e.pageX + 'px';
    star.style.top = e.pageY + 'px';

    // 3. Warna Acak Pastel
    const colors = ['#fbcfe8', '#c7d2fe', '#bbf7d0', '#fde68a', '#ffffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    star.style.background = randomColor;
    star.style.boxShadow = `0 0 10px ${randomColor}, 0 0 20px ${randomColor}`;

    // 4. Animasi Meledak & Hilang
    const destX = (Math.random() - 0.5) * 60;
    const destY = (Math.random() - 0.5) * 60;
    
    star.animate([
        { transform: `translate(0, 0) scale(1)`, opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
    ], {
        duration: 1000 + Math.random() * 500,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
    });

    // 5. Hapus Sampah Element
    setTimeout(() => { star.remove(); }, 1500);
});

// CSS Khusus Bintang (Inject langsung biar praktis)
const dustStyle = document.createElement('style');
dustStyle.innerHTML = `
.faerie-dust {
    position: absolute;
    width: 6px; height: 6px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: screen;
}
`;
document.head.appendChild(dustStyle);



// --- AMBIL DATA AKTIVITAS DARI SERVER ---
async function fetchActivitiesFromDB() {
    try {
        const response = await fetch(API_ACTIVITY_URL);
        const data = await response.json();
        state.activities = Array.isArray(data) ? data : (data.data || []);
        await saveToLocal('activities', state.activities);
        render();
    } catch (error) {
        console.warn("Offline: Mengambil Aktivitas dari IndexedDB..."); // Pastikan baris ini ada
        state.activities = await getFromLocal('activities');
        render();
    }
}



// --- AMBIL DATA AKTIVITAS DARI SERVER ---
async function fetchActivitiesFromDB() {
    try {
        const response = await fetch(API_ACTIVITY_URL);
        const data = await response.json();
        
        // Simpan ke state
        // Kalau server pakai format { data: [...] }, sesuaikan. 
        // Ini asumsi json-server langsung array [...]
        state.activities = Array.isArray(data) ? data : (data.data || []);
        
        render(); // Refresh layar
    } catch (error) {
        console.error("Gagal ambil aktivitas:", error);
    }
}


// --- FUNGSI INTEGRASI GOOGLE CALENDAR ---
function addToGoogleCalendar(taskTitle, dateStr) {
    // 1. Siapkan Format Tanggal (YYYYMMDD)
    // Kita hapus tanda strip (-) dari tanggal (misal: 2025-12-17 jadi 20251217)
    const dateClean = dateStr.replace(/-/g, '');
    
    // 2. Buat URL Ajaib Google
    // text = Judul Kegiatan
    // dates = Tanggal Mulai / Tanggal Selesai (Kita set seharian penuh)
    // details = Catatan tambahan
    const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(taskTitle)}&details=Disimpan+dari+MyShelf+App&dates=${dateClean}/${dateClean}`;
    
    // 3. Buka di Tab Baru
    window.open(gcalLink, '_blank');
}


async function fetchExpensesFromDB() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        state.expenses = (result.data || result).map(item => ({
            ...item,
            amount: Number(item.amount) || 0
        }));

        // Simpan ke IndexedDB store 'expenses'
        await saveToLocal('expenses', state.expenses);
        render();
    } catch (error) {
        console.warn("Offline: Mengambil Keuangan dari IndexedDB...");
        state.expenses = await getFromLocal('expenses'); // Fallback lokal
        render();
    }
}





function showScheduleDetail(id) {
    const item = state.schedule.find(s => String(s.id) === String(id));
    if (!item) return;

    // Placeholder data karena kolom ini belum ada di tabel Supabase kamu
    const materi = "1. Pengenalan Konsep\n2. Latihan Soal Mandiri";
    const tugas = "Review Jurnal Mingguan";
    const deadline = "25 Des 2025";

    let modal = document.getElementById('schedule-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'schedule-modal';
        modal.className = 'modal-overlay';
        // Tutup jika klik pada area blur
        modal.onclick = (e) => { if(e.target === modal) closeModal(); };
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-body animate-fade-in">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h2 class="font-serif" style="font-size: 1.5rem; font-weight: 800; color: #1f2937;">${item.subject}</h2>
                    <p style="color: #db2777; font-weight: 600; font-size: 0.875rem;">👨‍🏫 ${item.lecturer}</p>
                </div>
                <button onclick="closeModal()" style="color: #9ca3af; background: none; border: none; cursor: pointer;">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="background: #f9fafb; padding: 1rem; border-radius: 16px;">
                    <h4 style="font-weight: 700; color: #db2777; font-size: 0.9rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="book-open" style="width: 18px;"></i> Rincian Materi
                    </h4>
                    <p style="font-size: 0.875rem; color: #4b5563; white-space: pre-line;">${materi}</p>
                </div>

                <div style="background: #fff5f7; padding: 1rem; border-radius: 16px; border: 1px solid #fbcfe8;">
                    <h4 style="font-weight: 700; color: #be185d; font-size: 0.9rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="clipboard-list" style="width: 18px;"></i> Tugas & Deadline
                    </h4>
                    <p style="font-size: 0.875rem; color: #1f2937; font-weight: 600;">${tugas}</p>
                    <p style="font-size: 0.75rem; color: #db2777; margin-top: 0.25rem;">⏰ Deadline: ${deadline}</p>
                </div>
            </div>

            <button onclick="closeModal()" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; border-radius: 12px;">Tutup</button>
        </div>
    `;

    modal.classList.add('active');
    lucide.createIcons(); // Penting: render ulang ikon di dalam modal
}

function closeModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) modal.classList.remove('active');
}


// --- FUNGSI UNTUK MEMUNCULKAN MODAL TUGAS ---
function showAddTaskModal(id) {
    // Cari data jadwal berdasarkan ID
    const item = state.schedule.find(s => String(s.id) === String(id));
    if (!item) return;

    let modal = document.getElementById('task-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'task-modal';
        modal.className = 'modal-overlay';
        // Tutup jika klik area blur di luar kotak
        modal.onclick = (e) => { if(e.target === modal) closeTaskModal(); };
        document.body.appendChild(modal);
    }

    // Tampilkan Modal (Sesuai image_e90e92.png)
    modal.innerHTML = `
        <div class="card animate-fade-in" style="width: 90%; max-width: 400px; padding: 2rem; border-radius: 24px; position: relative; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                <h3 class="font-serif" style="font-size: 1.4rem; font-weight: 800; color: #1f2937;">Tugas Baru</h3>
                <button onclick="closeTaskModal()" style="background: none; border: none; color: #9ca3af; cursor: pointer;">
                    <i data-lucide="x" style="width: 20px;"></i>
                </button>
            </div>
            
            <p style="font-size: 0.85rem; color: #db2777; margin-bottom: 1rem; font-weight: 600;">Matkul: ${item.subject || item.matkul}</p>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label style="font-size: 0.75rem; font-weight: 700; color: #6b7280; margin-bottom: 4px; display: block;">APA TUGASNYA?</label>
                    <input id="taskInput" class="input-field" placeholder="Contoh: Resume Bab 3" value="${item.tugas || ''}">
                </div>
                <div>
                    <label style="font-size: 0.75rem; font-weight: 700; color: #6b7280; margin-bottom: 4px; display: block;">DEADLINE</label>
                    <input id="deadlineInput" type="date" class="input-field" value="${item.deadline || ''}">
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 1rem;">
                    <button onclick="closeTaskModal()" class="btn" style="flex: 1; background: #f3f4f6; color: #6b7280; border: none; border-radius: 12px; cursor: pointer;">Batal</button>
                    <button onclick="saveTaskOnly('${id}')" class="btn btn-primary" style="flex: 2; padding: 12px; border-radius: 12px; cursor: pointer;">Simpan Tugas</button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
    lucide.createIcons(); // Supaya ikon 'x' muncul
}

// --- FUNGSI UNTUK MENGIRIM DATA KE BACKEND ---
async function saveTaskOnly(id) {
    console.log("Menyimpan tugas untuk ID:", id); // Cek di Console F12
    
    const tugasValue = document.getElementById('taskInput').value;
    const deadlineValue = document.getElementById('deadlineInput').value;

    if (!tugasValue) {
        showNotification("Isi nama tugasnya dulu ya!", "error");
        return;
    }

    try {
        const response = await fetch(`${API_SCHEDULE_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                tugas: tugasValue, 
                deadline: deadlineValue 
            })
        });

        if (response.ok) {
            showNotification("Tugas berhasil disimpan! 📋");
            closeTaskModal();
            fetchSchedulesFromDB(); // Muat ulang data jadwal agar muncul di kartu
        } else {
            const errorData = await response.json();
            alert("Gagal simpan: " + (errorData.message || "Error Server"));
        }
    } catch (error) {
        console.error("Gagal menghubungi server:", error);
        alert("Server tidak merespon. Pastikan backend jalan!");
    }
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.remove('active');
}

// --- FUNGSI UNTUK MENGIRIM DATA KE BACKEND ---
window.saveTaskOnly = async function(id) {
    const item = state.schedule.find(s => String(s.id) === String(id));
    
    // Pastikan currentTasks adalah Array
    const currentTasks = Array.isArray(item.tugas) ? item.tugas : [];
    
    const taskVal = document.getElementById('taskInput').value;
    const deadlineVal = document.getElementById('deadlineInput').value;

    if (!taskVal) return;

    // Tambahkan tugas baru ke dalam list
    const updatedTasks = [...currentTasks, { 
        id: Date.now(), 
        nama: taskVal, 
        deadline: deadlineVal 
    }];

    try {
        const response = await fetch(`${API_SCHEDULE_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tugas: updatedTasks }) // Kirim seluruh array
        });

        if (response.ok) {
            showNotification("Tugas berhasil ditambah! 📋");
            closeTaskModal();
            fetchSchedulesFromDB(); 
        }
    } catch (err) {
        console.error(err);
    }
};

// Fungsi tutup modal
window.closeTaskModal = function() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.remove('active');
};

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
}


// --- FUNGSI PENGINGAT DEADLINE BESOK ---
function checkUpcomingDeadlines() {
    // 1. Cari tanggal besok (format YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 2. Filter jadwal yang punya tugas dengan deadline besok
    const upcomingTasks = state.schedule.filter(item => item.deadline === tomorrowStr);

    // 3. Tampilkan notifikasi jika ada tugas
    upcomingTasks.forEach(item => {
        showNotification(`Jangan lupa! Besok ada deadline tugas ${item.subject}: ${item.tugas} 🧸`, 'cute');
    });
}




// --- FUNGSI HAPUS SATU TUGAS SPESIFIK ---
window.deleteSingleTask = async function(scheduleId, taskId) {
    if(!confirm("Hapus tugas ini?")) return;

    // 1. Cari mata kuliah yang dimaksud di dalam state
    const scheduleItem = state.schedule.find(s => String(s.id) === String(scheduleId));
    if (!scheduleItem || !Array.isArray(scheduleItem.tugas)) return;

    // 2. Buat daftar tugas baru tanpa tugas yang ingin dihapus
    const updatedTasks = scheduleItem.tugas.filter(t => String(t.id) !== String(taskId));

    try {
        // 3. Kirim update ke Backend menggunakan metode PATCH
        const response = await fetch(`${API_SCHEDULE_URL}/${scheduleId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tugas: updatedTasks })
        });

        if (response.ok) {
            showNotification("Tugas berhasil dihapus! 🗑️");
            fetchSchedulesFromDB(); // Refresh data agar tampilan sinkron
        } else {
            alert("Gagal menghapus tugas di server.");
        }
    } catch (error) {
        console.error("Error saat menghapus tugas:", error);
        alert("Terjadi kesalahan koneksi ke server.");
    }
};





// Simpan perintah ke antrean jika offline
async function addToSyncQueue(url, method, body) {
    const db = await openDB();
    const tx = db.transaction('sync-queue', 'readwrite');
    await tx.objectStore('sync-queue').add({ url, method, body, timestamp: Date.now() });
    showNotification("Data disimpan lokal, akan disinkron saat online 📥", "cute");
}

// Kirim data ke server saat internet kembali (Auto-Sync)
async function processSyncQueue() {
    const queue = await getFromLocal('sync-queue');
    if (queue.length === 0) return;

    showNotification("Menyingkronkan data ke server... 🔄");

    for (const item of queue) {
        try {
            await fetch(item.url, {
                method: item.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.body)
            });
            // Hapus dari antrean jika berhasil
            const db = await openDB();
            const tx = db.transaction('sync-queue', 'readwrite');
            await tx.objectStore('sync-queue').delete(item.id);
        } catch (err) {
            console.error("Gagal sinkron item:", item.id);
        }
    }
    
    // Refresh semua data setelah sinkron selesai
    fetchSchedulesFromDB();
    fetchActivitiesFromDB();
    fetchExpensesFromDB();
}

// DENGARKAN STATUS ONLINE
window.addEventListener('online', processSyncQueue);




// 1. Minta izin notifikasi saat aplikasi dibuka
if ('Notification' in window) {
  Notification.requestPermission();
}

// 2. Deteksi saat perangkat kembali Online
window.addEventListener('online', () => {
  sendOnlineNotification();
});

async function sendOnlineNotification() {
  const registration = await navigator.serviceWorker.ready;
  
  if (Notification.permission === 'granted') {
    registration.showNotification('Koneksi Terhubung!', {
      body: 'Anda sedang online. Data sedang disinkronkan...',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    });
  }
}



const publicVapidKey = 'BMx5Qu2CmAQc_lD3ar6dzXHHHNrnr_HTokmvYirOdIT1IMQZoZtf_u1oIUrdPRt3xsyPMpHqLI-l-sL4LxTJh9E';

async function subscribeUser() {
  const register = await navigator.serviceWorker.ready;
  
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' }
  });
}

// Fungsi helper untuk konversi key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Panggil fungsi ini setelah user memberi izin notifikasi
subscribeUser();



// 1. Inisialisasi Database Lokal (IndexedDB)
// --- 1. INISIALISASI DATABASE ---
const request = indexedDB.open('ExpenseDB', 1);
let db;

request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains('offline_expenses')) {
        db.createObjectStore('offline_expenses', { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = (e) => { db = e.target.result; };

// --- 2. FUNGSI RENDER (UI) ---
function renderToUI(data, isPending) {
    const list = document.getElementById('expense-list'); 
    const status = isPending ? '<span class="pending" style="color:orange"> (Menunggu Online...)</span>' : ' ✅';
    
    const html = `
        <li id="temp-${data.timestamp || Date.now()}">
            ${data.name}: Rp${data.amount} ${status}
        </li>
    `;
    list.insertAdjacentHTML('beforeend', html);
}

// --- 3. LOGIKA TOMBOL SIMPAN ---
async function handleAddExpense(event) {
    event.preventDefault();
    
    // 1. Ambil data dengan ID yang BENAR sesuai HTML (expTitle, expAmount, dll)
    const titleInput = document.getElementById('expTitle');
    const amountInput = document.getElementById('expAmount');
    const categoryInput = document.getElementById('expCategory');
    const dateInput = document.getElementById('expDate');

    const data = {
        title: titleInput.value, // Sesuai kolom di backend
        amount: Number(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value || new Date().toISOString()
    };

    console.log("Mengirim data:", data); // Cek di console F12

    if (navigator.onLine) {
        try {
            const response = await sendToServer(data);
            if (response.ok) {
                showNotification("Berhasil disimpan ke server! ✅");
                event.target.reset();
                fetchExpensesFromDB(); // Refresh list
            } else {
                throw new Error("Gagal kirim ke server");
            }
        } catch (err) {
            console.error(err);
            showNotification("Gagal ke server, menyimpan ke lokal...", "error");
            saveToIndexedDBOffline(data);
        }
    } else {
        // Jika Offline
        saveToIndexedDBOffline(data);
    }
}

// --- 4. SINKRONISASI OTOMATIS SAAT ONLINE ---
window.addEventListener('online', async () => {
    const transaction = db.transaction(['offline_expenses'], 'readwrite');
    const store = transaction.objectStore('offline_expenses');
    const getAll = store.getAll();

    getAll.onsuccess = async () => {
        if (getAll.result.length > 0) {
            for (const item of getAll.result) {
                await sendToServer(item);
            }
            store.clear(); // Hapus data lokal setelah sukses
            
            // Update UI: Ubah semua teks orange menjadi centang hijau
            document.querySelectorAll('.pending').forEach(el => {
                el.innerHTML = ' ✅ Tersinkron';
                el.style.color = 'green';
            });
            
            showOnlineNotification(); // Notifikasi yang sudah Anda buat
        }
    };
});

async function sendToServer(data) {
    // Gunakan variabel API_URL agar otomatis mengikuti Hugging Face
    return fetch(`http://localhost:5001/transactions`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// 2. Fungsi untuk menyimpan data
async function saveExpense(data) {
  if (navigator.onLine) {
    // Jika online, langsung kirim ke server
    sendToServer(data);
  } else {
    // Jika offline, simpan ke IndexedDB
    const transaction = db.transaction(['offline_expenses'], 'readwrite');
    const store = transaction.objectStore('offline_expenses');
    store.add(data);
    alert('Anda sedang offline. Data disimpan secara lokal dan akan dikirim saat online.');
  }
}

// 3. Logika Sinkronisasi saat Online Kembali
window.addEventListener('online', async () => {
  const transaction = db.transaction(['offline_expenses'], 'readwrite');
  const store = transaction.objectStore('offline_expenses');
  const allRecords = store.getAll();

  allRecords.onsuccess = async () => {
    if (allRecords.result.length > 0) {
      for (const data of allRecords.result) {
        await sendToServer(data); // Kirim data satu per satu
      }
      // Hapus data lokal setelah sukses sinkron
      store.clear();
      
      // Tampilkan Notifikasi
      showSyncNotification(allRecords.result.length);
    }
  };
});



function showSyncNotification(count) {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification('Sinkronisasi Berhasil!', {
        body: `${count} data keuangan telah berhasil dikirim ke server.`,
        icon: '/icon-192.png'
      });
    });
  }
}



window.addEventListener('online', () => {
    const transaction = db.transaction(['offline_expenses'], 'readwrite');
    const store = transaction.objectStore('offline_expenses');
    const getAll = store.getAll();

    getAll.onsuccess = async () => {
        if (getAll.result.length > 0) {
            for (const item of getAll.result) {
                await sendToServer(item); // Kirim ke server
            }
            store.clear(); // HAPUS isi IndexedDB karena sudah aman di server
            console.log('Semua data offline telah disinkronkan!');
            
            // Panggil notifikasi yang sudah Anda buat sebelumnya
            showOnlineNotification(); 
        }
    };
});


async function saveToIndexedDBOffline(data) {
    const dbLocal = await openDB(); // Pakai fungsi openDB() yang sudah ada di atas
    const tx = dbLocal.transaction('expenses', 'readwrite');
    tx.objectStore('expenses').add({ ...data, id: Date.now(), status: 'pending' });
    
    showNotification("Mode Offline: Tersimpan di HP 📥", "cute");
    render(); 
}