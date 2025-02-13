document.addEventListener('DOMContentLoaded', () => {
  // Elementos del formulario y contenedores
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const newNoteButton = document.getElementById('newNoteButton');
  const activateCameraButton = document.getElementById('activateCameraButton');
  const saveNoteButton = document.getElementById('saveNoteButton');
  const addPersonButton = document.getElementById('addPersonButton');
  const personsContainer = document.getElementById('personsContainer');
  const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('video');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreview = document.getElementById('photoPreview');
  const facts = document.getElementById('facts');

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
        activateCameraButton.textContent = "Capturar Foto";
      })
      .catch(err => {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de otorgar permisos.");
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
    activateCameraButton.textContent = "Activar Cámara";
  }

  // Evento para el botón "Activar Cámara"
  activateCameraButton.addEventListener('click', () => {
    if (!cameraStream) {
      startCamera();
    } else {
      capturePhoto();
      stopCamera();
    }
  });

  // Evento para el botón "Nueva Nota": resetea el formulario y vuelve a dejar en estado inicial
  newNoteButton.addEventListener('click', () => {
    noteForm.reset();
    // Reiniciar contenedor de personas dejando una entrada inicial
    personsContainer.innerHTML = `
      <div class="person">
        <label>Número de Documento:</label>
        <input type="text" name="personDocument">
        <label>Nombre y Apellidos:</label>
        <input type="text" name="personName">
        <label>Fecha de Nacimiento:</label>
        <input type="text" name="personBirthdate" placeholder="DD-MM-AAAA">
        <button type="button" class="btn delete-person-btn" style="display: none;">Eliminar</button>
      </div>
    `;
    tempPhotoData = '';
    photoPreviewContainer.style.display = 'none';
    videoContainer.style.display = 'none';
    activateCameraButton.textContent = "Activar Cámara";
  });

  // Evento para el botón "Agregar Persona": añade un nuevo bloque de campos para una persona
  addPersonButton.addEventListener('click', () => {
    const personDiv = document.createElement('div');
    personDiv.classList.add('person');
    personDiv.innerHTML = `
      <label>Número de Documento:</label>
      <input type="text" name="personDocument">
      <label>Nombre y Apellidos:</label>
      <input type="text" name="personName">
      <label>Fecha de Nacimiento:</label>
      <input type="text" name="personBirthdate" placeholder="DD-MM-AAAA">
      <button type="button" class="btn delete-person-btn">Eliminar</button>
    `;
    personsContainer.appendChild(personDiv);
    updateDeleteButtons();
  });

  // Actualiza la visibilidad de los botones de eliminar en cada bloque de persona
  function updateDeleteButtons() {
    const personDivs = personsContainer.querySelectorAll('.person');
    personDivs.forEach((div, index) => {
      const delBtn = div.querySelector('.delete-person-btn');
      // Si hay más de un bloque, muestra el botón; si es el único, lo oculta
      if (personDivs.length > 1) {
        delBtn.style.display = 'block';
      } else {
        delBtn.style.display = 'none';
      }
      // Agregar evento para eliminar este bloque
      delBtn.onclick = () => {
        div.remove();
        updateDeleteButtons();
      };
    });
  }

  // Evento para guardar la nota (no se requieren todos los campos)
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });

  // Función para guardar la nota en localStorage
  function saveNote() {
    // Recopilar datos de cada persona
    const personDivs = personsContainer.querySelectorAll('.person');
    const persons = [];
    personDivs.forEach(div => {
      const documentNumber = div.querySelector('input[name="personDocument"]').value;
      const name = div.querySelector('input[name="personName"]').value;
      const birthdate = div.querySelector('input[name="personBirthdate"]').value;
      persons.push({ documentNumber, name, birthdate });
    });

    const noteData = {
      facts: facts.value,
      persons,
      photoUrl: tempPhotoData
    };

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteData);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();

    // Reiniciar formulario y áreas relacionadas
    noteForm.reset();
    personsContainer.innerHTML = `
      <div class="person">
        <label>Número de Documento:</label>
        <input type="text" name="personDocument">
        <label>Nombre y Apellidos:</label>
        <input type="text" name="personName">
        <label>Fecha de Nacimiento:</label>
        <input type="text" name="personBirthdate" placeholder="DD-MM-AAAA">
        <button type="button" class="btn delete-person-btn" style="display: none;">Eliminar</button>
      </div>
    `;
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
    notesContainer.innerHTML = notes.map((note, index) => {
      let personsHTML = '';
      if (note.persons && note.persons.length > 0) {
        personsHTML = note.persons.map(person => `
          <p>
            <strong>Documento:</strong> ${person.documentNumber || 'N/A'}<br>
            <strong>Nombre:</strong> ${person.name || 'N/A'}<br>
            <strong>F. Nacimiento:</strong> ${person.birthdate || 'N/A'}
          </p>
        `).join('');
      }
      return `
        <div class="note">
          <p><strong>Exposición:</strong> ${note.facts || 'N/A'}</p>
          ${personsHTML}
          ${note.photoUrl ? `<img src="${note.photoUrl}" alt="Foto de la nota">` : ''}
          <button onclick="deleteNote(${index})">Eliminar</button>
        </div>
      `;
    }).join('');
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
