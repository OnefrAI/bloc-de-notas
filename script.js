document.addEventListener('DOMContentLoaded', () => {
  // Elementos de los campos principales
  const noteForm = document.getElementById('noteForm');
  const documentNumber = document.getElementById('documentNumber');
  const fullName = document.getElementById('fullName');
  const birthdate = document.getElementById('birthdate');
  const parentsName = document.getElementById('parentsName');
  const address = document.getElementById('address');
  const phone = document.getElementById('phone');
  const facts = document.getElementById('facts');
  
  // Contenedor de identificados
  const identificationsContainer = document.getElementById('identificationsContainer');
  const addIdentificationButton = document.getElementById('addIdentificationButton');
  
  // Botones de acción
  const newNoteButton = document.getElementById('newNoteButton');
  const activateCameraButton = document.getElementById('activateCameraButton');
  const saveNoteButton = document.getElementById('saveNoteButton');
  
  // Elementos de cámara y foto
  const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('video');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreview = document.getElementById('photoPreview');
  
  // Contenedor de notas
  const notesContainer = document.getElementById('notesContainer');
  
  let cameraStream = null;
  let tempPhotoData = '';
  
  // Función para iniciar la cámara
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
  
  // Función para capturar la foto
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
  
  // Evento para "Nueva Nota": reinicia el formulario y los contenedores
  newNoteButton.addEventListener('click', () => {
    noteForm.reset();
    identificationsContainer.innerHTML = `
      <div class="identification">
        <label>Número de Documento:</label>
        <input type="text" name="idDocument">
        <label>Nombre y Apellidos:</label>
        <input type="text" name="idName">
        <label>Fecha de Nacimiento:</label>
        <input type="text" name="idBirthdate" placeholder="DD-MM-AAAA">
        <button type="button" class="btn delete-identification-btn" style="display: none;">Eliminar</button>
      </div>
    `;
    tempPhotoData = '';
    photoPreviewContainer.style.display = 'none';
    videoContainer.style.display = 'none';
    activateCameraButton.textContent = "Activar Cámara";
  });
  
  // Evento para agregar un nuevo identificado
  addIdentificationButton.addEventListener('click', () => {
    const identificationDiv = document.createElement('div');
    identificationDiv.classList.add('identification');
    identificationDiv.innerHTML = `
      <label>Número de Documento:</label>
      <input type="text" name="idDocument">
      <label>Nombre y Apellidos:</label>
      <input type="text" name="idName">
      <label>Fecha de Nacimiento:</label>
      <input type="text" name="idBirthdate" placeholder="DD-MM-AAAA">
      <button type="button" class="btn delete-identification-btn">Eliminar</button>
    `;
    identificationsContainer.appendChild(identificationDiv);
    updateDeleteButtons();
  });
  
  // Actualiza la visibilidad y funcionalidad de los botones "Eliminar" en cada identificado
  function updateDeleteButtons() {
    const identificationDivs = identificationsContainer.querySelectorAll('.identification');
    identificationDivs.forEach(div => {
      const delBtn = div.querySelector('.delete-identification-btn');
      if (identificationDivs.length > 1) {
        delBtn.style.display = 'block';
      } else {
        delBtn.style.display = 'none';
      }
      delBtn.onclick = () => {
        div.remove();
        updateDeleteButtons();
      };
    });
  }
  
  // Guardar la nota (los campos no son obligatorios)
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });
  
  function saveNote() {
    const noteData = {
      documentNumber: documentNumber.value,
      fullName: fullName.value,
      birthdate: birthdate.value,
      parentsName: parentsName.value,
      address: address.value,
      phone: phone.value,
      facts: facts.value,
      identifications: [],
      photoUrl: tempPhotoData
    };
    
    const identificationDivs = identificationsContainer.querySelectorAll('.identification');
    identificationDivs.forEach(div => {
      const idDocument = div.querySelector('input[name="idDocument"]').value;
      const idName = div.querySelector('input[name="idName"]').value;
      const idBirthdate = div.querySelector('input[name="idBirthdate"]').value;
      noteData.identifications.push({ idDocument, idName, idBirthdate });
    });
    
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteData);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    
    // Reiniciar formulario y áreas relacionadas
    noteForm.reset();
    identificationsContainer.innerHTML = `
      <div class="identification">
        <label>Número de Documento:</label>
        <input type="text" name="idDocument">
        <label>Nombre y Apellidos:</label>
        <input type="text" name="idName">
        <label>Fecha de Nacimiento:</label>
        <input type="text" name="idBirthdate" placeholder="DD-MM-AAAA">
        <button type="button" class="btn delete-identification-btn" style="display: none;">Eliminar</button>
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
      let identificationsHTML = '';
      if (note.identifications && note.identifications.length > 0) {
        identificationsHTML = note.identifications.map(ident => `
          <p>
            <strong>Documento:</strong> ${ident.idDocument || 'N/A'}<br>
            <strong>Nombre:</strong> ${ident.idName || 'N/A'}<br>
            <strong>Fecha de Nacimiento:</strong> ${ident.idBirthdate || 'N/A'}
          </p>
        `).join('');
      }
      return `
        <div class="note">
          <p><strong>Datos Principales:</strong></p>
          <p>
            <strong>Número de Documento:</strong> ${note.documentNumber || 'N/A'}<br>
            <strong>Nombre y Apellidos:</strong> ${note.fullName || 'N/A'}<br>
            <strong>Fecha de Nacimiento:</strong> ${note.birthdate || 'N/A'}<br>
            <strong>Nombre del padre y la madre:</strong> ${note.parentsName || 'N/A'}<br>
            <strong>Dirección del Domicilio:</strong> ${note.address || 'N/A'}<br>
            <strong>Número de Teléfono:</strong> ${note.phone || 'N/A'}<br>
            <strong>Exposición de los Hechos:</strong> ${note.facts || 'N/A'}
          </p>
          <p><strong>Identificados:</strong></p>
          ${identificationsHTML}
          ${note.photoUrl ? `<img src="${note.photoUrl}" alt="Foto de la nota">` : ''}
          <button onclick="deleteNote(${index})">Eliminar</button>
        </div>
      `;
    }).join('');
  }
  
  window.deleteNote = function(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (index >= 0 && index < notes.length && confirm("¿Estás seguro de eliminar esta nota?")) {
      notes.splice(index, 1);
      localStorage.setItem('notes', JSON.stringify(notes));
      displayNotes();
    }
  }
  
  // Mostrar notas al cargar la página
  displayNotes();
});
