let notes = [];
let editingNoteId = null;
let token = localStorage.getItem('token') || null; // JWT token

// ------------------ NOTES FUNCTIONS ------------------

async function loadNotes() {
  if (!token) return []; // no token → no notes
  try {
    const res = await fetch('http://localhost:5000/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch notes');
    notes = await res.json();
    renderNotes();
  } catch (err) {
    console.error(err);
    alert('Failed to load notes from server');
  }
}

async function saveNote(event) {
  event.preventDefault();
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  if (!title || !content) return;

  const noteData = { title, content };
  const url = editingNoteId ? `http://localhost:5000/notes/${editingNoteId}` : 'http://localhost:5000/notes';
  const method = editingNoteId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noteData)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to save note');

    // Update local notes array
    if (editingNoteId) {
      const index = notes.findIndex(n => n.id === editingNoteId);
      if (index !== -1) notes[index] = data;
      editingNoteId = null;
    } else {
      notes.unshift(data);
    }

    renderNotes();
    closeNoteDialog();
  } catch (err) {
    console.error(err);
    alert('Failed to save note');
  }
}

async function deleteNote(noteId) {
  if (!token) return;
  try {
    const res = await fetch(`http://localhost:5000/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete note');

    notes = notes.filter(note => note.id !== noteId);
    renderNotes();
  } catch (err) {
    console.error(err);
    alert('Failed to delete note');
  }
}

// ------------------ RENDER / DIALOG FUNCTIONS ------------------

function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');
  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `;
    return;
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="note-card">
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <div class="note-actions">
        <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">✏️</button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  if (noteId) {
    const noteToEdit = notes.find(note => note.id === noteId);
    editingNoteId = noteId;
    document.getElementById('dialogTitle').textContent = 'Edit Note';
    titleInput.value = noteToEdit.title;
    contentInput.value = noteToEdit.content;
  } else {
    editingNoteId = null;
    document.getElementById('dialogTitle').textContent = 'Add New Note';
    titleInput.value = '';
    contentInput.value = '';
  }

  dialog.showModal();
  titleInput.focus();
}

function closeNoteDialog() {
  document.getElementById('noteDialog').close();
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}

// ------------------ AUTH FUNCTIONS ------------------

function openAuthDialog(mode = 'login') {
  const dialog = document.getElementById('authDialog');
  document.getElementById('authTitle').textContent = mode === 'login' ? 'Login' : 'Signup';
  dialog.showModal();
}

function closeAuthDialog() {
  document.getElementById('authDialog').close();
}

async function handleAuth(event) {
  event.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  const authMode = document.getElementById('authTitle').textContent.toLowerCase();

  if (!email || !password) return;

  const url = authMode === 'login' ? 'http://localhost:5000/auth/login' : 'http://localhost:5000/auth/signup';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Auth failed');

    alert(data.message);
    closeAuthDialog();

    if (authMode === 'login') {
      token = data.token;
      localStorage.setItem('token', token);
      await loadNotes(); // fetch notes from backend
    }
  } catch (err) {
    console.error(err);
    alert('Auth error');
  }
}

// ------------------ EVENT LISTENERS ------------------

document.addEventListener('DOMContentLoaded', () => {
  if (token) loadNotes(); // load backend notes if logged in

  // Notes form
  document.getElementById('noteForm').addEventListener('submit', saveNote);

  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  // Note dialog click outside
  document.getElementById('noteDialog').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeNoteDialog();
  });

  // Auth buttons
  document.getElementById('loginBtn').addEventListener('click', () => openAuthDialog('login'));
  document.getElementById('signupBtn').addEventListener('click', () => openAuthDialog('signup'));

  // Auth form
  document.getElementById('authForm').addEventListener('submit', handleAuth);

  // Auth dialog click outside
  document.getElementById('authDialog').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAuthDialog();
  });
});
