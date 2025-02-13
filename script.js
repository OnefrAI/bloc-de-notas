document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const dictateButton = document.getElementById('dictateButton');
  const cameraButton = document.getElementById('cameraButton');
  const newNoteButton = document.getElementById('newNoteButton');

  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const documentNumber = document.getElementById('documentNumber').value;
    const fullName = document.getElementById('fullName').value;
    const birthdate = document.getElementById('birthdate').value;
    const parentsName = document.getElementById('parentsName').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const facts = document.getElementById('facts').value;

    saveNote(documentNumber, fullName, birthdate, parentsName, address, phone, facts);
  });

  newNoteButton.addEventListener('click', () => {
    noteForm.reset();
  });

  function saveNote(...args) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push({ ...args, timestamp: new Date().toISOString() });
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    noteForm.reset();
  }

  function displayNotes() {
    notesContainer.innerHTML = JSON.parse(localStorage.getItem('notes')) || [];
  }

  displayNotes();
});
