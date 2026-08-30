/* ============================================================
   CORREÇÃO EM LOTE E RELATÓRIO
   ============================================================ */

"use strict";

let linhasLote = [];
const lotesEmAndamento = new Map();
let ultimoRelatorioProvas = [];

function criarLinhaLote() {
  const t = window.t || function(chave) { return chave; };
  const proximoId = window.proximoId || function() { return Date.now(); };
  const criarUploadAnexo = window.criarUploadAnexo || function() { return { estado: { tipo: "pdf", pdf: null, fotos: [] }, resetar: function() {} }; };
  const loteLista = document.getElementById("loteLista");

  if (!loteLista) return null;

  const id = proximoId();
  const numero = linhasLote.length + 1;

  const wrapper = document.createElement("div");
  wrapper.className = "lote-linha";
  wrapper.dataset.linhaId = String(id);
  wrapper.innerHTML = `
    <div class="lote-linha__topo">
      <span class="lote-linha__titulo">${t("loteAlunoTitulo", { n: numero })}</span>
      <button type="button" class="lote-linha__remover">${t("loteRemoverAluno")}</button>
    </div>

    <div class="lote-linha__campos">
      <div class="campo">
        <label>${t("labelNome")}</label>
        <input type="text" class="lote-nome" maxlength="100" placeholder="${t("placeholderNome")}" />
        <small class="campo__erro" data-erro="nomeLote${id}"></small>
      </div>
      <div class="campo">
        <label>${t("labelNumero")}</label>
        <input type="text" class="lote-numero" maxlength="20" placeholder="${t("placeholderNumero")}" />
        <small class="campo__erro" data-erro="numeroLote${id}"></small>
      </div>
    </div>

    <div class="campo">
      <span class="campo__rotulo">${t("labelFormato")}</span>
      <div class="tipo-toggle" role="radiogroup">
        <label class="tipo-toggle__opcao">
          <input type="radio" name="tipoFicheiroLote${id}" value="pdf" checked />
          <span>${t("optPdf")}</span>
        </label>
        <label class="tipo-toggle__opcao">
          <input type="radio" name="tipoFicheiroLote${id}" value="foto" />
          <span>${t("optFoto")}</span>
        </label>
      </div>
    </div>

    <div class="dropzone dropzone--compacta" id="dropzoneLote${id}">
      <input type="file" id="inputFicheiroLote${id}" accept="application/pdf" hidden />
      <input type="file" id="inputCameraLote${id}" accept="image/*" capture="environment" hidden />

      <div class="dropzone__conteudo" id="dropzonePdfLote${id}">
        <span class="dropzone__icone">⇪</span>
        <p id="dropzoneTextoPdfLote${id}"></p>
        <small id="dropzoneAjudaPdfLote${id}"></small>
      </div>

      <div class="dropzone__conteudo dropzone__fotos" id="dropzoneFotosLote${id}">
        <div class="dropzone__opcoes">
          <div class="dropzone__opcao" id="opcaoUploadLote${id}">
            <span class="dropzone__icone">⇪</span>
            <p><strong>${t("dzFotosCarregar")}</strong></p>
            <small>${t("dzFotosGaleria")}</small>
          </div>
          <div class="dropzone__opcao" id="opcaoCameraLote${id}">
            <span class="dropzone__icone">📷</span>
            <p><strong>${t("dzFotosTirar")}</strong></p>
            <small>${t("dzFotosCamera")}</small>
          </div>
        </div>
        <small class="dropzone__ajuda" id="dropzoneAjudaFotosLote${id}"></small>
      </div>
    </div>

    <small class="campo__erro" data-erro="ficheiroLote${id}"></small>
    <div class="preview-fotos" id="previewFotosLote${id}"></div>
  `;

  loteLista.appendChild(wrapper);

  const anexo = criarUploadAnexo({
    radios: wrapper.querySelectorAll(`input[name="tipoFicheiroLote${id}"]`),
    inputFicheiro: wrapper.querySelector(`#inputFicheiroLote${id}`),
    inputCamera: wrapper.querySelector(`#inputCameraLote${id}`),
    dropzone: wrapper.querySelector(`#dropzoneLote${id}`),
    dropzonePdf: wrapper.querySelector(`#dropzonePdfLote${id}`),
    dropzoneFotos: wrapper.querySelector(`#dropzoneFotosLote${id}`),
    dropzoneTextoPdf: wrapper.querySelector(`#dropzoneTextoPdfLote${id}`),
    dropzoneAjudaPdf: wrapper.querySelector(`#dropzoneAjudaPdfLote${id}`),
    dropzoneAjudaFotos: wrapper.querySelector(`#dropzoneAjudaFotosLote${id}`),
    opcaoUpload: wrapper.querySelector(`#opcaoUploadLote${id}`),
    opcaoCamera: wrapper.querySelector(`#opcaoCameraLote${id}`),
    previewFotos: wrapper.querySelector(`#previewFotosLote${id}`),
    campoErro: `ficheiroLote${id}`,
    chaveTextoPdf: "dzPdfTexto",
    chaveTextoFotos: "dzFotosAjuda",
  });

  const linha = { id, elemento: wrapper, anexo };
  linhasLote.push(linha);

  wrapper.querySelector(".lote-linha__remover").addEventListener("click", () => {
    wrapper.remove();
    linhasLote = linhasLote.filter((l) => l.id !== id);
    renumerarLinhasLote();
  });

  return linha;
}

function renumerarLinhasLote() {
  const t = window.t || function(chave) { return chave; };
  linhasLote.forEach((linha, indice) => {
    const titulo = linha.elemento.querySelector(".lote-linha__titulo");
    if (titulo) titulo.textContent = t("loteAlunoTitulo", { n: indice + 1 });
  });
}

function gerarRelatorioLote(provas) {
  const t = window.t || function(chave) { return chave; };
  const getConfiguracao = window.getConfiguracao || function() { return { notaMax: 20 }; };
  const relatorioCorpo = document.getElementById("relatorioCorpo");
  const relatorioSub = document.getElementById("relatorioSub");
  const relatorioResumo = document.getElementById("relatorioResumo");
  const modalRelatorioOverlay = document.getElementById("modalRelatorioOverlay");

  if (!relatorioCorpo || !modalRelatorioOverlay) return;

  ultimoRelatorioProvas = provas;
  relatorioCorpo.innerHTML = "";

  const config = getConfiguracao();
  let somaPercentagem = 0;

  provas.forEach((p) => {
    const percentagem = config.notaMax > 0 ? Math.round((p.nota / config.notaMax) * 1000) / 10 : 0;
    somaPercentagem += percentagem;

    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.numero}</td>
      <td>${p.nota} / ${config.notaMax}</td>
      <td>${percentagem}%</td>
    `;
    relatorioCorpo.appendChild(linha);
  });

  const media = provas.length ? Math.round((somaPercentagem / provas.length) * 10) / 10 : 0;

  if (relatorioSub) relatorioSub.textContent = t("relatorioSubTexto", { n: provas.length });
  if (relatorioResumo) {
    relatorioResumo.innerHTML = `
      ${t("relatorioMedia", { valor: media })}
      <small>${t("relatorioMediaSub", { n: provas.length })}</small>
    `;
  }

  modalRelatorioOverlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function aoProvaDoLoteConcluir(loteId) {
  const t = window.t || function(chave) { return chave; };
  const mostrarToast = window.mostrarToast || function(msg) { alert(msg); };

  const lote = lotesEmAndamento.get(loteId);
  if (!lote) return;
  lote.restantes -= 1;
  if (lote.restantes <= 0) {
    mostrarToast(t("toastLoteConcluido"));
    gerarRelatorioLote(lote.provas);
    lotesEmAndamento.delete(loteId);
  }
}

// Exporta globalmente
window.criarLinhaLote = criarLinhaLote;
window.renumerarLinhasLote = renumerarLinhasLote;
window.gerarRelatorioLote = gerarRelatorioLote;
window.aoProvaDoLoteConcluir = aoProvaDoLoteConcluir;
window.linhasLote = () => linhasLote;
window.lotesEmAndamento = lotesEmAndamento;
window.ultimoRelatorioProvas = () => ultimoRelatorioProvas;