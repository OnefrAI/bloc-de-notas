document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const dictateButton = document.getElementById('dictateButton');
  const cameraButton = document.getElementById('cameraButton');
  const newNoteButton = document.getElementById('newNoteButton');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreview = document.getElementById('photoPreview');

  let tempPhotoData = '';

  // Función para actualizar la vista previa de la foto
  function updatePhotoPreview(data) {
    if (data) {
      photoPreview.src = data;
      photoPreviewContainer.style.display = 'block';
    } else {
      photoPreview.src = '';
      photoPreviewContainer.style.display = 'none';
    }
  }

  // Evento para el botón "Dictar"
  dictateButton.addEventListener('click', () => {
    const facts = document.getElementById('facts');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("API de reconocimiento de voz no soportada en este navegador.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';

    dictateButton.textContent = "Grabando...";
    try {
      recognition.start();
    } catch (err) {
      console.error("Error al iniciar el reconocimiento:", err);
      alert("No se pudo iniciar el reconocimiento de voz.");
      dictateButton.textContent = "🎤 Dictar";
      return;
    }

    recognition.onresult = (event) => {
      facts.value = event.results[0][0].transcript;
    };

    recognition.onerror = (event) => {
      console.error("Error en el reconocimiento:", event.error);
      let errorMsg = "Ocurrió un error durante el reconocimiento de voz.";
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        errorMsg += " Permiso denegado. Asegúrate de permitir el acceso al micrófono.";
      } else if (event.error === "network") {
        errorMsg += " Problema de red.";
      } else if (event.error === "no-speech") {
        errorMsg += " No se detectó ningún habla. Intenta hablar más claro.";
      }
      alert(errorMsg);
    };

    recognition.onend = () => {
      dictateButton.textContent = "🎤 Dictar";
    };
  });

  // Evento para el botón "Foto"
  cameraButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.click();
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          tempPhotoData = e.target.result;
          updatePhotoPreview(tempPhotoData);
        };
        reader.readAsDataURL(file);
      }
    };
  });

  // Evento para guardar la nota al enviar el formulario
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });

  // Función para guardar la nota
  function saveNote() {
    const noteData = {
      documentNumber: document.getElementById('documentNumber').value,
      fullName: document.getElementById('fullName').value,
      birthdate: document.getElementById('birthdate').value,
      parentsName: document.getElementById('parentsName').value,
      address: document.getElementById('address').value,
      phone: document.getElementById('phone').value,
      facts: document.getElementById('facts').value,
      photoUrl: tempPhotoData
    };

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteData);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();

    // Reiniciar el formulario y la foto temporal
    noteForm.reset();
    tempPhotoData = '';
    updatePhotoPreview('');
    alert("Nota guardada exitosamente.");
  }

  // Función para mostrar las notas guardadas
  function displayNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (notes.length === 0) {
      notesContainer.innerHTML = "<p>No hay notas guardadas.</p>";
      return;
    }
    notesContainer.innerHTML = notes.map((note, index) => `
      <div class="note">
        <p><strong>Documento:</strong> ${note.documentNumber}</p>
        <p><strong>Nombre:</strong> ${note.fullName}</p>
        <p><strong>Fecha de nacimiento:</strong> ${note.birthdate}</p>
        <p><strong>Padres:</strong> ${note.parentsName}</p>
        <p><strong>Dirección:</strong> ${note.address}</p>
        <p><strong>Teléfono:</strong> ${note.phone}</p>
        <p><strong>Hechos:</strong> ${note.facts}</p>
        ${note.photoUrl ? `<img src="${note.photoUrl}" alt="Foto de la nota">` : ''}
        <button onclick="deleteNote(${index})">Eliminar</button>
      </div>
    `).join('');
  }

  // Función global para eliminar una nota
  window.deleteNote = function(index) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (index >= 0 && index < notes.length) {
      if (confirm("¿Estás seguro de eliminar esta nota?")) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
      }
    }
  };

  // Evento para el botón "Crear Nueva Nota"
  newNoteButton.addEventListener('click', () => {
    noteForm.reset();
    tempPhotoData = '';
    updatePhotoPreview('');
  });

  // Mostrar notas al cargar la página
  displayNotes();
});
