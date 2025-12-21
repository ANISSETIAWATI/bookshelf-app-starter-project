# 📚 MyShelf - Student Organizer & Planner

**MyShelf** adalah aplikasi web berbasis *Single Page Application* (SPA) sederhana yang dirancang khusus untuk membantu mahasiswa mengelola produktivitas harian mereka. Aplikasi ini menggabungkan manajemen buku, catatan kuliah, keuangan, dan jadwal kelas dalam satu antarmuka yang estetis dan responsif.

## ✨ Fitur Utama

Aplikasi ini memiliki 5 modul utama yang saling terintegrasi:

### 1. 📖 Rak Buku (My Bookshelf)
* Menambahkan buku baru dengan status (Selesai/Belum Selesai).
* Memindahkan buku antar rak (Sedang Dibaca <-> Selesai).
* Menghapus buku dari koleksi.
* Fitur pencarian (*Search*) judul buku secara *real-time*.
* Statistik jumlah buku yang telah diselesaikan.

### 2. 📝 Catatan & Ide (Creative Notebook)
* Tampilan visual menyerupai buku catatan fisik dengan efek 3D.
* Menulis cerita atau catatan kuliah per halaman.
* **Fitur Stiker:** Menambahkan dekorasi stiker lucu pada setiap halaman catatan.
* Navigasi halaman (Next/Prev) dan fitur "robek halaman" (hapus).

### 3. 💰 Dompet Mahasiswa (Finance Tracker)
* Mencatat pengeluaran harian berdasarkan kategori (Makan, Transport, Tugas, dll).
* **Visualisasi Grafik:** Grafik batang otomatis untuk memantau pengeluaran 7 hari terakhir.
* Riwayat transaksi lengkap dengan opsi hapus data.
* Kalkulasi total pengeluaran harian secara otomatis.

### 4. 📅 Jadwal Kuliah (Class Schedule)
* Mengatur jadwal mata kuliah berdasarkan hari (Senin - Minggu).
* Menampilkan detail ruangan, jam, dan nama dosen.
* Filter jadwal otomatis berdasarkan hari yang dipilih.

### 5. ✅ Aktivitas Harian (Daily Goals)
* *To-do list* sederhana untuk target harian.
* Menandai aktivitas yang sudah selesai (*check/uncheck*).

---

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan teknologi web standar tanpa *framework* berat, sehingga sangat ringan dan cepat.

* **HTML5:** Struktur semantik dokumen.
* **CSS3 (Vanilla):** Styling modern menggunakan *CSS Variables*, *Flexbox*, *Grid Layout*, dan *Keyframe Animations*.
* **JavaScript (ES6+):** Logika interaktif, manajemen *state* lokal, dan manipulasi DOM.
* **Lucide Icons:** Pustaka ikon ringan untuk mempercantik antarmuka.

---

## 📂 Struktur Folder

Pastikan susunan file dalam foldermu seperti ini agar aplikasi berjalan lancar:

```text
/myshelf-project
│
├── index.html      # Struktur utama halaman
├── style.css       # Gaya dan tema tampilan
├── script.js       # Logika aplikasi dan data
└── README.md       # Dokumentasi proyek

## Menjalankan secara lokal

- Instal dependency backend:

	```bash
	npm run install-backend
	```

- Jalankan server dan buka http://localhost:3000:

	```bash
	npm start
	```
