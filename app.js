const token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmM1MGJiMmRiMDA4ODcxOTRlMmVkNSIsImVtYWlsIjoibWF4QGV4YW1wbGUuY29tIiwiaWF0IjoxNzY0NTEzMTA0LCJleHAiOjE3NjQ1MTY3MDR9.BzbXNcBMvEpVu8Dktz0lj5Dsiyvpyt1N1xULZ0jYGh0;
let notes = []
let editingNoteId = null
function loadNotes(){
    const savedNotes = localStorage.getItem('quickNotes')
    return savedNotes ? JSON.parse(savedNotes): []
}
function saveNote(event) {
    event.preventDefault();
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (editingNoteId) {
        // update existing note
        const index = notes.findIndex(note => note.id === editingNoteId);
        // notes[noteIndex]= {
        //     ...notes[noteIndex],
        //     title: title,
        //     content: content

        // }
        if (index !== -1) {
            notes[index].title = title;
            notes[index].content = content;
        }
        editingNoteId = null; // reset
    } else {
        // create mode
        notes.unshift({
            id: generateId(),
            title: title,
            content: content
        });
    }

    saveNotes();
    renderNotes();
    closeNoteDialog();
}

function generateId(){
    return Date.now().toString()
}
function saveNotes(){
    localStorage.setItem('quickNotes', JSON.stringify(notes))
}
function deleteNote(noteId){
    notes = notes.filter(note => note.id!=noteId)
    saveNotes()
    renderNotes()
}
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
        <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
          ✏️
        </button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}


function openNoteDialog(noteId = null){
    const  dialog = document.getElementById('noteDialog');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    if(noteId){
        // edit mode
        const noteToEdit = notes.find(note => note.id === noteId)
        editingNoteId = noteId
        document.getElementById('dialogTitle').textContent = 'Edit Note'
        titleInput.value = noteToEdit.title
        contentInput.value = noteToEdit.content

    }
    else{
        // add mode
        editingNoteId = null
        document.getElementById('dialogTitle').textContent = 'Add New Note'
        titleInput.value = ''
        contentInput.value = ''       
       
    }

    dialog.showModal()
    titleInput.focus()
}
function closeNoteDialog(){
    document.getElementById('noteDialog').close()
}
function toggleTheme(){
    document.body.classList.toggle('dark-theme')
}
document.addEventListener('DOMContentLoaded',function(){
    notes = loadNotes()
    renderNotes()
    document.getElementById('noteForm').addEventListener('submit',saveNote)
    document.getElementById('themeToggleBtn').addEventListener('click',toggleTheme)
    document.getElementById('noteDialog').addEventListener('click',function(event){
        if(event.target===this){
            closeNoteDialog()
        }
    })
})
