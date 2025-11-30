let token = null;
let notes = [];
let editingNoteId = null;

// ==================== AUTH =====================
function openAuthDialog(mode = "login") {
    const dialog = document.getElementById('authDialog');
    document.getElementById('authTitle').textContent = mode === "login" ? "Login" : "Signup";
    dialog.showModal();
    dialog.dataset.mode = mode;
}

function closeAuthDialog() {
    document.getElementById('authDialog').close();
}

async function handleAuth(event) {
    event.preventDefault();
    const mode = document.getElementById('authDialog').dataset.mode;
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    try {
        const res = await fetch(`http://localhost:5000/auth/${mode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
            token = data.token; // Save JWT token
            closeAuthDialog();
            alert(`${mode === "login" ? "Login" : "Signup"} successful!`);
            await fetchNotes(); // Load notes after login/signup
        } else if (data.message) {
            alert(data.message);
        } else if (data.error) {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

// ==================== NOTES CRUD =====================
async function fetchNotes() {
    if (!token) return;
    try {
        const res = await fetch("http://localhost:5000/notes", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        notes = await res.json();
        renderNotes();
    } catch (err) {
        console.error(err);
    }
}

async function saveNote(event) {
    event.preventDefault();
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!token) {
        alert("Login first!");
        return;
    }

    try {
        if (editingNoteId) {
            // Update note
            const res = await fetch(`http://localhost:5000/notes/${editingNoteId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });
            const updatedNote = await res.json();
        } else {
            // Create note
            const res = await fetch("http://localhost:5000/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });
            const newNote = await res.json();
        }
        editingNoteId = null;
        closeNoteDialog();
        await fetchNotes();
    } catch (err) {
        console.error(err);
    }
}

async function deleteNote(noteId) {
    if (!token) {
        alert("Login first!");
        return;
    }
    try {
        await fetch(`http://localhost:5000/notes/${noteId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        await fetchNotes();
    } catch (err) {
        console.error(err);
    }
}

// ==================== DIALOGS =====================
function openNoteDialog(noteId = null){
    const dialog = document.getElementById('noteDialog');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');

    if(noteId){
        const noteToEdit = notes.find(note => note._id === noteId);
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

function closeNoteDialog(){
    document.getElementById('noteDialog').close();
}

// ==================== RENDER =====================
function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');

  if (!notes || notes.length === 0) {
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
        <button class="edit-btn" onclick="openNoteDialog('${note._id}')" title="Edit Note">✏️</button>
        <button class="delete-btn" onclick="deleteNote('${note._id}')" title="Delete Note">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ==================== THEME =====================
function toggleTheme(){
    document.body.classList.toggle('dark-theme');
}

// ==================== INIT =====================
document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('noteForm').addEventListener('submit', saveNote);
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('noteDialog').addEventListener('click', function(event){
        if(event.target === this) closeNoteDialog();
    });

    document.getElementById('loginBtn').addEventListener('click', () => openAuthDialog("login"));
    document.getElementById('signupBtn').addEventListener('click', () => openAuthDialog("signup"));
    document.getElementById('authForm').addEventListener('submit', handleAuth);
});
