/* ============================================================
   CÂMERA NO DESKTOP (getUserMedia)
   ============================================================ */

"use strict";

function abrirCameraDesktop(aoCapturar) {
  const t = window.t || function(chave) { return chave; };
  const mostrarToast = window.mostrarToast || function(msg) { alert(msg); };

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarToast(t("toastSemCameraSuporte"));
    return;
  }

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
    .then((stream) => {
      const overlay = document.createElement("div");
      overlay.className = "camera-overlay";

      const video = document.createElement("video");
      video.className = "camera-overlay__video";
      video.autoplay = true;
      video.playsInline = true;

      const barra = document.createElement("div");
      barra.className = "camera-overlay__barra";

      const contador = document.createElement("span");
      contador.className = "camera-overlay__contador";
      contador.textContent = "0";

      const btnCapturar = document.createElement("button");
      btnCapturar.type = "button";
      btnCapturar.className = "camera-overlay__capturar";
      btnCapturar.textContent = "📸";

      const btnFechar = document.createElement("button");
      btnFechar.type = "button";
      btnFechar.className = "camera-overlay__fechar";
      btnFechar.textContent = "✕";

      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();

      overlay.append(video, barra);
      barra.append(contador, btnCapturar, btnFechar);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      let capturas = 0;

      function encerrar() {
        stream.getTracks().forEach((track) => track.stop());
        overlay.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", aoTeclar);
      }

      function capturarFoto() {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const file = new File([blob], `foto-camera-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            aoCapturar([file]);
            capturas += 1;
            contador.textContent = String(capturas);
            mostrarToast(t("toastFotoCapturada"));
          },
          "image/jpeg",
          0.92,
        );
      }

      function aoTeclar(e) {
        if (e.key === "Enter") capturarFoto();
        if (e.key === "Escape") encerrar();
      }

      btnCapturar.addEventListener("click", capturarFoto);
      btnFechar.addEventListener("click", encerrar);
      document.addEventListener("keydown", aoTeclar);
    })
    .catch((err) => {
      console.error("Erro ao aceder à câmera:", err);
      mostrarToast(t("toastCameraErro"));
    });
}

// Exporta globalmente
window.abrirCameraDesktop = abrirCameraDesktop;