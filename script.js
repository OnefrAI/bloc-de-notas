document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const dictateButton = document.getElementById('dictateButton');
  const cameraButton = document.getElementById('cameraButton');
  const photoInput = document.getElementById('photo');
  const addNoteButton = document.getElementById('addNoteButton');

  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const documentNumber = document.getElementById('documentNumber').value;
    const fullName = document.getElementById('fullName').value;
    const birthdate = document.getElementById('birthdate').value;
    const parentsName = document.getElementById('parentsName').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const facts = document.getElementById('facts').value;
    let photoUrl = '';

    if (photoInput.files.length > 0) {
      const file = photoInput.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        photoUrl = event.target.result;
        saveNote(documentNumber, fullName, birthdate, parentsName, address, phone, facts, photoUrl);
      };
      reader.readAsDataURL(file);
    } else {
      saveNote(documentNumber, fullName, birthdate, parentsName, address, phone, facts, photoUrl);
    }
  });

  dictateButton.addEventListener('click', () => {
    const facts = document.getElementById('facts');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      facts.value = speechResult;
    };

    recognition.onerror = (event) => {
      console.error('Error al usar el reconocimiento de voz:', event.error);
    };

    recognition.onend = () => {
      console.log('Reconocimiento de voz finalizado');
    };
  });

  cameraButton.addEventListener('click', () => {
    photoInput.click();
  });

  addNoteButton.addEventListener('click', () => {
    noteForm.reset();
  });

  function saveNote(documentNumber, fullName, birthdate, parentsName, address, phone, facts, photoUrl) {
    const note = {
      documentNumber,
      fullName,
      birthdate,
      parentsName,
      address,
      phone,
      facts,
      photoUrl,
      timestamp: new Date().toISOString()
    };

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));

    displayNotes();
    noteForm.reset();
  }

  function displayNotes() {
    notesContainer.innerHTML = '';
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.forEach((note, index) => {
      const noteElement = document.createElement('div');
      noteElement.classList.add('note');
      noteElement.innerHTML = `
        <p><strong>Número de Documento:</strong> ${note.documentNumber}</p>
        <p><strong>Nombre y apellidos:</strong> ${note.fullName}</p>
        <p><strong>Fecha de nacimiento:</strong> ${note.birthdate}</p>
        <p><strong>Nombre del padre y la madre:</strong> ${note.parentsName}</p>
        <p><strong>Dirección del domicilio:</strong> ${note.address}</p>
        <p><strong>Número de teléfono:</strong> ${note.phone}</p>
        <p><strong>Exposición de los hechos:</strong> ${note.facts}</p>
        ${note.photoUrl ? `<img src="${note.photoUrl}" alt="Foto">` : ''}
        <button onclick="deleteNote(${index})">Eliminar</button>
      `;
      notesContainer.appendChild(noteElement);
    });
  }

  window.deleteNote = (index) => {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
  };

  displayNotes();
});
