document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const activateCameraButton = document.getElementById('activateCameraButton');
  const saveNoteButton = document.getElementById('saveNoteButton');
  const shareNoteButton = document.getElementById('shareNoteButton');
  const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('video');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreview = document.getElementById('photoPreview');

  let cameraStream = null;
  let tempPhotoData = '';
  let lastSavedNote = null;
  // Inicialmente, el botón de compartir está deshabilitado
  shareNoteButton.disabled = true;

  // Función para iniciar la cámara y mostrar el video en vivo
  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
        video.play();
        videoContainer.style.display = 'block';
        // El botón muestra un emoji de cámara
        activateCameraButton.textContent = "📷";
      })
      .catch(err => {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de haber otorgado permisos.");
      });
  }

  // Función para capturar una foto del video y procesarla con OCR
  function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    tempPhotoData = canvas.toDataURL('image/png');
    photoPreview.src = tempPhotoData;
    photoPreviewContainer.style.display = 'block';

    // Llamar a Tesseract.js para realizar OCR y autocompletar campos
    Tesseract.recognize(tempPhotoData, 'spa', { logger: m => console.log(m) })
      .then(({ data: { text } }) => {
        console.log("Resultado OCR:", text);
        autoCompletarCampos(text);
      })
      .catch(err => {
        console.error("Error en OCR:", err);
      });
  }

  // Función para detener la cámara
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    videoContainer.style.display = 'none';
    activateCameraButton.textContent = "📷";
  }

  // Evento para el botón de cámara:
  // Si la cámara no está activa, se inicia; si ya está activa, se captura la imagen y se detiene.
  activateCameraButton.addEventListener('click', () => {
    if (!cameraStream) {
      startCamera();
    } else {
      capturePhoto();
      stopCamera();
    }
  });

  // Función para autocompletar campos usando el texto extraído con OCR
  function autoCompletarCampos(ocrText) {
    // Ejemplo: extraer un número de documento (mínimo 8 dígitos)
    const docMatch = ocrText.match(/\d{8,}/);
    if (docMatch) {
      document.getElementById('documentNumber').value = docMatch[0];
    }
    // Ejemplo: extraer un nombre en mayúsculas
    const nameMatch = ocrText.match(/([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)/);
    if (nameMatch) {
      document.getElementById('fullName').value = nameMatch[0];
    }
    // Se pueden agregar más expresiones para otros campos según el formato de los documentos
  }

  // Evento para guardar la nota
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });

  // Función para guardar la nota y habilitar el botón de compartir
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

    // Reiniciar el formulario y limpiar la imagen capturada
    noteForm.reset();
    tempPhotoData = '';
    photoPreviewContainer.style.display = 'none';
    activateCameraButton.textContent = "📷";
    alert("Nota guardada exitosamente.");

    // Guardar la nota recientemente guardada y habilitar el botón de compartir
    lastSavedNote = noteData;
    shareNoteButton.disabled = false;
  }

  // Evento para compartir la nota usando la Web Share API
  shareNoteButton.addEventListener('click', () => {
    if (lastSavedNote) {
      shareNote(lastSavedNote);
    }
  });

  // Función para compartir la nota
  function shareNote(noteData) {
    const shareText = `Nota Policial:
Documento: ${noteData.documentNumber || 'N/A'}
Nombre: ${noteData.fullName || 'N/A'}
Fecha de Nacimiento: ${noteData.birthdate || 'N/A'}
Padres: ${noteData.parentsName || 'N/A'}
Domicilio: ${noteData.address || 'N/A'}
Teléfono: ${noteData.phone || 'N/A'}
Hechos: ${noteData.facts || 'N/A'}`;
    if (navigator.share) {
      navigator.share({
        title: 'Nota Policial',
        text: shareText
      }).then(() => {
        console.log('Nota compartida exitosamente.');
      }).catch(err => {
        console.error('Error al compartir:', err);
      });
    } else {
      alert("Tu navegador no soporta la función de compartir.");
    }
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
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (index >= 0 && index < notes.length && confirm("¿Estás seguro de eliminar esta nota?")) {
      notes.splice(index, 1);
      localStorage.setItem('notes', JSON.stringify(notes));
      displayNotes();
    }
  };

  // Mostrar las notas guardadas al cargar la página
  displayNotes();
});
