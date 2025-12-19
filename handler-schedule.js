// Kita tidak perlu mendefinisikan URL di luar fungsi agar lebih aman dari undefined
const addScheduleHandler = async (request, h) => {
    try {
        // Ambil URL & KEY langsung di dalam fungsi
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;

        // Cek terminal jika ini muncul undefined
        if (!url) console.error("EROR: SUPABASE_URL tidak terbaca di handler-schedule!");

        const { subject, day, room, startTime, endTime, lecturer } = request.payload;

        const response = await fetch(`${url}/rest/v1/schedules`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                matkul: subject,
                hari: day,
                ruangan: room,
                mulai: startTime,
                selesai: endTime,
                dosen: lecturer,
                materi: request.payload.materi, // Tambahan
                tugas: request.payload.tugas,   // Tambahan
                deadline: request.payload.deadline // Tambahan
            }),
        });

        const result = await response.json();
        return h.response({ status: 'success', data: result }).code(201);
    } catch (error) {
        console.error("DEBUG JADWAL:", error.message);
        return h.response({ status: 'error', message: error.message }).code(500);
    }
};

const getAllSchedulesHandler = async (request, h) => {
    try {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;

        const response = await fetch(`${url}/rest/v1/schedules?select=*`, {
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
            },
        });
        const data = await response.json();
        return h.response({ status: 'success', data }).code(200);
    } catch (error) {
        return h.response({ status: 'error', message: error.message }).code(500);
    }
};

const deleteScheduleByIdHandler = async (request, h) => {
    try {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;
        const { id } = request.params;

        const response = await fetch(`${url}/rest/v1/schedules?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
            },
        });
        return h.response({ status: 'success', message: 'Berhasil dihapus' }).code(200);
    } catch (error) {
        return h.response({ status: 'error', message: error.message }).code(500);
    }
};

// --- TAMBAHKAN FUNGSI INI ---
// Tambahkan fungsi ini di handler-schedule.js (di atas module.exports)
const updateTaskHandler = async (request, h) => {
    try {
        const { id } = request.params;
        const { tugas, deadline } = request.payload;
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;

        const response = await fetch(`${url}/rest/v1/schedules?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ tugas, deadline }), // Mengupdate kolom tugas & deadline
        });

        if (!response.ok) throw new Error('Gagal update di Supabase');
        return h.response({ status: 'success', message: 'Tugas disimpan' }).code(200);
    } catch (error) {
        return h.response({ status: 'error', message: error.message }).code(500);
    }
};

// --- WAJIB: Pastikan updateTaskHandler masuk ke sini ---
module.exports = { 
    addScheduleHandler, 
    getAllSchedulesHandler, 
    deleteScheduleByIdHandler, 
    updateTaskHandler // <--- JANGAN SAMPAI TERLEWAT
};