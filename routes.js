const pool = require('./db'); 

const routes = [
  // --- 1. AMBIL DATA KEUANGAN ---
  {
    method: 'GET',
    path: '/transactions',
    handler: async (request, h) => {
      try {
        // Urutkan dari tanggal terbaru
        const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
        return { data: result.rows };
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    },
  },

  // --- 2. TAMBAH TRANSAKSI ---
  {
    method: 'POST',
    path: '/transactions',
    handler: async (request, h) => {
      try {
        const { title, amount, category, date } = request.payload;
        const id = `trans-${Date.now()}`;
        
        const query = 'INSERT INTO transactions (id, title, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        await pool.query(query, [id, title, amount, category, date]);
        
        return h.response({ message: 'Transaction added', id }).code(201);
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    },
  },

  // --- 3. HAPUS TRANSAKSI ---
  {
    method: 'DELETE',
    path: '/transactions/{id}',
    handler: async (request, h) => {
      try {
        const { id } = request.params;
        await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        return { message: 'Transaction deleted' };
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Database error' }).code(500);
      }
    },
  }
];

module.exports = routes;