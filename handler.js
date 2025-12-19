const { Pool } = require('pg');

// --- KONEKSI SUPABASE (YANG SUDAH BENAR) ---
const pool = new Pool({
  // User diambil dari: postgres.twudrewpppripvqfojnn
  user: 'postgres.twudrewpppripvqfojnn', 
  
  // Host diambil dari: aws-1-ap-southeast-1.pooler.supabase.com
  host: 'aws-1-ap-southeast-1.pooler.supabase.com', 
  
  database: 'postgres',
  
  // Password kamu:
  password: 'AnisSetiawati2025!', 
  
  // Port dari link kamu (6543 adalah port Pooler Supabase)
  port: 6543, 
  
  // Supabase wajib pakai SSL
  ssl: { rejectUnauthorized: false } 
});

const addTransactionHandler = async (request, h) => {
  const { title, amount, category, date } = request.payload;
  const id = Date.now().toString();

  try {
    const query = {
      text: 'INSERT INTO transactions(id, title, amount, category, date) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, title, amount, category, date],
    };
    const result = await pool.query(query);
    return h.response({
      status: 'success',
      message: 'Transaksi berhasil ditambahkan',
      data: { transactionId: result.rows[0].id },
    }).code(201);
  } catch (error) {
    console.error(error);
    return h.response({ status: 'error', message: 'Gagal menambahkan data' }).code(500);
  }
};

const getAllTransactionsHandler = async () => {
  try {
    const result = await pool.query('SELECT * FROM transactions');
    return {
      status: 'success',
      data: { transactions: result.rows },
    };
  } catch (error) {
    console.error(error);
    return { status: 'error', message: 'Gagal mengambil data' };
  }
};

const deleteTransactionHandler = async (request, h) => {
  const { id } = request.params;
  try {
    const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
        return h.response({ status: 'fail', message: 'Id tidak ditemukan' }).code(404);
    }
    
    return { status: 'success', message: 'Transaksi berhasil dihapus' };
  } catch (error) {
    console.error(error);
    return h.response({ status: 'error', message: 'Gagal menghapus data' }).code(500);
  }
};

module.exports = { 
    addTransactionHandler, 
    getAllTransactionsHandler, 
    deleteTransactionHandler 
};