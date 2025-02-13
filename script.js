document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const dictateButton = document.getElementById('dictateButton');
  const cameraButton = document.getElementById('cameraButton');

  dictateButton.addEventListener('click', () => {
    const facts = document.getElementById('facts');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';

    recognition.start();
    recognition.onresult = (event) => {
      facts.value = event.results[0][0].transcript;
    };
  });

  cameraButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.click();
    input.onchange = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => saveNote(e.target.result);
      reader.readAsDataURL(file);
    };
  });

  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });

  function saveNote(photoUrl = '') {
    const noteData = {
      documentNumber: document.getElementById('documentNumber').value,
      fullName: document.getElementById('fullName').value,
      birthdate: document.getElementById('birthdate').value,
      address: document.getElementById('address').value,
      phone: document.getElementById('phone').value,
      facts: document.getElementById('facts').value,
      photoUrl
    };

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteData);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
  }

  function displayNotes() {
    notesContainer.innerHTML = JSON.parse(localStorage.getItem('notes')) || [];
  }

  displayNotes();
});
