/* ============================================================
   MODAIS DE CORREÇÃO (Simples e Lote)
   ============================================================ */

"use strict";

let modoAtual = "simples";

function iniciarModoCorrecao() {
  const btnModoSimples = document.getElementById("btnModoSimples");
  const btnModoLote = document.getElementById("btnModoLote");
  const textoBotaoHero = document.getElementById("textoBotaoHero");
  const t = window.t || function(chave) { return chave; };

  if (!btnModoSimples || !btnModoLote) return;

  function definirModo(modo) {
    modoAtual = modo;
    btnModoSimples.classList.toggle("ativo", modo === "simples");
    btnModoLote.classList.toggle("ativo", modo === "lote");
    if (textoBotaoHero) {
      textoBotaoHero.textContent = modo === "simples" ? t("heroBotaoSimples") : t("heroBotaoLote");
    }
  }

  btnModoSimples.addEventListener("click", () => definirModo("simples"));
  btnModoLote.addEventListener("click", () => definirModo("lote"));

  window.atualizarModo = function() {
    definirModo(modoAtual);
  };
}

function iniciarModalSimples() {
  const modalOverlay = document.getElementById("modalOverlay");
  const btnAbrirTopo = document.getElementById("btnAbrirModalTopo");
  const btnAbrirHero = document.getElementById("btnAbrirModalHero");
  const btnFecharModal = document.getElementById("btnFecharModal");
  const formProva = document.getElementById("formProva");
  const inputNome = document.getElementById("inputNome");
  const inputNumero = document.getElementById("inputNumero");
  const t = window.t || function(chave) { return chave; };

  if (!modalOverlay) return;

  const anexoProva = (typeof window.criarUploadAnexo === 'function')
    ? window.criarUploadAnexo({
        radios: document.querySelectorAll('input[name="tipoFicheiro"]'),
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
        chaveTextoPdf: "dzPdfTexto",
        chaveTextoFotos: "dzFotosAjuda",
      })
    : { resetar: function() {} };
  window.anexoProva = anexoProva;

  function validarFormulario() {
    let valido = true;

    const nome = inputNome ? inputNome.value.trim() : "";
    const numero = inputNumero ? inputNumero.value.trim() : "";

    if (nome.length < 2) {
      if (typeof window.mostrarErro === 'function') window.mostrarErro("nome", t("erroNome"));
      if (inputNome) inputNome.classList.add("invalido");
      valido = false;
    } else {
      if (typeof window.limparErro === 'function') window.limparErro("nome");
      if (inputNome) inputNome.classList.remove("invalido");
    }

    if (numero.length < 1) {
      if (typeof window.mostrarErro === 'function') window.mostrarErro("numero", t("erroNumero"));
      if (inputNumero) inputNumero.classList.add("invalido");
      valido = false;
    } else {
      if (typeof window.limparErro === 'function') window.limparErro("numero");
      if (inputNumero) inputNumero.classList.remove("invalido");
    }

    if (anexoProva && anexoProva.estado) {
      if (anexoProva.estado.tipo === "pdf" && !anexoProva.estado.pdf) {
        if (typeof window.mostrarErro === 'function') window.mostrarErro("ficheiro", t("erroAnexarPdf"));
        valido = false;
      } else if (anexoProva.estado.tipo === "foto" && anexoProva.estado.fotos.length === 0) {
        if (typeof window.mostrarErro === 'function') window.mostrarErro("ficheiro", t("erroAnexarFoto"));
        valido = false;
      } else {
        if (typeof window.limparErro === 'function') window.limparErro("ficheiro");
      }
    }

    return valido;
  }

  window.validarFormulario = validarFormulario;

  function abrirModal() {
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (inputNome) inputNome.focus();
  }

  function fecharModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = "";
    limparFormulario();
  }

  function limparFormulario() {
    if (formProva) formProva.reset();
    if (anexoProva && anexoProva.resetar) anexoProva.resetar();
    ["nome", "numero", "ficheiro"].forEach(window.limparErro || function() {});
    if (inputNome) inputNome.classList.remove("invalido");
    if (inputNumero) inputNumero.classList.remove("invalido");
  }

  function abrirModalConformeModo() {
    if (modoAtual === "lote") {
      const abrirModalLote = window.abrirModalLote || function() {};
      abrirModalLote();
    } else {
      abrirModal();
    }
  }

  if (btnAbrirTopo) btnAbrirTopo.addEventListener("click", abrirModalConformeModo);
  if (btnAbrirHero) btnAbrirHero.addEventListener("click", abrirModalConformeModo);
  if (btnFecharModal) btnFecharModal.addEventListener("click", fecharModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) fecharModal();
  });

  // Form submit
  if (formProva) {
    formProva.addEventListener("submit", function(e) {
      e.preventDefault();
      const validarFormulario = window.validarFormulario || function() { return true; };
      if (!validarFormulario()) return;

      const prova = {
        id: Date.now() + "-" + (window.proximoId ? window.proximoId() : Date.now()),
        nome: inputNome ? inputNome.value.trim() : "",
        numero: inputNumero ? inputNumero.value.trim() : "",
        tipo: (anexoProva && anexoProva.estado) ? anexoProva.estado.tipo : "pdf",
        ficheiros: (anexoProva && anexoProva.estado) ?
          (anexoProva.estado.tipo === "pdf" ? [anexoProva.estado.pdf] : [...anexoProva.estado.fotos]) : [],
        estadoAnalise: "analise",
        nota: null,
        loteId: null,
      };

      if (typeof window.adicionarProvaNaFila === 'function') window.adicionarProvaNaFila(prova);
      fecharModal();
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast("Prova de " + prova.nome + " enviada para análise.");
      }
      if (typeof window.corrigirProvaNoServidor === 'function') window.corrigirProvaNoServidor(prova);
    });
  }

  window.abrirModalSimples = abrirModal;
  window.fecharModalSimples = fecharModal;
}

function iniciarModalLote() {
  const modalLoteOverlay = document.getElementById("modalLoteOverlay");
  const btnFecharModalLote = document.getElementById("btnFecharModalLote");
  const btnAdicionarAluno = document.getElementById("btnAdicionarAluno");
  const btnEnviarLote = document.getElementById("btnEnviarLote");
  const loteLista = document.getElementById("loteLista");
  const t = window.t || function(chave) { return chave; };

  if (!modalLoteOverlay) return;

  function abrirModalLote() {
    if (loteLista) loteLista.innerHTML = "";
    window.linhasLote = [];
    if (typeof window.limparErro === 'function') window.limparErro("lote");
    if (typeof window.criarLinhaLote === 'function') window.criarLinhaLote();
    modalLoteOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function fecharModalLote() {
    modalLoteOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  if (btnFecharModalLote) btnFecharModalLote.addEventListener("click", fecharModalLote);

  modalLoteOverlay.addEventListener("click", (e) => {
    if (e.target === modalLoteOverlay) fecharModalLote();
  });

  if (btnAdicionarAluno) {
    btnAdicionarAluno.addEventListener("click", function() {
      if (typeof window.criarLinhaLote === 'function') window.criarLinhaLote();
    });
  }

  if (btnEnviarLote) {
    btnEnviarLote.addEventListener("click", function() {
      const linhasLote = window.linhasLote || [];
      if (linhasLote.length === 0) {
        if (typeof window.mostrarErro === 'function') {
          window.mostrarErro("lote", t("erroLoteVazio"));
        }
        return;
      }

      let valido = true;
      const provasParaEnviar = [];

      linhasLote.forEach((linha) => {
        const inputNomeLote = linha.elemento.querySelector(".lote-nome");
        const inputNumeroLote = linha.elemento.querySelector(".lote-numero");
        const nome = inputNomeLote ? inputNomeLote.value.trim() : "";
        const numero = inputNumeroLote ? inputNumeroLote.value.trim() : "";

        if (nome.length < 2 && typeof window.mostrarErro === 'function') {
          window.mostrarErro(`nomeLote${linha.id}`, t("erroNome"));
          valido = false;
        }
        if (numero.length < 1 && typeof window.mostrarErro === 'function') {
          window.mostrarErro(`numeroLote${linha.id}`, t("erroNumero"));
          valido = false;
        }

        if (nome.length >= 2 && numero.length >= 1) {
          provasParaEnviar.push({
            id: Date.now() + "-" + (window.proximoId ? window.proximoId() : Date.now()),
            nome,
            numero,
            tipo: linha.anexo.estado.tipo,
            ficheiros: linha.anexo.estado.tipo === "pdf" ? [linha.anexo.estado.pdf] : [...linha.anexo.estado.fotos],
            estadoAnalise: "analise",
            nota: null,
            loteId: null,
          });
        }
      });

      if (!valido) return;
      if (typeof window.limparErro === 'function') window.limparErro("lote");

      const loteId = "lote-" + Date.now();
      provasParaEnviar.forEach((p) => (p.loteId = loteId));

      if (window.lotesEmAndamento) {
        window.lotesEmAndamento.set(loteId, {
          total: provasParaEnviar.length,
          restantes: provasParaEnviar.length,
          provas: provasParaEnviar,
        });
      }

      provasParaEnviar.forEach((prova) => {
        if (typeof window.adicionarProvaNaFila === 'function') window.adicionarProvaNaFila(prova);
        if (typeof window.corrigirProvaNoServidor === 'function') {
          window.corrigirProvaNoServidor(prova, () => {
            if (typeof window.aoProvaDoLoteConcluir === 'function') {
              window.aoProvaDoLoteConcluir(loteId);
            }
          });
        }
      });

      fecharModalLote();
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast(t("toastLoteEnviado", { n: provasParaEnviar.length }));
      }
    });
  }

  // Relatório
  const modalRelatorioOverlay = document.getElementById("modalRelatorioOverlay");
  const btnFecharRelatorio = document.getElementById("btnFecharRelatorio");
  const btnExportarLote = document.getElementById("btnExportarLote");

  if (btnFecharRelatorio) {
    btnFecharRelatorio.addEventListener("click", function() {
      if (modalRelatorioOverlay) modalRelatorioOverlay.hidden = true;
      document.body.style.overflow = "";
    });
  }

  if (modalRelatorioOverlay) {
    modalRelatorioOverlay.addEventListener("click", (e) => {
      if (e.target === modalRelatorioOverlay) {
        modalRelatorioOverlay.hidden = true;
        document.body.style.overflow = "";
      }
    });
  }

  if (btnExportarLote) {
    btnExportarLote.addEventListener("click", function() {
      const provas = window.ultimoRelatorioProvas || [];
      if (!provas.length) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast(t("toastSemProvasExportar"));
        }
        return;
      }

      const config = window.getConfiguracao ? window.getConfiguracao() : { notaMax: 20 };
      const linhas = [[t("csvNome"), t("csvNumero"), t("csvNota"), t("csvNotaMax"), t("csvPercentagem")]];

      provas.forEach((p) => {
        const percentagem = config.notaMax > 0 ? Math.round((p.nota / config.notaMax) * 1000) / 10 : 0;
        linhas.push([p.nome, p.numero, p.nota, config.notaMax, percentagem]);
      });

      if (typeof window.baixarCsv === 'function') {
        window.baixarCsv(linhas, `relatorio-lote-corretoria-${Date.now()}.csv`);
      }
    });
  }

  window.abrirModalLote = abrirModalLote;
  window.fecharModalLote = fecharModalLote;
}
