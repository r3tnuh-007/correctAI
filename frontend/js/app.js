/* ============================================================
   CorretorIA — Lógica do frontend (JavaScript puro)
   - Modal de carregamento de provas (PDF, foto da galeria, foto na hora)
   - Upload da chave de correção (gabarito) em Configurações
   - Fila de provas + simulação de correção com IA
   - Painéis laterais: Chat e Configurações
   - Tema claro/escuro
   - Integração com API via api-service.js
   ============================================================ */

"use strict";

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto == null ? "" : String(texto);
  return div.innerHTML;
}

function formatarTamanho(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let toastTimeoutId = null;
function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.hidden = false;
  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function mostrarErro(campo, mensagem) {
  const el = document.querySelector(`[data-erro="${campo}"]`);
  if (el) el.textContent = mensagem || "";
}

function limparErro(campo) {
  mostrarErro(campo, "");
}

/* ============================================================
   MÓDULO REUTILIZÁVEL DE UPLOAD DE ANEXO
   ============================================================ */

function criarUploadAnexo(cfg) {
  const estado = { tipo: "pdf", pdf: null, fotos: [] };

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
    textoPdfPadrao = "Arrasta o PDF aqui ou <u>clica para escolher</u>",
    textoFotosPadrao = "Várias fotos — uma por página",
    onMudar,
  } = cfg;

  function limparErroCampo() {
    if (campoErro) limparErro(campoErro);
  }

  function mostrarErroCampo(msg) {
    if (campoErro) mostrarErro(campoErro, msg);
  }

  /* ---------- alternância PDF / Fotos ---------- */
  function aplicarVisualTipo() {
    if (estado.tipo === "pdf") {
      inputFicheiro.accept = "application/pdf";
      inputFicheiro.multiple = false;
      dropzonePdf.style.display = "block";
      dropzoneFotos.style.display = "none";
    } else {
      inputFicheiro.accept = "image/*";
      inputFicheiro.multiple = true;
      dropzonePdf.style.display = "none";
      dropzoneFotos.style.display = "block";
    }
  }

  function definirTipo(tipo) {
    estado.tipo = tipo === "foto" ? "foto" : "pdf";
    estado.pdf = null;
    estado.fotos = [];
    if (previewFotos) previewFotos.innerHTML = "";
    aplicarVisualTipo();
    resetarTextoPdf();
    resetarTextoFotos();
    limparErroCampo();
    if (onMudar) onMudar(estado);
  }

  if (radios && radios.forEach) {
    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) definirTipo(radio.value);
      });
    });
  }

  /* ---------- textos da dropzone ---------- */
  function resetarTextoPdf() {
    if (dropzoneTextoPdf) dropzoneTextoPdf.innerHTML = textoPdfPadrao;
    if (dropzoneAjudaPdf) dropzoneAjudaPdf.textContent = "1 ficheiro PDF";
  }

  function resetarTextoFotos() {
    if (dropzoneAjudaFotos) dropzoneAjudaFotos.textContent = textoFotosPadrao;
  }

  /* ---------- adicionar ficheiros (PDF ou fotos) ---------- */
  function adicionarFicheiros(fileList) {
    const ficheiros = Array.from(fileList || []);
    if (ficheiros.length === 0) return;
    limparErroCampo();

    if (estado.tipo === "pdf") {
      const ficheiro = ficheiros[0];
      if (ficheiro.type !== "application/pdf") {
        mostrarErroCampo("Apenas ficheiros PDF são aceites.");
        return;
      }
      estado.pdf = ficheiro;
      if (dropzoneTextoPdf) {
        dropzoneTextoPdf.innerHTML = `✅ <strong>${escaparHtml(ficheiro.name)}</strong>`;
      }
      if (dropzoneAjudaPdf) {
        dropzoneAjudaPdf.textContent =
          formatarTamanho(ficheiro.size) + " — clica para trocar";
      }
    } else {
      const imagens = ficheiros.filter((f) => f.type.startsWith("image/"));
      if (imagens.length !== ficheiros.length) {
        mostrarErroCampo("Alguns ficheiros foram ignorados: apenas imagens são aceites.");
      }
      estado.fotos.push(...imagens);
      renderizarPreviewFotos();
    }

    if (onMudar) onMudar(estado);
  }

  function renderizarPreviewFotos() {
    if (!previewFotos) return;
    previewFotos.innerHTML = "";

    if (estado.fotos.length === 0) {
      resetarTextoFotos();
      return;
    }

    estado.fotos.forEach((foto, indice) => {
      const item = document.createElement("div");
      item.className = "preview-fotos__item";

      const img = document.createElement("img");
      img.src = URL.createObjectURL(foto);
      img.alt = `Página ${indice + 1}`;
      img.onload = () => URL.revokeObjectURL(img.src);

      const btnRemover = document.createElement("button");
      btnRemover.type = "button";
      btnRemover.className = "preview-fotos__remover";
      btnRemover.textContent = "✕";
      btnRemover.setAttribute("aria-label", `Remover página ${indice + 1}`);
      btnRemover.addEventListener("click", (ev) => {
        ev.stopPropagation();
        estado.fotos.splice(indice, 1);
        renderizarPreviewFotos();
        if (onMudar) onMudar(estado);
      });

      item.append(img, btnRemover);
      previewFotos.appendChild(item);
    });

    if (dropzoneAjudaFotos) {
      dropzoneAjudaFotos.textContent = `${estado.fotos.length} página(s) adicionada(s) — clica para adicionar mais`;
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
      mostrarToast("Nenhuma imagem válida capturada.");
      return;
    }

    adicionarFicheiros(imagens);
    mostrarToast(`📸 ${imagens.length} foto(s) capturada(s) com sucesso!`);
  });

  /* ---------- lógica de câmera (mobile vs desktop) ---------- */
  function abrirCamera(aoCapturar) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Sem suporte a getUserMedia — tenta pelo menos o input nativo
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
  }

  aplicarVisualTipo();

  return {
    estado,
    adicionarFicheiros,
    resetar,
    definirTipo,
  };
}

/* ============================================================
   CÂMERA NO DESKTOP (getUserMedia)
   ============================================================ */
function abrirCameraDesktop(aoCapturar) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarToast("O teu navegador não suporta acesso à câmera.");
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
      contador.textContent = "0 foto(s) capturada(s)";

      const btnCapturar = document.createElement("button");
      btnCapturar.type = "button";
      btnCapturar.className = "camera-overlay__capturar";
      btnCapturar.textContent = "📸 Capturar";

      const btnFechar = document.createElement("button");
      btnFechar.type = "button";
      btnFechar.className = "camera-overlay__fechar";
      btnFechar.textContent = "✕ Concluir";

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
            contador.textContent = `${capturas} foto(s) capturada(s)`;
            mostrarToast("📸 Foto capturada com sucesso!");
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
      mostrarToast("Não foi possível abrir a câmera. Verifica as permissões.");
    });
}

/* ============================================================
   ESTADO GLOBAL DA CONFIGURAÇÃO
   ============================================================ */
const CHAVE_ARMAZENAMENTO = "corretoria_config_v1";

const configuracao = {
  rigor: "equilibrado",
  tolerancia: 30,
  notaMax: 20,
  metricas: {
    conteudo: true,
    raciocinio: true,
    organizacao: false,
    ortografia: false,
    caligrafia: false,
  },
  criterios: "",
  chave: {
    tipo: "pdf",
    nomes: [],
  },
};

function guardarConfiguracaoLocal() {
  try {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(configuracao));
  } catch (e) {
    console.warn("Não foi possível guardar as configurações localmente:", e);
  }
}

function carregarConfiguracaoLocal() {
  try {
    const guardado = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (!guardado) return;
    const dados = JSON.parse(guardado);
    Object.assign(configuracao, dados, {
      metricas: { ...configuracao.metricas, ...(dados.metricas || {}) },
      chave: { ...configuracao.chave, ...(dados.chave || {}) },
    });
  } catch (e) {
    console.warn("Não foi possível carregar configurações guardadas:", e);
  }
}

/* ============================================================
   INICIALIZAÇÃO GERAL
   ============================================================ */
document.addEventListener("DOMContentLoaded", inicializar);

function inicializar() {
  console.log("🚀 Inicializando CorretorIA...");

  carregarConfiguracaoLocal();

  /* ---------- Referências ---------- */
  const modalOverlay = document.getElementById("modalOverlay");
  const btnAbrirTopo = document.getElementById("btnAbrirModalTopo");
  const btnAbrirHero = document.getElementById("btnAbrirModalHero");
  const btnFecharModal = document.getElementById("btnFecharModal");
  const formProva = document.getElementById("formProva");
  const inputNome = document.getElementById("inputNome");
  const inputNumero = document.getElementById("inputNumero");
  const listaProvas = document.getElementById("listaProvas");
  const secFila = document.getElementById("secFila");
  const btnExportarTudo = document.getElementById("btnExportarTudo");

  const painelChat = document.getElementById("painelChat");
  const btnChat = document.getElementById("btnChat");
  const btnFecharChat = document.getElementById("btnFecharChat");
  const btnAbrirChat = document.getElementById("btnAbrirChat");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMensagens = document.getElementById("chatMensagens");

  const painelConfig = document.getElementById("painelConfig");
  const btnConfig = document.getElementById("btnConfig");
  const btnFecharConfig = document.getElementById("btnFecharConfig");
  const painelOverlay = document.getElementById("painelOverlay");

  const selRigor = document.getElementById("selRigor");
  const rangeTolerancia = document.getElementById("rangeTolerancia");
  const valTolerancia = document.getElementById("valTolerancia");
  const inputNotaMax = document.getElementById("inputNotaMax");
  const checkboxesMetrica = document.querySelectorAll("[data-metrica]");
  const txtCriterios = document.getElementById("txtCriterios");
  const btnGuardarConfig = document.getElementById("btnGuardarConfig");

  const btnTema = document.getElementById("btnTema");

  const chaveAcoes = document.getElementById("chaveAcoes");
  const chaveResumo = document.getElementById("chaveResumo");
  const btnRemoverChave = document.getElementById("btnRemoverChave");

  // Verifica se os elementos principais existem
  if (!modalOverlay) console.warn("⚠️ modalOverlay não encontrado");
  if (!formProva) console.warn("⚠️ formProva não encontrado");

  /* ============================================================
     UPLOAD DA PROVA (modal "+ Nova prova")
     ============================================================ */
  const anexoProva = criarUploadAnexo({
    radios: formProva ? formProva.tipoFicheiro : [],
    inputFicheiro: document.getElementById("inputFicheiro"),
    inputCamera: document.getElementById("inputCamera"),
    dropzone: document.getElementById("dropzone"),
    dropzonePdf: document.getElementById("dropzonePdf"),
    dropzoneFotos: document.getElementById("dropzoneFotos"),
    dropzoneTextoPdf: document.getElementById("dropzoneTextoPdf"),
    dropzoneAjudaPdf: document.getElementById("dropzoneAjudaPdf"),
    dropzoneAjudaFotos: document.getElementById("dropzoneAjudaFotos"),
    opcaoUpload: document.getElementById("opcaoUpload"),
    opcaoCamera: document.getElementById("opcaoCamera"),
    previewFotos: document.getElementById("previewFotos"),
    campoErro: "ficheiro",
    textoPdfPadrao: "Arrasta o PDF aqui ou <u>clica para escolher</u>",
    textoFotosPadrao: "Várias fotos — uma por página da prova",
  });

  /* ============================================================
     UPLOAD DA CHAVE DE CORREÇÃO (painel Configurações)
     ============================================================ */
  const anexoChave = criarUploadAnexo({
    radios: document.querySelectorAll('input[name="tipoFicheiroChave"]'),
    inputFicheiro: document.getElementById("inputFicheiroChave"),
    inputCamera: document.getElementById("inputCameraChave"),
    dropzone: document.getElementById("dropzoneChave"),
    dropzonePdf: document.getElementById("dropzonePdfChave"),
    dropzoneFotos: document.getElementById("dropzoneFotosChave"),
    dropzoneTextoPdf: document.getElementById("dropzoneTextoPdfChave"),
    dropzoneAjudaPdf: document.getElementById("dropzoneAjudaPdfChave"),
    dropzoneAjudaFotos: document.getElementById("dropzoneAjudaFotosChave"),
    opcaoUpload: document.getElementById("opcaoUploadChave"),
    opcaoCamera: document.getElementById("opcaoCameraChave"),
    previewFotos: document.getElementById("previewFotosChave"),
    campoErro: "ficheiroChave",
    textoPdfPadrao: "Arrasta o PDF da chave aqui ou <u>clica para escolher</u>",
    textoFotosPadrao: "Várias fotos — uma por página da chave",
    onMudar: atualizarResumoChave,
  });

  function atualizarResumoChave() {
    const temPdf = anexoChave.estado.tipo === "pdf" && anexoChave.estado.pdf;
    const temFotos = anexoChave.estado.tipo === "foto" && anexoChave.estado.fotos.length > 0;

    if (!temPdf && !temFotos) {
      chaveAcoes.hidden = true;
      chaveResumo.textContent = "";
      return;
    }

    chaveAcoes.hidden = false;
    if (temPdf) {
      chaveResumo.textContent = `📄 ${anexoChave.estado.pdf.name} — ${formatarTamanho(anexoChave.estado.pdf.size)}`;
    } else {
      chaveResumo.textContent = `📷 ${anexoChave.estado.fotos.length} foto(s) anexada(s)`;
    }
  }

  if (btnRemoverChave) {
    btnRemoverChave.addEventListener("click", () => {
      anexoChave.resetar();
      atualizarResumoChave();
      mostrarToast("Chave de correção removida.");
    });
  }

  atualizarResumoChave();

  /* ============================================================
     MODAL DE NOVA PROVA
     ============================================================ */
  function abrirModal() {
    if (!modalOverlay) return;
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (inputNome) inputNome.focus();
    console.log("📂 Modal aberto");
  }

  function fecharModal() {
    if (!modalOverlay) return;
    modalOverlay.hidden = true;
    document.body.style.overflow = "";
    limparFormulario();
    console.log("📂 Modal fechado");
  }

  function limparFormulario() {
    if (formProva) formProva.reset();
    anexoProva.resetar();
    ["nome", "numero", "ficheiro"].forEach(limparErro);
    if (inputNome) inputNome.classList.remove("invalido");
    if (inputNumero) inputNumero.classList.remove("invalido");
  }

  if (btnAbrirTopo) btnAbrirTopo.addEventListener("click", abrirModal);
  if (btnAbrirHero) btnAbrirHero.addEventListener("click", abrirModal);
  if (btnFecharModal) btnFecharModal.addEventListener("click", fecharModal);

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) fecharModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modalOverlay && !modalOverlay.hidden) {
      fecharModal();
      return;
    }
    if (painelConfig && painelConfig.classList.contains("aberto")) fecharPaineis();
    else if (painelChat && painelChat.classList.contains("aberto")) fecharPaineis();
  });

  /* ---------- validação e envio ---------- */
  function validarFormulario() {
    let valido = true;

    if (!inputNome || !inputNumero) return false;

    const nome = inputNome.value.trim();
    if (nome.length < 2) {
      mostrarErro("nome", "Indica o nome completo do estudante.");
      inputNome.classList.add("invalido");
      valido = false;
    } else {
      limparErro("nome");
      inputNome.classList.remove("invalido");
    }

    const numero = inputNumero.value.trim();
    if (numero.length < 1) {
      mostrarErro("numero", "Indica o número de estudante.");
      inputNumero.classList.add("invalido");
      valido = false;
    } else {
      limparErro("numero");
      inputNumero.classList.remove("invalido");
    }

    if (anexoProva.estado.tipo === "pdf" && !anexoProva.estado.pdf) {
      mostrarErro("ficheiro", "Anexa o PDF da prova.");
      valido = false;
    }
    if (anexoProva.estado.tipo === "foto" && anexoProva.estado.fotos.length === 0) {
      mostrarErro("ficheiro", "Anexa pelo menos uma foto da prova.");
      valido = false;
    }

    return valido;
  }

  if (formProva) {
    formProva.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("📤 Formulário submetido");

      if (!validarFormulario()) {
        console.warn("⚠️ Formulário inválido");
        return;
      }

      const prova = {
        id: Date.now(),
        nome: inputNome ? inputNome.value.trim() : "",
        numero: inputNumero ? inputNumero.value.trim() : "",
        tipo: anexoProva.estado.tipo,
        ficheiros:
          anexoProva.estado.tipo === "pdf"
            ? [anexoProva.estado.pdf]
            : [...anexoProva.estado.fotos],
        estadoAnalise: "analise",
        nota: null,
      };

      console.log("📝 Prova criada:", prova);

      adicionarProvaNaFila(prova);
      fecharModal();
      mostrarToast(`Prova de ${prova.nome} enviada para análise.`);
      simularCorrecaoIA(prova);
    });
  }

  /* ============================================================
     FILA DE PROVAS
     ============================================================ */
  function adicionarProvaNaFila(prova) {
    if (!secFila) return;
    secFila.hidden = false;

    const card = document.createElement("div");
    card.className = "prova-card";
    card.id = `prova-${prova.id}`;

    const icone = prova.tipo === "pdf" ? "📄" : "📷";

    card.innerHTML = `
      <div class="prova-card__icone">${icone}</div>
      <div class="prova-card__info">
        <div class="prova-card__nome">${escaparHtml(prova.nome)}</div>
        <div class="prova-card__meta">Nº ${escaparHtml(prova.numero)} · ${
          prova.ficheiros.length
        } ficheiro(s)</div>
      </div>
      <div class="prova-card__estado estado--analise" data-estado>A analisar…</div>
    `;

    if (listaProvas) listaProvas.prepend(card);
    console.log("✅ Prova adicionada à fila:", prova.nome);
  }

  function atualizarProvaNaFila(prova) {
    const card = document.getElementById(`prova-${prova.id}`);
    if (!card) return;

    const estadoEl = card.querySelector("[data-estado]");
    if (!estadoEl) return;

    estadoEl.classList.remove("estado--analise");
    estadoEl.classList.add("estado--concluido");
    estadoEl.textContent = `Nota: ${prova.nota} / ${configuracao.notaMax}`;

    if (!card.querySelector(".prova-card__acoes")) {
      const acoes = document.createElement("div");
      acoes.className = "prova-card__acoes";
      acoes.innerHTML = `<button type="button" class="btn btn--pequeno" data-acao="exportar">⬇ Exportar CSV</button>`;
      card.appendChild(acoes);

      acoes.querySelector('[data-acao="exportar"]').addEventListener("click", () => {
        exportarProvasParaCsv([prova]);
      });
    }
    console.log("✅ Prova atualizada:", prova.nome, "Nota:", prova.nota);
  }

  /* ============================================================
     FUNÇÃO DE CÁLCULO DE NOTA SIMULADA (FALLBACK)
     ============================================================ */
  function calcularNotaSimulada() {
    const rigorFactor = {
      flexivel: 0.9,
      equilibrado: 0.75,
      rigoroso: 0.6,
      "muito-rigoroso": 0.45,
    }[configuracao.rigor] ?? 0.75;

    const toleranciaBonus = (configuracao.tolerancia / 100) * 0.15;
    const base = rigorFactor + toleranciaBonus;
    const variacao = (Math.random() - 0.5) * 0.25;
    const fracao = Math.min(1, Math.max(0, base + variacao));

    const nota = Math.round(fracao * configuracao.notaMax * 10) / 10;
    return nota;
  }

  /* ============================================================
     CORREÇÃO COM IA - INTEGRAÇÃO COM API
     ============================================================ */

  // Verifica se a API Service está disponível
  const apiDisponivel = typeof getApiService === 'function' && typeof enviarProvaParaCorrecao === 'function';

  async function simularCorrecaoIA(prova) {
    const provasPorId = window._provasPorId || new Map();
    provasPorId.set(prova.id, prova);
    window._provasPorId = provasPorId;

    try {
      if (apiDisponivel) {
        mostrarToast(`⏳ Enviando "${prova.nome}" para correção...`);
        console.log("📡 Enviando para API...");

        // Envia para a API usando a função unificada
        const resultado = await enviarProvaParaCorrecao(
          prova,
          prova.ficheiros,
          configuracao,
          anexoChave ? anexoChave.estado : null
        );

        console.log("📥 Resposta da API:", resultado);

        // Atualiza a prova com os resultados
        prova.nota = resultado.nota || 0;
        prova.notaMaxima = resultado.notaMaxima || configuracao.notaMax;
        prova.detalhes = resultado.detalhes || null;
        prova.comentario = resultado.comentario || 'Correção concluída.';
        prova.estadoAnalise = 'concluido';

        // Atualiza a fila
        atualizarProvaNaFila(prova);

        const emoji = resultado.status === 'fallback' ? '⚠️' : '✅';
        mostrarToast(`${emoji} Correção concluída: ${prova.nome} obteve ${prova.nota}/${prova.notaMaxima}`);
      } else {
        // Modo offline - usa simulação local
        console.warn('⚠️ API Service não disponível, sem resposta.');
        // simulacaoLocal(prova);
      }
    } catch (error) {
      console.error('❌ Erro na correção:', error);
      // Fallback para simulação local
    //   simulacaoLocal(prova);
    }
  }

  function simulacaoLocal(prova) {
    const tempoBase = 1800 + Math.random() * 1600;

    mostrarToast(`⏳ Processando "${prova.nome}" localmente...`);

    setTimeout(() => {
      prova.nota = calcularNotaSimulada();
      prova.notaMaxima = configuracao.notaMax;
      prova.estadoAnalise = 'concluido';
      prova.comentario = 'Simulação local (modo offline)';
      atualizarProvaNaFila(prova);
      mostrarToast(`⚠️ Correção local: ${prova.nome} obteve ${prova.nota}/${configuracao.notaMax}`);
      console.log("📊 Correção local concluída:", prova);
    }, tempoBase);
  }

  /* ============================================================
     EXPORTAÇÃO CSV
     ============================================================ */
  function exportarProvasParaCsv(provas) {
    if (!provas.length) {
      mostrarToast("Não há provas concluídas para exportar.");
      return;
    }

    const linhas = [["Nome", "Número", "Tipo", "Nota", "Nota Máxima", "Estado"]];
    provas.forEach((p) => {
      linhas.push([
        p.nome,
        p.numero,
        p.tipo,
        p.nota ?? "",
        configuracao.notaMax,
        p.estadoAnalise,
      ]);
    });

    const csv = linhas
      .map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `provas-corretoria-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    mostrarToast("✅ CSV exportado com sucesso!");
  }

  if (btnExportarTudo) {
    btnExportarTudo.addEventListener("click", () => {
      const provasPorId = window._provasPorId || new Map();
      const concluidas = Array.from(provasPorId.values()).filter(
        (p) => p.estadoAnalise === "concluido",
      );
      if (concluidas.length === 0) {
        mostrarToast("Ainda não há provas corrigidas para exportar.");
        return;
      }
      exportarProvasParaCsv(concluidas);
    });
  }

  /* ============================================================
     PAINÉIS LATERAIS (Chat e Configurações)
     ============================================================ */
  function algumPainelAberto() {
    return (painelChat && painelChat.classList.contains("aberto")) ||
           (painelConfig && painelConfig.classList.contains("aberto"));
  }

  function atualizarOverlay() {
    if (painelOverlay) painelOverlay.hidden = !algumPainelAberto();
  }

  function abrirChat() {
    if (painelConfig) painelConfig.classList.remove("aberto");
    if (painelChat) painelChat.classList.add("aberto");
    if (btnAbrirChat) btnAbrirChat.hidden = true;
    atualizarOverlay();
  }

  function fecharPaineis() {
    if (painelChat) painelChat.classList.remove("aberto");
    if (painelConfig) painelConfig.classList.remove("aberto");
    if (btnAbrirChat) btnAbrirChat.hidden = false;
    atualizarOverlay();
  }

  function abrirConfig() {
    if (painelChat) painelChat.classList.remove("aberto");
    if (btnAbrirChat) btnAbrirChat.hidden = false;
    if (painelConfig) painelConfig.classList.add("aberto");
    atualizarOverlay();
  }

  if (btnChat) btnChat.addEventListener("click", abrirChat);
  if (btnAbrirChat) btnAbrirChat.addEventListener("click", abrirChat);
  if (btnFecharChat) btnFecharChat.addEventListener("click", fecharPaineis);

  if (btnConfig) btnConfig.addEventListener("click", abrirConfig);
  if (btnFecharConfig) btnFecharConfig.addEventListener("click", fecharPaineis);

  if (painelOverlay) painelOverlay.addEventListener("click", fecharPaineis);

  /* ============================================================
     CHAT COM A IA (simulado)
     ============================================================ */
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = chatInput ? chatInput.value.trim() : "";
      if (!texto) return;

      adicionarMensagemChat(texto, "eu");
      if (chatInput) chatInput.value = "";

      setTimeout(() => {
        adicionarMensagemChat(gerarRespostaChat(texto), "ia");
      }, 500 + Math.random() * 400);
    });
  }

  function adicionarMensagemChat(texto, autor) {
    if (!chatMensagens) return;
    const msg = document.createElement("div");
    msg.className = autor === "eu" ? "msg msg--eu" : "msg msg--ia";
    msg.textContent = texto;
    chatMensagens.appendChild(msg);
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
  }

  function gerarRespostaChat(pergunta) {
    const p = pergunta.toLowerCase();
    if (p.includes("nota") || p.includes("rigor")) {
      return `Atualmente o rigor está definido como "${configuracao.rigor}" e a nota máxima é ${configuracao.notaMax}. Podes ajustar isso em Configurações.`;
    }
    if (p.includes("chave") || p.includes("gabarito")) {
      const temChave = anexoChave.estado.pdf || anexoChave.estado.fotos.length > 0;
      return temChave
        ? "Já existe uma chave de correção carregada nas Configurações. A IA vai usá-la como referência ao corrigir."
        : "Ainda não carregaste uma chave de correção. Vai a Configurações → Chave de correção para anexares o gabarito (PDF ou foto).";
    }
    return "Entendido! Posso ajudar-te a ajustar critérios de correção, explicar notas ou rever a chave de correção. O que precisas exatamente?";
  }

  /* ============================================================
     CONFIGURAÇÕES DE AVALIAÇÃO
     ============================================================ */
  function preencherFormularioConfig() {
    if (selRigor) selRigor.value = configuracao.rigor;
    if (rangeTolerancia) rangeTolerancia.value = configuracao.tolerancia;
    if (valTolerancia) valTolerancia.textContent = `${configuracao.tolerancia}%`;
    if (inputNotaMax) inputNotaMax.value = configuracao.notaMax;
    if (txtCriterios) txtCriterios.value = configuracao.criterios;

    checkboxesMetrica.forEach((cb) => {
      const chave = cb.dataset.metrica;
      cb.checked = !!configuracao.metricas[chave];
    });
  }

  preencherFormularioConfig();

  if (rangeTolerancia) {
    rangeTolerancia.addEventListener("input", () => {
      if (valTolerancia) valTolerancia.textContent = `${rangeTolerancia.value}%`;
    });
  }

  if (btnGuardarConfig) {
    btnGuardarConfig.addEventListener("click", () => {
      configuracao.rigor = selRigor ? selRigor.value : configuracao.rigor;
      configuracao.tolerancia = rangeTolerancia ? Number(rangeTolerancia.value) : configuracao.tolerancia;

      let notaMax = inputNotaMax ? Number(inputNotaMax.value) : configuracao.notaMax;
      if (!Number.isFinite(notaMax) || notaMax < 5) notaMax = 5;
      if (notaMax > 100) notaMax = 100;
      configuracao.notaMax = notaMax;
      if (inputNotaMax) inputNotaMax.value = notaMax;

      configuracao.criterios = txtCriterios ? txtCriterios.value.trim() : "";

      checkboxesMetrica.forEach((cb) => {
        configuracao.metricas[cb.dataset.metrica] = cb.checked;
      });

      configuracao.chave.tipo = anexoChave.estado.tipo;
      configuracao.chave.nomes =
        anexoChave.estado.tipo === "pdf" && anexoChave.estado.pdf
          ? [anexoChave.estado.pdf.name]
          : anexoChave.estado.fotos.map((f) => f.name);

      guardarConfiguracaoLocal();
      mostrarToast("Configurações guardadas com sucesso.");
    });
  }

  /* ============================================================
     TEMA CLARO / ESCURO
     ============================================================ */
  const CHAVE_TEMA = "corretoria_tema";

  function aplicarTema(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    if (btnTema) {
      const paraClaro = tema === "dark";
      btnTema.textContent = paraClaro ? "☀️" : "🌙";
      btnTema.setAttribute("aria-label", paraClaro ? "Activar modo claro" : "Activar modo escuro");
      btnTema.title = paraClaro ? "Modo claro" : "Modo escuro";
    }
  }

  function iniciarTema() {
    let temaGuardado = null;
    try {
      temaGuardado = localStorage.getItem(CHAVE_TEMA);
    } catch (e) {
      /* localStorage indisponível — ignora */
    }
    const temaInicial = temaGuardado || document.documentElement.getAttribute("data-theme") || "dark";
    aplicarTema(temaInicial);
  }

  if (btnTema) {
    btnTema.addEventListener("click", () => {
      const atual = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      aplicarTema(atual);
      try {
        localStorage.setItem(CHAVE_TEMA, atual);
      } catch (e) {
        /* localStorage indisponível — ignora */
      }
    });
  }

  iniciarTema();
  console.log("✅ CorretorIA inicializado com sucesso!");
}
