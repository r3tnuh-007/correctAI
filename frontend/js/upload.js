/* ============================================================
   UPLOAD DE ANEXOS (PDF ou fotos) — dropzone reutilizável
   Usada na correção simples, na chave de correção e em cada
   linha da correção em lote.
   ============================================================ */

"use strict";

function criarUploadAnexo(opcoes) {
  const t = window.t || function(chave) { return chave; };
  const mostrarToast = window.mostrarToast || function() {};
  const mostrarErro = window.mostrarErro || function() {};
  const limparErro = window.limparErro || function() {};
  const formatarTamanho = window.formatarTamanho || function(b) { return String(b); };

  const {
    radios,
    inputFicheiro,
    inputCamera,
    dropzone,
    dropzonePdf,
    dropzoneFotos,
    dropzoneTextoPdf,
    dropzoneAjudaPdf,
    dropzoneAjudaFotos,
    opcaoUpload,
    opcaoCamera,
    previewFotos,
    campoErro,
    chaveTextoPdf,
    chaveTextoFotos,
    aoMudar,
  } = opcoes;

  const estado = {
    tipo: "pdf",
    pdf: null,
    fotos: [],
  };

  function notificarMudanca() {
    if (typeof aoMudar === 'function') aoMudar(estado);
  }

  function limparErroCampo() {
    if (campoErro) limparErro(campoErro);
  }

	function aplicarVisualTipo() {
	if (dropzonePdf) dropzonePdf.style.display = estado.tipo === "pdf" ? "" : "none";
	if (dropzoneFotos) dropzoneFotos.style.display = estado.tipo === "foto" ? "block" : "none";

	if (inputFicheiro) {
		if (estado.tipo === "foto") {
		inputFicheiro.setAttribute("accept", "image/*");
		inputFicheiro.multiple = true;   // também permite escolher várias fotos de uma vez
		} else {
		inputFicheiro.setAttribute("accept", "application/pdf");
		inputFicheiro.multiple = false;
		}
	}
	}

  function resetarTextoPdf() {
    if (dropzoneTextoPdf) dropzoneTextoPdf.innerHTML = t(chaveTextoPdf || "dzPdfTexto");
    if (dropzoneAjudaPdf) dropzoneAjudaPdf.textContent = t("dzPdfAjuda");
  }

  function resetarTextoFotos() {
    if (dropzoneAjudaFotos) dropzoneAjudaFotos.textContent = t(chaveTextoFotos || "dzFotosAjuda");
  }

  function atualizarTextoPdfSelecionado() {
    if (!dropzoneTextoPdf || !estado.pdf) return;
    dropzoneTextoPdf.innerHTML = t("dzPdfSelecionado", { nome: estado.pdf.name });
    if (dropzoneAjudaPdf) {
      dropzoneAjudaPdf.textContent = t("dzPdfTrocar", { tamanho: formatarTamanho(estado.pdf.size) });
    }
  }

  function atualizarTextoFotosContagem() {
    if (!dropzoneAjudaFotos) return;
    if (estado.fotos.length > 0) {
      dropzoneAjudaFotos.textContent = t("dzFotosContagem", { n: estado.fotos.length });
    } else {
      resetarTextoFotos();
    }
  }

  function renderizarPreviewFotos() {
    if (!previewFotos) return;
    previewFotos.innerHTML = "";
    estado.fotos.forEach((ficheiro, indice) => {
      const item = document.createElement("div");
      item.className = "preview-fotos__item";

      const img = document.createElement("img");
      img.alt = ficheiro.name;
      const urlObjeto = URL.createObjectURL(ficheiro);
      img.src = urlObjeto;
      img.onload = () => URL.revokeObjectURL(urlObjeto);

      const btnRemover = document.createElement("button");
      btnRemover.type = "button";
      btnRemover.className = "preview-fotos__remover";
      btnRemover.setAttribute("aria-label", "Remover foto");
      btnRemover.textContent = "✕";
      btnRemover.addEventListener("click", () => {
        estado.fotos.splice(indice, 1);
        renderizarPreviewFotos();
        atualizarTextoFotosContagem();
        notificarMudanca();
      });

      item.append(img, btnRemover);
      previewFotos.appendChild(item);
    });
  }

  function definirTipo(tipo) {
    estado.tipo = tipo === "foto" ? "foto" : "pdf";
    limparErroCampo();
    aplicarVisualTipo();
  }

  if (radios && radios.forEach) {
    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) definirTipo(radio.value);
      });
    });
  }

  function adicionarFicheiros(lista) {
    const ficheiros = Array.from(lista || []);
    if (!ficheiros.length) return;

    if (estado.tipo === "pdf") {
      const pdf = ficheiros.find(
        (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name),
      );
      if (!pdf) {
        mostrarErro(campoErro, t("erroApenasPdf"));
        return;
      }
      limparErroCampo();
      estado.pdf = pdf;
      atualizarTextoPdfSelecionado();
      notificarMudanca();
    } else {
      const imagens = ficheiros.filter((f) => f.type.startsWith("image/"));
      if (imagens.length < ficheiros.length) {
        mostrarToast(t("erroAlgunsIgnorados"));
      }
      if (!imagens.length) return;
      limparErroCampo();
      estado.fotos = estado.fotos.concat(imagens);
      renderizarPreviewFotos();
      atualizarTextoFotosContagem();
      notificarMudanca();
    }
  }

  /* ---------- clique na dropzone ---------- */
  dropzone.addEventListener("click", (e) => {
    if (opcaoCamera && e.target.closest("#" + opcaoCamera.id)) {
      e.preventDefault();
      e.stopPropagation();
      abrirCamera(adicionarFicheiros);
      return;
    }

    if (opcaoUpload && e.target.closest("#" + opcaoUpload.id)) {
      e.preventDefault();
      e.stopPropagation();
      inputFicheiro.click();
      return;
    }

    if (estado.tipo === "pdf") {
      inputFicheiro.click();
    }
  });

  /* ---------- arrastar e largar ---------- */
  ["dragenter", "dragover"].forEach((evento) => {
    dropzone.addEventListener(evento, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("arrastar");
    });
  });

  ["dragleave", "dragend"].forEach((evento) => {
    dropzone.addEventListener(evento, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("arrastar");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("arrastar");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      adicionarFicheiros(e.dataTransfer.files);
    }
  });

  /* ---------- input de ficheiro (galeria / escolher) ---------- */
  inputFicheiro.addEventListener("change", function () {
    adicionarFicheiros(this.files);
    this.value = "";
  });

  /* ---------- input de câmera (dispositivos móveis) ---------- */
  inputCamera.addEventListener("change", function () {
    const ficheiros = Array.from(this.files || []);
    this.value = "";

    if (!ficheiros.length) return;

    const imagens = ficheiros.filter((f) => f.type.startsWith("image/"));
    if (imagens.length === 0) {
      mostrarToast(t("toastNenhumaImagemValida"));
      return;
    }

    adicionarFicheiros(imagens);
    mostrarToast(t("toastFotosCapturadas", { n: imagens.length }));
  });

  /* ---------- lógica de câmera (mobile vs desktop) ---------- */
  function abrirCamera(aoCapturar) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      inputCamera.click();
      return;
    }

    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      inputCamera.click();
    } else {
      abrirCameraDesktop(aoCapturar);
    }
  }

  function resetar() {
    estado.pdf = null;
    estado.fotos = [];
    estado.tipo = "pdf";
    if (previewFotos) previewFotos.innerHTML = "";
    resetarTextoPdf();
    resetarTextoFotos();
    aplicarVisualTipo();
    if (radios && radios.forEach) {
      radios.forEach((r) => {
        r.checked = r.value === "pdf";
      });
    }
    limparErroCampo();
    notificarMudanca();
  }

  aplicarVisualTipo();
  resetarTextoPdf();
  resetarTextoFotos();

  return {
    estado,
    adicionarFicheiros,
    resetar,
    definirTipo,
  };
}

// Exporta globalmente
window.criarUploadAnexo = criarUploadAnexo;
