// Inicializar iconos
lucide.createIcons();

let vs;
let namesOn = false; // Por defecto desactivado
let constOn = false; // Por defecto desactivado


document.addEventListener("DOMContentLoaded", () => {
  const yEl = document.getElementById("copyright-year");
  if (yEl) yEl.textContent = new Date().getFullYear();
  // Habilitar/deshabilitar botón de envío de correo según email válido
  const emailInput = document.getElementById("email-to");
  const btnSend = document.getElementById("btn-send-email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function refreshBtn() {
    btnSend.disabled = !emailRegex.test((emailInput?.value || "").trim());
  }
  emailInput?.addEventListener("input", refreshBtn);
  refreshBtn();
});

// Elementos del DOM
const welcomeScreen = document.getElementById("welcome-screen");
const mainScreen = document.getElementById("main-screen");
const specialDateInput = document.getElementById("special-date");
const continueBtn = document.getElementById("continue-btn");
const backBtn = document.getElementById("back-btn");
const selectedDateDisplay = document.getElementById("selected-date-display");

// Función para formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("es-ES", options);
}

function setLocalDatetimeInput(date, inputId = "dt") {
  const d = new Date(date instanceof Date ? date : Date.now());
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById(inputId).value = local;
}

// Configurar fecha inicial
setLocalDatetimeInput(new Date(), "special-date");

// Habilitar botón cuando se selecciona fecha
specialDateInput.addEventListener("change", () => {
  continueBtn.disabled = !specialDateInput.value;
  if (specialDateInput.value) {
    continueBtn.style.background = "rgba(241, 125, 177, 0.15)";
    continueBtn.style.borderColor = "#F17DB1";
    continueBtn.style.color = "#F17DB1";
  }
});

// Transición a pantalla principal con efecto de desplazamiento
continueBtn.addEventListener("click", () => {
  if (!specialDateInput.value) return;

  // Mostrar fecha seleccionada
  selectedDateDisplay.textContent = formatDate(specialDateInput.value);

  // Transición suave hacia arriba
  welcomeScreen.style.transform = "translateY(-100%)";
  welcomeScreen.style.opacity = "0";

  setTimeout(() => {
    welcomeScreen.style.display = "none";
    mainScreen.style.display = "block";
    mainScreen.style.transform = "translateY(0)";
    mainScreen.classList.remove("hidden-smooth");
    mainScreen.classList.add("visible-smooth");

    // Inicializar VirtualSky
    setTimeout(initializeVirtualSky, 300);

    // Configurar fecha seleccionada
    setLocalDatetimeInput(new Date(specialDateInput.value));
  }, 600);
});

// Botón volver: recargar la página para un reinicio limpio
backBtn.addEventListener("click", () => {
  window.location.reload();
});

function initializeVirtualSky() {
  vs = S.virtualsky({
    id: "starmap",
    projection: "fisheye",
    showstars: true,
    showplanets: true,
    constellationlabels: false, // Desactivado por defecto
    constellations: false, // Desactivado por defecto
    showplanetlabels: false, // Desactivado por defecto
    showstarlabels: false, // Desactivado por defecto
    showgalaxy: true,
    magnitude: 6,
    scalestars: 1.2,
    mouse: false,
    keyboard: false,
    showdate: false,
    showposition: false,
    gradient: true,
    cardinalpoints: false, // Desactivado por defecto
    latitude: -25.2637, // Asunción, Paraguay
    longitude: -57.5759,
  });

  // Configurar fecha inicial
  vs.setClock(new Date(specialDateInput.value));
  vs.draw();

  document.getElementById("dt").addEventListener("change", (e) => {
    const d = new Date(e.target.value);
    vs.setClock(d);
    vs.draw();
  });

  document.getElementById("btn-names").addEventListener("click", () => {
    namesOn = !namesOn;
    vs.showstarlabels = namesOn;
    vs.showplanetlabels = namesOn;
    // Solo mostrar nombres de constelaciones si hay líneas activas
    vs.constellation.labels = namesOn && vs.constellation.lines;
    // Cardinales ligados al estado de Nombres
    vs.cardinalpoints = namesOn;
    vs.checkLoaded();
    vs.draw();

    const btn = document.getElementById("btn-names");
    if (namesOn) {
      btn.classList.add("btn-active");
    } else {
      btn.classList.remove("btn-active");
    }
  });

  document.getElementById("btn-const").addEventListener("click", () => {
    // Usar el método incorporado para manejar carga de datos y redibujado
    vs.toggleConstellationLines();
    const isOn = vs.constellation.lines === true;
    // Sincronizar etiquetas con el estado de Nombres
    vs.constellation.labels = isOn && namesOn;
    vs.checkLoaded();
    vs.draw();

    const btn = document.getElementById("btn-const");
    if (isOn) {
      btn.classList.add("btn-active");
    } else {
      btn.classList.remove("btn-active");
    }
  });

  // Botón de envío por correo (no requiere descargar antes)
  const btnSend = document.getElementById("btn-send-email");
  const btnSendText = document.getElementById("btn-send-email-text");
  const btnSendSpinner = document.getElementById("btn-send-email-spinner");
  btnSend?.addEventListener("click", async () => {
    const to = (document.getElementById("email-to")?.value || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      showToast("Ingresa un correo válido", false);
      return;
    }
    let dataUrl;
    btnSend.disabled = true;
    btnSendText.textContent = "Enviando...";
    btnSendSpinner.classList.remove("hidden");
    try {
      // Captura el canvas visible en el DOM
      const skyCanvas = document.querySelector("#starmap canvas");
      if (!skyCanvas) throw new Error("No se encontró el canvas del cielo");

      // Componer póster igual que en descarga
      const PW = 2480,
        PH = 3508;
      const poster = document.createElement("canvas");
      poster.width = PW;
      poster.height = PH;
      const ctx = poster.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, PW, PH);
      const margin = 140;
      ctx.strokeStyle = "#0b1b3d";
      ctx.lineWidth = 6;
      ctx.strokeRect(margin, margin, PW - margin * 2, PH - margin * 2);
      const circleR = 850,
        circleX = PW / 2,
        circleY = 1180;
      ctx.save();
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        skyCanvas,
        0,
        0,
        skyCanvas.width,
        skyCanvas.height,
        circleX - circleR,
        circleY - circleR,
        circleR * 2,
        circleR * 2
      );
      ctx.restore();

      // Frase personalizada o por defecto
      const msg = (
        document.getElementById("poster-msg")?.value ||
        "Nuestro primer beso bajo este mágico cielo nocturno"
      ).trim();
      const dt = new Date(
        document.getElementById("dt")?.value || specialDateInput.value
      );
      const dateStr = `${String(dt.getDate()).padStart(2, "0")}-${String(
        dt.getMonth() + 1
      ).padStart(2, "0")}-${dt.getFullYear()}`;

      ctx.fillStyle = "#0b1b3d";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = "600 80px Poppins";
      ctx.fillText(msg, PW / 2, circleY + circleR + 200);

      ctx.font = "500 54px Poppins";
      ctx.fillText(dateStr, PW / 2, circleY + circleR + 320);

      // No se agregan coordenadas ni lugar

      // Para email, reduce tamaño y usa JPEG para menor peso
      dataUrl = poster.toDataURL("image/jpeg", 0.92);
      document.getElementById("starmap_export_mail")?.remove();
    } catch (err) {
      showToast("No se pudo generar la imagen para enviar.", false);
      btnSend.disabled = false;
      btnSendText.textContent = "Enviar por correo";
      btnSendSpinner.classList.add("hidden");
      return;
    }

    // Subir imagen a Supabase
    let publicUrl = "";
    try {
      publicUrl = await window.uploadImageFromDataUrl(dataUrl);
    } catch (err) {
      showToast(
        "No se pudo subir la imagen a Supabase: " +
          (err.message || err.error_description || err),
        false
      );
      btnSend.disabled = false;
      btnSendText.textContent = "Enviar por correo";
      btnSendSpinner.classList.add("hidden");
      return;
    }

    // Reemplaza TODO el bloque de EmailJS por esto:
    try {
    // 1. Configuración de la petición
    const SEND_EMAIL_ENDPOINT = 'https://send-email-theta-three.vercel.app/api/sendEmail';
    const imagePath = publicUrl;
    const response = await fetch(SEND_EMAIL_ENDPOINT, {
        method: 'POST',
        mode: 'cors', // 👈 Asegura el modo CORS
        headers: { 
        'Content-Type': 'application/json',
        // Si configuraste autenticación en el servidor:
        // 'Authorization': `Bearer ${TU_API_KEY}`
        },
        body: JSON.stringify({
        to: to,
        imagePath: imagePath // Ej: "mapas/mapa-123.jpg"
        }),
    });

    // 2. Manejo de errores HTTP (404, 500, etc.)
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
        errorData.message || 
        `Error HTTP ${response.status}: ${response.statusText}`
        );
    }

    // 3. Procesar respuesta exitosa
    const result = await response.json();
    
    // Verificación adicional del resultado
    if (!result.success) {
        throw new Error(result.error || 'El servidor respondió con error');
    }

    // 4. Mostrar feedback al usuario
    showToast("¡Correo enviado correctamente! 🎉", true);
    btnSendText.textContent = "¡Enviado!";
    
    setTimeout(() => {
        btnSendText.textContent = "Enviar por correo";
    }, 2000);

    } catch (error) {
    console.error('Error en sendEmail:', error);
    
    // Mensajes personalizados según el tipo de error
    const errorMessage = error.message.includes('Failed to fetch')
        ? 'No se pudo conectar al servidor. Revisa tu conexión.'
        : error.message.includes('HTTP')
        ? `Error del servidor: ${error.message}`
        : "Error al enviar el correo. Intenta nuevamente.";

    showToast(errorMessage, false);
    
    } finally {
    // Resetear UI
    btnSendSpinner.classList.add("hidden");
    btnSend.disabled = false;
    }
    btnSend.disabled = false;
    btnSendText.textContent = "Enviar por correo";
    btnSendSpinner.classList.add("hidden");
  });
}

// Toast personalizado para alertas bonitas
function showToast(msg, success = true) {
  const toast = document.getElementById("toast-email");
  const toastMsg = document.getElementById("toast-email-msg");
  toastMsg.textContent = msg;
  toast.classList.remove("opacity-0", "pointer-events-none");
  toast.classList.add("opacity-100");
  toast.style.background = success
    ? "linear-gradient(to right, #fce7f3, #ede9fe)"
    : "linear-gradient(to right, #fee2e2, #f3e8ff)";
  toast.style.color = success ? "#be185d" : "#991b1b";
  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0", "pointer-events-none");
  }, 3500);
}

// Bloquea todos los eventos sobre el starmap (canvas y alrededores)
// Esto evita redirecciones y cualquier interacción accidental
const starmapBlocker = document.getElementById("starmap-blocker");
if (starmapBlocker) {
  starmapBlocker.addEventListener("click", (e) => e.stopPropagation());
  starmapBlocker.addEventListener("mousedown", (e) => e.preventDefault());
  starmapBlocker.addEventListener("touchstart", (e) => e.preventDefault());
  starmapBlocker.addEventListener("pointerdown", (e) => e.preventDefault());
  starmapBlocker.addEventListener("contextmenu", (e) => e.preventDefault());
}
