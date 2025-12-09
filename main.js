// API base URL
const API_BASE = 'http://localhost:3000/books';

// Fungsi untuk mendapatkan data buku dari API
async function getBooks() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch books');
    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

// Fungsi untuk menambah buku ke API
async function addBookAPI(book) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    if (!response.ok) throw new Error('Failed to add book');
    return await response.json();
  } catch (error) {
    console.error('Error adding book:', error);
    alert('Gagal menambah buku');
  }
}

// Fungsi untuk mengupdate buku di API
async function updateBookAPI(id, book) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    if (!response.ok) throw new Error('Failed to update book');
    return await response.json();
  } catch (error) {
    console.error('Error updating book:', error);
    alert('Gagal mengupdate buku');
  }
}

// Fungsi untuk menghapus buku dari API
async function deleteBookAPI(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete book');
    return true;
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('Gagal menghapus buku');
  }
}

// Fungsi untuk membuat elemen HTML buku
function makeBookElement(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const bookItem = document.createElement('div');
  bookItem.setAttribute('data-bookid', id);
  bookItem.setAttribute('data-testid', 'bookItem');

  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = title;

  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = `Penulis: ${author}`;

  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = `Tahun: ${year}`;

  const actionDiv = document.createElement('div');

  const completeButton = document.createElement('button');
  completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  completeButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';

  completeButton.addEventListener('click', () => {
    moveBook(id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';

  deleteButton.addEventListener('click', () => {
    removeBook(id);
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';

  editButton.addEventListener('click', () => {
    showEditForm(id);
  });

  actionDiv.append(completeButton, deleteButton, editButton);
  bookItem.append(bookTitle, bookAuthor, bookYear, actionDiv);

  return bookItem;
}

// Fungsi untuk render buku ke rak yang sesuai
function renderBooks() {
  const incompleteBookshelfList = document.getElementById('incompleteBookList');
  const completeBookshelfList = document.getElementById('completeBookList');
  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  const books = getData();

  for (const book of books) {
    const bookElement = makeBookElement(book);
    if (book.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
}

// Fungsi untuk menambahkan buku baru
function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = Number(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const newBook = {
    id: +new Date(),
    title,
    author,
    year,
    isComplete,
  };

  const books = getData();
  books.push(newBook);
  saveData(books);
  renderBooks();
}

// Fungsi untuk memindahkan buku antar rak
function moveBook(id) {
  const books = getData();
  const bookIndex = books.findIndex(book => book.id === id);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    saveData(books);
    renderBooks();
  }
}

// Fungsi untuk menghapus buku
function removeBook(id) {
  const books = getData();
  const newBooks = books.filter(book => book.id !== id);

  if (books.length > newBooks.length) {
    saveData(newBooks);
    renderBooks();
  }
}

// Fungsi untuk mencari buku berdasarkan judul
function searchBooks(searchTerm) {
  const incompleteBookshelfList = document.getElementById('incompleteBookList');
  const completeBookshelfList = document.getElementById('completeBookList');
  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  const books = getData();
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm));

  for (const book of filteredBooks) {
    const bookElement = makeBookElement(book);
    if (book.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
}

// Fungsi untuk menampilkan form edit dengan data buku yang dipilih
function showEditForm(id) {
  const books = getData();
  const bookToEdit = books.find(book => book.id === id);

  if (bookToEdit) {
    const editFormContainer = document.getElementById('editFormContainer');
    editFormContainer.innerHTML = `
      <form id="editBookForm">
        <h3>Edit Buku</h3>
        <input type="hidden" id="editBookId" value="${bookToEdit.id}">
        <label for="editBookTitle">Judul:</label>
        <input type="text" id="editBookTitle" value="${bookToEdit.title}" required>
        <label for="editBookAuthor">Penulis:</label>
        <input type="text" id="editBookAuthor" value="${bookToEdit.author}" required>
        <label for="editBookYear">Tahun:</label>
        <input type="number" id="editBookYear" value="${bookToEdit.year}" required>
        <button type="submit">Simpan Perubahan</button>
      </form>
    `;

    // Tambahkan event listener untuk form edit
    const editBookForm = document.getElementById('editBookForm');
    editBookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveEditedBook();
    });
  }
}

// Fungsi untuk menyimpan buku yang telah diedit
function saveEditedBook() {
  const id = Number(document.getElementById('editBookId').value);
  const title = document.getElementById('editBookTitle').value;
  const author = document.getElementById('editBookAuthor').value;
  const year = Number(document.getElementById('editBookYear').value);

  const books = getData();
  const bookIndex = books.findIndex(book => book.id === id);

  if (bookIndex !== -1) {
    books[bookIndex].title = title;
    books[bookIndex].author = author;
    books[bookIndex].year = year;
    saveData(books);
    renderBooks();

    // Sembunyikan form edit setelah disimpan
    const editFormContainer = document.getElementById('editFormContainer');
    editFormContainer.innerHTML = '';
  }
}

// Event listener saat DOM sudah dimuat
document.addEventListener('DOMContentLoaded', () => {
  if (isStorageExist()) {
    renderBooks();
  }

  const bookForm = document.getElementById('bookForm');
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addBook();
    bookForm.reset();
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById('searchBookTitle').value.toLowerCase();
    searchBooks(searchTerm);
  });

  // Set dynamic year in footer (fallback value exists in HTML if JS disabled)
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});