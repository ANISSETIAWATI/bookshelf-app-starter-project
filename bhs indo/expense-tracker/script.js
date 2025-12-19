/* Expense Tracker - Vanilla JS + IndexedDB (with LocalStorage fallback) */

const STORAGE_KEY = 'expense_transactions_v1'
const DB_NAME = 'expense_tracker_db'
const DB_VERSION = 1
const DB_STORE = 'transactions'
let transactions = []

// DOM
const form = document.getElementById('expense-form')
const titleInput = document.getElementById('title')
const amountInput = document.getElementById('amount')
const categoryInput = document.getElementById('category')
const dateInput = document.getElementById('date')
const listEl = document.getElementById('transactions-list')
const todayTotalEl = document.getElementById('today-total')
const ctx = document.getElementById('weekChart')

// initialize date input to today
(function initDate(){
  const today = new Date().toISOString().slice(0,10)
  dateInput.value = today
})()

// IndexedDB helper
function openDB(){
  return new Promise((resolve, reject)=>{
    if(!('indexedDB' in window)) return reject(new Error('IndexedDB not supported'))
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e)=>{
      const db = e.target.result
      if(!db.objectStoreNames.contains(DB_STORE)){
        db.createObjectStore(DB_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e)=> resolve(e.target.result)
    req.onerror = (e)=> reject(e.target.error)
  })
}

async function getAllFromDB(){
  try{
    const db = await openDB()
    return await new Promise((resolve,reject)=>{
      const tx = db.transaction(DB_STORE, 'readonly')
      const store = tx.objectStore(DB_STORE)
      const req = store.getAll()
      req.onsuccess = ()=> resolve(req.result || [])
      req.onerror = ()=> reject(req.error)
    })
  }catch(e){
    console.warn('[Expenses] getAllFromDB failed, fallback to LocalStorage', e)
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw? JSON.parse(raw): []
  }
}

async function addToDB(item){
  try{
    const db = await openDB()
    return await new Promise((resolve,reject)=>{
      const tx = db.transaction(DB_STORE, 'readwrite')
      const store = tx.objectStore(DB_STORE)
      const req = store.add(item)
      req.onsuccess = ()=> resolve(true)
      req.onerror = ()=> reject(req.error)
    })
  }catch(e){
    console.warn('[Expenses] addToDB failed, fallback to LocalStorage', e)
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr = raw? JSON.parse(raw): []
      arr.push(item)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
      return true
    }catch(err){ throw err }
  }
}

async function deleteFromDB(id){
  try{
    const db = await openDB()
    return await new Promise((resolve,reject)=>{
      const tx = db.transaction(DB_STORE, 'readwrite')
      const store = tx.objectStore(DB_STORE)
      const req = store.delete(id)
      req.onsuccess = ()=> resolve(true)
      req.onerror = ()=> reject(req.error)
    })
  }catch(e){
    console.warn('[Expenses] deleteFromDB failed, fallback to LocalStorage', e)
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr = raw? JSON.parse(raw): []
      const filtered = arr.filter(t=> t.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return true
    }catch(err){ throw err }
  }
}

async function clearDB(){
  try{
    const db = await openDB()
    return await new Promise((resolve,reject)=>{
      const tx = db.transaction(DB_STORE, 'readwrite')
      const store = tx.objectStore(DB_STORE)
      const req = store.clear()
      req.onsuccess = ()=> resolve(true)
      req.onerror = ()=> reject(req.error)
    })
  }catch(e){
    console.warn('[Expenses] clearDB failed, fallback to LocalStorage', e)
    try{ localStorage.removeItem(STORAGE_KEY) }catch(_){}
    return true
  }
}

// Storage detection helpers
let storageMode = 'unknown' // 'indexeddb' | 'localstorage' | 'none'

async function checkStorageSupport(){
  // check IndexedDB availability by trying to open
  let idbOk = false
  try{
    if('indexedDB' in window){
      const db = await openDB()
      try{ db.close && db.close() }catch(_){}
      idbOk = true
    }
  }catch(e){
    console.warn('[Expenses] IndexedDB unavailable:', e && e.message)
    idbOk = false
  }

  // check localStorage
  let lsOk = false
  try{
    const testKey = '_test_ls'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    lsOk = true
  }catch(e){
    console.warn('[Expenses] LocalStorage unavailable:', e && e.message)
    lsOk = false
  }

  if(idbOk) storageMode = 'indexeddb'
  else if(lsOk) storageMode = 'localstorage'
  else storageMode = 'none'

  updateStorageStatusUI()
  console.info('[Expenses] storageMode =', storageMode)
  return storageMode
}

function updateStorageStatusUI(){
  const el = document.getElementById('storage-status')
  if(!el) return
  if(storageMode === 'indexeddb'){
    el.innerHTML = '<div class="alert alert-success p-2">IndexedDB tersedia — data akan tersimpan secara persisten.</div>'
  }else if(storageMode === 'localstorage'){
    el.innerHTML = '<div class="alert alert-warning p-2">IndexedDB tidak tersedia; menggunakan LocalStorage sebagai fallback.</div>'
  }else{
    el.innerHTML = '<div class="alert alert-danger p-2">Peringatan: Tidak ada storage persisten yang tersedia — data tidak akan bertahan setelah reload. Gunakan tombol Export untuk backup.</div>'
  }
}

// Load
async function load(){
  try{
    await checkStorageSupport()
    if(storageMode === 'indexeddb'){
      const arr = await getAllFromDB()
      transactions = Array.isArray(arr)? arr : []
    }else if(storageMode === 'localstorage'){
      const raw = localStorage.getItem(STORAGE_KEY)
      transactions = raw? JSON.parse(raw): []
    }else{
      // no persistent storage available - keep in-memory only
      transactions = []
    }

    console.debug('[Expenses] Loaded', transactions.length, 'transactions (mode:', storageMode + ')')
  }catch(e){
    console.error('[Expenses] Load error', e)
    transactions = []
  }
}

// Export current transactions to clipboard (JSON) - read from DB for accurate state
async function exportData(){
  try{
    const dataArr = await getAllFromDB()
    const data = JSON.stringify(dataArr, null, 2)
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(data).then(()=> alert('JSON disalin ke clipboard'), ()=> alert('Gagal menyalin ke clipboard'))
    }else{
      prompt('Salin JSON ini:', data)
    }
  }catch(e){
    alert('Export gagal: ' + (e && e.message))
  }
}

// Import transactions from JSON (prompt) - overwrite DB
async function importData(){
  const raw = prompt('Tempel JSON transaksi (exported data):')
  if(!raw) return
  try{
    const arr = JSON.parse(raw)
    if(!Array.isArray(arr)) throw new Error('Data harus berupa array transaksi')
    await clearDB()
    // add one by one
    for(const it of arr){
      // ensure id exists
      if(!it.id) it.id = Date.now() + Math.floor(Math.random()*1000)
      await addToDB(it)
    }
    await load()
    refresh()
    alert('Import berhasil')
  }catch(e){
    alert('Import gagal: ' + (e && e.message))
  }
}

async function clearData(){
  if(confirm('Hapus semua transaksi di database?')){
    await clearDB()
    transactions = []
    refresh()
    alert('Data dihapus')
  }
}

function formatIDR(number){
  const nf = new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0})
  return nf.format(number)
}

function renderTransactions(){
  listEl.innerHTML = ''
  // newest first
  const items = [...transactions].sort((a,b)=> b.id - a.id)
  if(items.length===0){
    listEl.innerHTML = '<div class="text-muted">Belum ada transaksi</div>'
    return
  }

  for(const tx of items){
    const li = document.createElement('div')
    li.className = 'list-group-item d-flex align-items-center justify-content-between'

    const left = document.createElement('div')
    left.style.display = 'flex'
    left.style.gap = '12px'
    left.style.alignItems = 'center'

    // icon circle
    const icon = document.createElement('div')
    icon.style.width = '44px'
    icon.style.height = '44px'
    icon.style.borderRadius = '10px'
    icon.style.display = 'grid'
    icon.style.placeItems = 'center'
    icon.style.background = '#fef3f8'
    icon.style.flex = '0 0 44px'
    icon.innerHTML = '<i data-lucide="credit-card" style="color:#ff6fae"></i>'

    const texts = document.createElement('div')
    texts.innerHTML = `<div class="tx-title">${escapeHtml(tx.title)}</div><div class="tx-meta">${tx.category} • ${formatDateShort(tx.date)}</div>`

    left.appendChild(icon)
    left.appendChild(texts)

    const right = document.createElement('div')
    right.className = 'd-flex align-items-center gap-3'
    const amt = document.createElement('div')
    amt.className = 'tx-amount'
    amt.textContent = '- ' + formatIDR(tx.amount)

    const delBtn = document.createElement('button')
    delBtn.className = 'btn btn-sm btn-outline-secondary'
    delBtn.title = 'Hapus'
    delBtn.innerHTML = '<i data-lucide="trash-2"></i>'
    delBtn.onclick = ()=>{ if(confirm('Hapus transaksi ini?')) deleteTx(tx.id) }

    right.appendChild(amt)
    right.appendChild(delBtn)

    li.appendChild(left)
    li.appendChild(right)

    listEl.appendChild(li)
  }
  // redraw lucide icons
  if(window.lucide) window.lucide.replace()
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[c]))
}

function formatDateShort(d){
  const dt = new Date(d)
  const options = {day:'2-digit', month:'short'}
  return dt.toLocaleDateString('id-ID', options)
}

async function addTx({title, amount, category, date}){
  const tx = {id: Date.now(), title, amount:+amount, category, date}
  await addToDB(tx)
  transactions.push(tx)
  refresh()
}

async function deleteTx(id){
  await deleteFromDB(id)
  transactions = transactions.filter(t=> t.id !== id)
  refresh()
}

function calcTodayTotal(){
  const today = (new Date()).toISOString().slice(0,10)
  const total = transactions.filter(t=> t.date===today).reduce((s,t)=> s + t.amount, 0)
  todayTotalEl.textContent = formatIDR(total)
}

// Chart 7 days
let chartInst = null
function renderChart(){
  // labels: last 7 days with Indonesian short names
  const days = []
  const sums = []
  for(let i=6;i>=0;i--){
    const d = new Date()
    d.setDate(d.getDate()-i)
    const iso = d.toISOString().slice(0,10)
    days.push(d.toLocaleDateString('id-ID', {weekday:'short'}))
    const s = transactions.filter(t=> t.date===iso).reduce((a,b)=> a+b.amount,0)
    sums.push(s)
  }

  const data = {
    labels: days,
    datasets: [{
      label: 'Pengeluaran',
      data: sums,
      borderRadius: 6,
      backgroundColor: sums.map(v => v>0 ? 'rgba(225,29,116,0.9)' : 'rgba(225,29,116,0.2)'),
      barThickness: 14
    }]
  }

  if(chartInst) {
    chartInst.data = data;
    chartInst.update();
  } else {
    chartInst = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: function(val){ return val>0 ? formatIDR(val) : ''; } } } }
      }
    });
  }
}

function refresh(){
  renderTransactions()
  calcTodayTotal()
  renderChart()
}

// Handle form submit
form.addEventListener('submit', async (e)=>{
  e.preventDefault()
  const title = titleInput.value.trim()
  const amount = +amountInput.value
  const category = categoryInput.value
  const date = dateInput.value
  if(!title || !amount || !date){ alert('Isi semua field.'); return }
  try{
    await addTx({title,amount,category,date})
    form.reset()
    // set date back to today
    dateInput.value = new Date().toISOString().slice(0,10)
  }catch(e){
    console.error('[Expenses] addTx error', e)
    alert('Gagal menambah transaksi: ' + (e && e.message))
  }
})

// boot
(async function boot(){
  await load()
  refresh()
  // wire export/import/clear buttons if present
  const exportBtn = document.getElementById('exportBtn')
  const importBtn = document.getElementById('importBtn')
  const clearBtn = document.getElementById('clearBtn')
  if(exportBtn) exportBtn.addEventListener('click', ()=> exportData())
  if(importBtn) importBtn.addEventListener('click', ()=> importData())
  if(clearBtn) clearBtn.addEventListener('click', ()=> clearData())

  if(window.lucide) window.lucide.replace()

  // Warn user before leaving if there's no persistent storage
  if(storageMode === 'none'){
    window.addEventListener('beforeunload', (e)=>{
      if(transactions && transactions.length>0){
        e.preventDefault()
        e.returnValue = 'Data tidak tersimpan secara persisten. Pastikan export jika ingin menyimpan.'
        return e.returnValue
      }
    })
  }
})();
