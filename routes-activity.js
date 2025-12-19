const pool = require('./db');

const activityRoutes = [
  // --- 1. AMBIL SEMUA AKTIVITAS ---
  {
    method: 'GET',
    path: '/activities',
    handler: async (request, h) => {
      try {
        // Urutkan berdasarkan ID biar posisinya konsisten
        const result = await pool.query('SELECT * FROM activities ORDER BY id ASC');
        return { data: result.rows };
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    },
  },

  // --- 2. TAMBAH AKTIVITAS ---
  {
    method: 'POST',
    path: '/activities',
    handler: async (request, h) => {
      try {
        const { task, done, date, completedTime } = request.payload;
        const id = `act-${Date.now()}`; 
        
        // Perhatikan tanda kutip dua pada "completedTime" (karena case-sensitive di Postgres)
        const query = `
          INSERT INTO activities (id, task, done, date, "completedTime") 
          VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;
        
        await pool.query(query, [id, task, done, date, completedTime]);
        return h.response({ message: 'Activity added', id }).code(201);
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    },
  },

  // --- 3. UPDATE STATUS (Centang/Jam) ---
  {
    method: 'PATCH',
    path: '/activities/{id}',
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        const { done, completedTime } = request.payload;
        
        await pool.query(
          'UPDATE activities SET done = $1, "completedTime" = $2 WHERE id = $3',
          [done, completedTime, id]
        );
        
        return { message: 'Activity updated' };
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    },
  },

  // --- 4. HAPUS AKTIVITAS ---
  {
    method: 'DELETE',
    path: '/activities/{id}',
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        await pool.query('DELETE FROM activities WHERE id = $1', [id]);
        return { message: 'Activity deleted' };
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    },
  },
];

module.exports = activityRoutes;