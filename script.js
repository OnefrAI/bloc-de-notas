document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const createNoteButton = document.getElementById('createNoteButton');
  const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('video');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreview = document.getElementById('photoPreview');

  let cameraStream = null;
  let tempPhotoData = '';

  // Función para iniciar la cámara y mostrar el video en vivo
  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
        video.play();
        videoContainer.style.display = 'block';
        createNoteButton.textContent = "Capturar Foto";
      })
      .catch(err => {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de haber otorgado permisos.");
      });
  }

  // Función para capturar una foto del video
  function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    tempPhotoData = canvas.toDataURL('image/png');
    photoPreview.src = tempPhotoData;
    photoPreviewContainer.style.display = 'block';
  }

  // Función para detener la cámara
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    videoContainer.style.display = 'none';
    createNoteButton.textContent = "Crear Nota";
  }

  // Evento para el botón "Crear Nota"
  // Si la cámara no está activa, se inicia para tomar foto; si está activa, se captura la imagen.
  createNoteButton.addEventListener('click', () => {
    if (!cameraStream) {
      // Si ya hay una foto capturada, preguntar si se desea retomar otra.
      if (tempPhotoData) {
        if (!confirm("Ya se ha capturado una foto. ¿Deseas tomar otra?")) {
          return;
        }
        tempPhotoData = '';
        photoPreviewContainer.style.display = 'none';
      }
      startCamera();
    } else {
      capturePhoto();
      stopCamera();
    }
  });

  // Evento para guardar la nota (se puede guardar sin que todos los campos estén rellenos)
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });

  // Función para guardar la nota en localStorage
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

    // Reiniciar el formulario y limpiar la foto capturada
    noteForm.reset();
    tempPhotoData = '';
    photoPreviewContainer.style.display = 'none';
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
        <p><strong>Documento:</strong> ${note.documentNumber || 'N/A'}</p>
        <p><strong>Nombre:</strong> ${note.fullName || 'N/A'}</p>
        <p><strong>Fecha de nacimiento:</strong> ${note.birthdate || 'N/A'}</p>
        <p><strong>Padres:</strong> ${note.parentsName || 'N/A'}</p>
        <p><strong>Dirección:</strong> ${note.address || 'N/A'}</p>
        <p><strong>Teléfono:</strong> ${note.phone || 'N/A'}</p>
        <p><strong>Hechos:</strong> ${note.facts || 'N/A'}</p>
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

  // Mostrar notas al cargar la página
  displayNotes();
});
