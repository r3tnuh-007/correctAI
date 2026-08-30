/* ============================================================
   CONFIGURAÇÕES UI
   ============================================================ */

"use strict";

function preencherFormularioConfig() {
  const config = window.getConfiguracao ? window.getConfiguracao() : { 
    rigor: "equilibrado", 
    tolerancia: 30, 
    notaMax: 20, 
    metricas: {}, 
    criterios: "" 
  };
  
  const selRigor = document.getElementById("selRigor");
  const rangeTolerancia = document.getElementById("rangeTolerancia");
  const valTolerancia = document.getElementById("valTolerancia");
  const inputNotaMax = document.getElementById("inputNotaMax");
  const txtCriterios = document.getElementById("txtCriterios");
  const checkboxesMetrica = document.querySelectorAll("[data-metrica]");

  if (selRigor) selRigor.value = config.rigor;
  if (rangeTolerancia) rangeTolerancia.value = config.tolerancia;
  if (valTolerancia) valTolerancia.textContent = `${config.tolerancia}%`;
  if (inputNotaMax) inputNotaMax.value = config.notaMax;
  if (txtCriterios) txtCriterios.value = config.criterios;

  checkboxesMetrica.forEach((cb) => {
    const chave = cb.dataset.metrica;
    cb.checked = !!config.metricas[chave];
  });
}

function iniciarConfiguracoes() {
  const selRigor = document.getElementById("selRigor");
  const rangeTolerancia = document.getElementById("rangeTolerancia");
  const valTolerancia = document.getElementById("valTolerancia");
  const inputNotaMax = document.getElementById("inputNotaMax");
  const txtCriterios = document.getElementById("txtCriterios");
  const checkboxesMetrica = document.querySelectorAll("[data-metrica]");
  const btnGuardarConfig = document.getElementById("btnGuardarConfig");
  const chaveAcoes = document.getElementById("chaveAcoes");
  const chaveResumo = document.getElementById("chaveResumo");
  const btnRemoverChave = document.getElementById("btnRemoverChave");
  const t = window.t || function(chave) { return chave; };

  const anexoChave = (typeof window.criarUploadAnexo === 'function')
    ? window.criarUploadAnexo({
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
        chaveTextoPdf: "dzChavePdfTexto",
        chaveTextoFotos: "dzChaveFotosAjuda",
        aoMudar: () => atualizarResumoChave(),
      })
    : { estado: { tipo: "pdf", pdf: null, fotos: [] }, resetar: function() {} };
  window.anexoChave = anexoChave;

  function atualizarResumoChave() {
    if (!chaveAcoes || !chaveResumo) return;
    const temChave = anexoChave.estado.tipo === "pdf"
      ? !!anexoChave.estado.pdf
      : anexoChave.estado.fotos.length > 0;

    chaveAcoes.hidden = !temChave;
    if (temChave) {
      chaveResumo.textContent = anexoChave.estado.tipo === "pdf"
        ? anexoChave.estado.pdf.name
        : t("dzFotosContagem", { n: anexoChave.estado.fotos.length });
    } else {
      chaveResumo.textContent = "";
    }
  }

  if (btnRemoverChave) {
    btnRemoverChave.addEventListener("click", function() {
      if (anexoChave.resetar) anexoChave.resetar();
      atualizarResumoChave();
    });
  }

  atualizarResumoChave();

  // Preencher formulário
  preencherFormularioConfig();

  // Range tolerância
  if (rangeTolerancia) {
    rangeTolerancia.addEventListener("input", () => {
      if (valTolerancia) valTolerancia.textContent = `${rangeTolerancia.value}%`;
    });
  }

  // Guardar configurações
  if (btnGuardarConfig) {
    btnGuardarConfig.addEventListener("click", function() {
      const config = window.getConfiguracao ? window.getConfiguracao() : {};
      
      config.rigor = selRigor ? selRigor.value : config.rigor;
      config.tolerancia = rangeTolerancia ? Number(rangeTolerancia.value) : config.tolerancia;

      let notaMax = inputNotaMax ? Number(inputNotaMax.value) : config.notaMax;
      if (!Number.isFinite(notaMax) || notaMax < 5) notaMax = 5;
      if (notaMax > 100) notaMax = 100;
      config.notaMax = notaMax;
      if (inputNotaMax) inputNotaMax.value = notaMax;

      config.criterios = txtCriterios ? txtCriterios.value.trim() : "";

      checkboxesMetrica.forEach((cb) => {
        config.metricas[cb.dataset.metrica] = cb.checked;
      });

      if (anexoChave && anexoChave.estado) {
        config.chave.tipo = anexoChave.estado.tipo;
        config.chave.nomes = anexoChave.estado.tipo === "pdf" && anexoChave.estado.pdf
          ? [anexoChave.estado.pdf.name]
          : anexoChave.estado.fotos.map((f) => f.name);
      }

      if (typeof window.guardarConfiguracaoLocal === 'function') {
        window.guardarConfiguracaoLocal();
      }
      
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(t("toastConfigGuardada"));
      }
    });
  }
}

// Exporta globalmente
window.iniciarConfiguracoes = iniciarConfiguracoes;
window.preencherFormularioConfig = preencherFormularioConfig;