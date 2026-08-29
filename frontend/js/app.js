/* ============================================================
   CorretorIA — Lógica do frontend (JavaScript puro)
   - Modal de carregamento de provas (PDF, foto da galeria, foto na hora)
   - Upload da chave de correção (gabarito) em Configurações
   - Correção simples e Correção em lote (várias provas + relatório)
   - Fila de provas + simulação de correção com IA
   - Painéis laterais: Chat e Configurações
   - Tema claro/escuro e idioma PT/EN
   ============================================================ */

"use strict";

/* ============================================================
   TRADUÇÕES (PT / EN)
   ============================================================ */

const TRADUCOES = {
  pt: {
    headerChatAria: "Abrir chat com a IA",
    headerChatTitle: "Chat com a IA",
    headerConfigAria: "Abrir configurações",
    headerConfigTitle: "Configurações",
    headerNovaProva: "+ Nova prova",
    temaAtivarClaro: "Activar modo claro",
    temaAtivarEscuro: "Activar modo escuro",
    temaClaro: "Modo claro",
    temaEscuro: "Modo escuro",

    heroTag: "Correção automática com IA",
    heroTituloHtml: "Corrige provas em <em>segundos</em>,<br />não em horas.",
    heroParagrafoHtml:
      "Carrega a prova do estudante em <strong>PDF</strong> ou em <strong>fotos</strong> (uma por página) e a nossa IA analisa, corrige e atribui a nota automaticamente.",
    heroBotaoSimples: "Carregar prova para correção",
    heroBotaoLote: "Carregar provas em lote",
    passo1: "Carrega a prova",
    passo2: "A IA corrige",
    passo3: "Recebe a nota",

    modoSimples: "🧾 Correção simples",
    modoLote: "📚 Correção em lote",

    filaTitulo: "Provas em análise",
    filaExportar: "⬇ Exportar tudo (CSV)",
    cardExportar: "⬇ Exportar CSV",
    provaMeta: "Nº {numero} · {n} ficheiro(s)",
    estadoAnalise: "A analisar…",
    estadoNota: "Nota: {nota} / {max}",

    rodapeSlogan: "Correção de provas com Inteligência Artificial.",
    rodapeSobre: "Sobre",
    rodapeTermos: "Termos de Uso",
    rodapePrivacidade: "Política de Privacidade",
    rodapeContacto: "Contacto / Suporte",
    rodapeVersao: "Versão 1.0.0",
    rodapeAviso: "As notas geradas por IA são sugestões e devem ser revistas pelo professor.",

    modalTitulo: "Carregar prova",
    modalSub: "Preenche os dados do estudante e anexa a prova.",
    labelNome: "Nome do estudante",
    placeholderNome: "Ex.: Bruno Sebastião",
    labelNumero: "Número de estudante",
    placeholderNumero: "Ex.: 2026-0042",
    labelFormato: "Formato da prova",
    optPdf: "📄 PDF",
    optFoto: "📷 Fotos",
    dzPdfTexto: "Arrasta o PDF aqui ou <u>clica para escolher</u>",
    dzPdfAjuda: "1 ficheiro PDF",
    dzPdfSelecionado: "✅ <strong>{nome}</strong>",
    dzPdfTrocar: "{tamanho} — clica para trocar",
    dzFotosCarregar: "Carregar fotos",
    dzFotosGaleria: "Escolher da galeria",
    dzFotosTirar: "Tirar foto",
    dzFotosCamera: "Abrir câmera",
    dzFotosAjuda: "Várias fotos — uma por página da prova",
    dzFotosContagem: "{n} página(s) adicionada(s) — clica para adicionar mais",
    btnEnviar: "Enviar para correção",

    dzChavePdfTexto: "Arrasta o PDF da chave aqui ou <u>clica para escolher</u>",
    dzChaveFotosAjuda: "Várias fotos — uma por página da chave",

    loteTitulo: "Correção em lote",
    loteSub:
      "Adiciona as provas de vários estudantes. A IA corrige todas de uma vez e gera um relatório com a média percentual.",
    loteAdicionar: "+ Adicionar estudante",
    loteRemoverAluno: "Remover",
    loteEnviar: "Enviar lote para correção",
    loteAlunoTitulo: "Estudante {n}",
    erroLoteVazio: "Adiciona pelo menos um estudante ao lote.",

    relatorioTitulo: "Relatório do lote",
    relColNome: "Nome",
    relColNumero: "Número",
    relColNota: "Nota",
    relColPercentagem: "Percentagem",
    relatorioExportar: "⬇ Exportar relatório (CSV)",
    relatorioSubTexto: "{n} prova(s) corrigida(s) nesta correção em lote.",
    relatorioMedia: "Média percentual da turma: {valor}%",
    relatorioMediaSub: "Baseado em {n} prova(s) corrigida(s).",

    configTitulo: "⚙️ Configurações",
    rigorLabel: "Nível de rigorosidade",
    rigorFlexivel: "Flexível — valoriza o raciocínio",
    rigorEquilibrado: "Equilibrado — padrão",
    rigorRigoroso: "Rigoroso — exige precisão",
    rigorMuitoRigoroso: "Muito rigoroso — sem margem",
    toleranciaLabel: "Tolerância a erros ortográficos:",
    notaMaxLabel: "Nota máxima",
    metricasTitulo: "Métricas avaliadas",
    metricaConteudo: "Correção do conteúdo",
    metricaRaciocinio: "Raciocínio e método",
    metricaOrganizacao: "Organização e estrutura",
    metricaOrtografia: "Ortografia e gramática",
    metricaCaligrafia: "Legibilidade da caligrafia",
    criteriosLabel: "Critérios adicionais para a IA",
    criteriosPlaceholder: "Ex.: penalizar respostas sem justificação.",
    chaveTitulo: "Chave de correção (gabarito) — opcional",
    chaveAjuda:
      "Carrega o gabarito para a IA comparar as respostas. Aceita PDF, foto da galeria ou foto tirada na hora.",
    chaveRemover: "Remover chave",
    btnGuardar: "Guardar configurações",

    chatTitulo: "💬 Assistente IA",
    chatFecharAria: "Ocultar chat",
    chatAbrirAria: "Mostrar chat",
    chatMsgInicial: "Olá! Posso ajudar-te a definir critérios, explicar notas ou rever correções. O que precisas?",
    chatPlaceholder: "Escreve a tua mensagem…",
    chatRespostaRigor:
      'Atualmente o rigor está definido como "{rigor}" e a nota máxima é {max}. Podes ajustar isso em Configurações.',
    chatRespostaChaveSim:
      "Já existe uma chave de correção carregada nas Configurações. A IA vai usá-la como referência ao corrigir.",
    chatRespostaChaveNao:
      "Ainda não carregaste uma chave de correção. Vai a Configurações → Chave de correção para anexares o gabarito (PDF ou foto).",
    chatRespostaGenerica:
      "Entendido! Posso ajudar-te a ajustar critérios de correção, explicar notas ou rever a chave de correção. O que precisas exatamente?",

    toastProvaEnviada: "Prova de {nome} enviada para análise.",
    toastCorrecaoConcluida: "✅ Correção concluída: {nome} obteve {nota}/{max}.",
    toastSemCameraSuporte: "O teu navegador não suporta acesso à câmera.",
    toastFotoCapturada: "📸 Foto capturada com sucesso!",
    toastFotosCapturadas: "📸 {n} foto(s) capturada(s) com sucesso!",
    toastNenhumaImagemValida: "Nenhuma imagem válida capturada.",
    toastCameraErro: "Não foi possível abrir a câmera. Verifica as permissões.",
    toastChaveRemovida: "Chave de correção removida.",
    toastConfigGuardada: "Configurações guardadas com sucesso.",
    toastSemProvasExportar: "Não há provas concluídas para exportar.",
    toastSemProvasCorrigidas: "Ainda não há provas corrigidas para exportar.",
    toastLoteEnviado: "Lote com {n} prova(s) enviado para correção.",
    toastLoteConcluido: "✅ Lote concluído! Relatório disponível.",

    erroApenasPdf: "Apenas ficheiros PDF são aceites.",
    erroAlgunsIgnorados: "Alguns ficheiros foram ignorados: apenas imagens são aceites.",
    erroNome: "Indica o nome completo do estudante.",
    erroNumero: "Indica o número de estudante.",
    erroAnexarPdf: "Anexa o PDF da prova.",
    erroAnexarFoto: "Anexa pelo menos uma foto da prova.",

    csvNome: "Nome",
    csvNumero: "Número",
    csvTipo: "Tipo",
    csvNota: "Nota",
    csvNotaMax: "Nota Máxima",
    csvEstado: "Estado",
    csvPercentagem: "Percentagem",
    estadoAnaliseLabel: "Em análise",
    estadoConcluidoLabel: "Concluído",
  },

  en: {
    headerChatAria: "Open AI chat",
    headerChatTitle: "AI chat",
    headerConfigAria: "Open settings",
    headerConfigTitle: "Settings",
    headerNovaProva: "+ New exam",
    temaAtivarClaro: "Switch to light mode",
    temaAtivarEscuro: "Switch to dark mode",
    temaClaro: "Light mode",
    temaEscuro: "Dark mode",

    heroTag: "Automatic AI grading",
    heroTituloHtml: "Grade exams in <em>seconds</em>,<br />not hours.",
    heroParagrafoHtml:
      "Upload the student's exam as a <strong>PDF</strong> or as <strong>photos</strong> (one per page) and our AI analyses, grades and assigns the score automatically.",
    heroBotaoSimples: "Upload exam for grading",
    heroBotaoLote: "Upload exams in batch",
    passo1: "Upload the exam",
    passo2: "AI grades it",
    passo3: "Get the score",

    modoSimples: "🧾 Single grading",
    modoLote: "📚 Batch grading",

    filaTitulo: "Exams being analysed",
    filaExportar: "⬇ Export all (CSV)",
    cardExportar: "⬇ Export CSV",
    provaMeta: "No. {numero} · {n} file(s)",
    estadoAnalise: "Analysing…",
    estadoNota: "Score: {nota} / {max}",

    rodapeSlogan: "Exam grading powered by Artificial Intelligence.",
    rodapeSobre: "About",
    rodapeTermos: "Terms of Use",
    rodapePrivacidade: "Privacy Policy",
    rodapeContacto: "Contact / Support",
    rodapeVersao: "Version 1.0.0",
    rodapeAviso: "AI-generated scores are suggestions and should be reviewed by the teacher.",

    modalTitulo: "Upload exam",
    modalSub: "Fill in the student's details and attach the exam.",
    labelNome: "Student name",
    placeholderNome: "E.g.: John Smith",
    labelNumero: "Student ID",
    placeholderNumero: "E.g.: 2026-0042",
    labelFormato: "Exam format",
    optPdf: "📄 PDF",
    optFoto: "📷 Photos",
    dzPdfTexto: "Drag the PDF here or <u>click to choose</u>",
    dzPdfAjuda: "1 PDF file",
    dzPdfSelecionado: "✅ <strong>{nome}</strong>",
    dzPdfTrocar: "{tamanho} — click to change",
    dzFotosCarregar: "Upload photos",
    dzFotosGaleria: "Choose from gallery",
    dzFotosTirar: "Take photo",
    dzFotosCamera: "Open camera",
    dzFotosAjuda: "Multiple photos — one per exam page",
    dzFotosContagem: "{n} page(s) added — click to add more",
    btnEnviar: "Submit for grading",

    dzChavePdfTexto: "Drag the answer key PDF here or <u>click to choose</u>",
    dzChaveFotosAjuda: "Multiple photos — one per answer key page",

    loteTitulo: "Batch grading",
    loteSub:
      "Add exams from multiple students. The AI grades them all at once and generates a report with the percentage average.",
    loteAdicionar: "+ Add student",
    loteRemoverAluno: "Remove",
    loteEnviar: "Submit batch for grading",
    loteAlunoTitulo: "Student {n}",
    erroLoteVazio: "Add at least one student to the batch.",

    relatorioTitulo: "Batch report",
    relColNome: "Name",
    relColNumero: "ID",
    relColNota: "Score",
    relColPercentagem: "Percentage",
    relatorioExportar: "⬇ Export report (CSV)",
    relatorioSubTexto: "{n} exam(s) graded in this batch correction.",
    relatorioMedia: "Class percentage average: {valor}%",
    relatorioMediaSub: "Based on {n} graded exam(s).",

    configTitulo: "⚙️ Settings",
    rigorLabel: "Strictness level",
    rigorFlexivel: "Flexible — values reasoning",
    rigorEquilibrado: "Balanced — default",
    rigorRigoroso: "Strict — requires precision",
    rigorMuitoRigoroso: "Very strict — no margin",
    toleranciaLabel: "Tolerance for spelling errors:",
    notaMaxLabel: "Maximum score",
    metricasTitulo: "Metrics evaluated",
    metricaConteudo: "Content accuracy",
    metricaRaciocinio: "Reasoning and method",
    metricaOrganizacao: "Organisation and structure",
    metricaOrtografia: "Spelling and grammar",
    metricaCaligrafia: "Handwriting legibility",
    criteriosLabel: "Additional criteria for the AI",
    criteriosPlaceholder: "E.g.: penalise answers without justification.",
    chaveTitulo: "Answer key — optional",
    chaveAjuda:
      "Upload the answer key for the AI to compare answers against. Accepts PDF, a gallery photo, or a photo taken now.",
    chaveRemover: "Remove key",
    btnGuardar: "Save settings",

    chatTitulo: "💬 AI Assistant",
    chatFecharAria: "Hide chat",
    chatAbrirAria: "Show chat",
    chatMsgInicial: "Hi! I can help you set criteria, explain scores or review corrections. What do you need?",
    chatPlaceholder: "Type your message…",
    chatRespostaRigor:
      'The strictness is currently set to "{rigor}" and the maximum score is {max}. You can adjust this in Settings.',
    chatRespostaChaveSim:
      "An answer key is already uploaded in Settings. The AI will use it as a reference when grading.",
    chatRespostaChaveNao:
      "You haven't uploaded an answer key yet. Go to Settings → Answer key to attach it (PDF or photo).",
    chatRespostaGenerica:
      "Got it! I can help you adjust grading criteria, explain scores, or review the answer key. What exactly do you need?",

    toastProvaEnviada: "{nome}'s exam was submitted for grading.",
    toastCorrecaoConcluida: "✅ Grading complete: {nome} scored {nota}/{max}.",
    toastSemCameraSuporte: "Your browser doesn't support camera access.",
    toastFotoCapturada: "📸 Photo captured successfully!",
    toastFotosCapturadas: "📸 {n} photo(s) captured successfully!",
    toastNenhumaImagemValida: "No valid image was captured.",
    toastCameraErro: "Could not open the camera. Check your permissions.",
    toastChaveRemovida: "Answer key removed.",
    toastConfigGuardada: "Settings saved successfully.",
    toastSemProvasExportar: "There are no completed exams to export.",
    toastSemProvasCorrigidas: "There are no graded exams yet to export.",
    toastLoteEnviado: "Batch with {n} exam(s) submitted for grading.",
    toastLoteConcluido: "✅ Batch complete! Report available.",

    erroApenasPdf: "Only PDF files are accepted.",
    erroAlgunsIgnorados: "Some files were ignored: only images are accepted.",
    erroNome: "Enter the student's full name.",
    erroNumero: "Enter the student ID.",
    erroAnexarPdf: "Attach the exam PDF.",
    erroAnexarFoto: "Attach at least one photo of the exam.",

    csvNome: "Name",
    csvNumero: "ID",
    csvTipo: "Type",
    csvNota: "Score",
    csvNotaMax: "Max Score",
    csvEstado: "Status",
    csvPercentagem: "Percentage",
    estadoAnaliseLabel: "In analysis",
    estadoConcluidoLabel: "Completed",
  },
};

const CHAVE_IDIOMA = "corretoria_idioma";
let idiomaAtual = "pt";

function t(chave, vars) {
  const dicionario = TRADUCOES[idiomaAtual] || TRADUCOES.pt;
  let texto = dicionario[chave] != null ? dicionario[chave] : TRADUCOES.pt[chave] || chave;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      texto = texto.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return texto;
}

function aplicarTraducoes() {
  document.documentElement.lang = idiomaAtual === "en" ? "en" : "pt-BR";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const chave = el.getAttribute("data-i18n");
    const valor = t(chave);
    if (el.hasAttribute("data-i18n-html")) {
      el.innerHTML = valor;
    } else {
      el.textContent = valor;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });

  const btnIdioma = document.getElementById("btnIdioma");
  if (btnIdioma) {
    if (idiomaAtual === "pt") {
      btnIdioma.textContent = "🌐 EN";
      btnIdioma.title = "Switch to English";
      btnIdioma.setAttribute("aria-label", "Switch to English");
    } else {
      btnIdioma.textContent = "🌐 PT";
      btnIdioma.title = "Mudar para português";
      btnIdioma.setAttribute("aria-label", "Mudar para português");
    }
  }
}

function iniciarIdioma() {
  try {
    const guardado = localStorage.getItem(CHAVE_IDIOMA);
    if (guardado === "pt" || guardado === "en") idiomaAtual = guardado;
  } catch (e) {
    /* localStorage indisponível — mantém o padrão */
  }
}

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

let contadorIds = 0;
function proximoId() {
  contadorIds += 1;
  return contadorIds;
}

/* ============================================================
   MÓDULO REUTILIZÁVEL DE UPLOAD DE ANEXO
   (usado na prova simples, na chave de correção e em cada
   linha da correção em lote — evita duplicar a lógica)
   ============================================================ */

function criarUploadAnexo(cfg) {
  const estado = { tipo: "pdf", pdf: null, fotos: [] };

  const {
    radios, // NodeList de <input type=radio>
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
    chaveTextoPdf = "dzPdfTexto",
    chaveTextoFotos = "dzFotosAjuda",
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

  /* ---------- textos da dropzone (sempre no idioma atual) ---------- */
  function resetarTextoPdf() {
    if (dropzoneTextoPdf) dropzoneTextoPdf.innerHTML = t(chaveTextoPdf);
    if (dropzoneAjudaPdf) dropzoneAjudaPdf.textContent = t("dzPdfAjuda");
  }

  function resetarTextoFotos() {
    if (dropzoneAjudaFotos) dropzoneAjudaFotos.textContent = t(chaveTextoFotos);
  }

  /* ---------- adicionar ficheiros (PDF ou fotos) ---------- */
  function adicionarFicheiros(fileList) {
    const ficheiros = Array.from(fileList || []);
    if (ficheiros.length === 0) return;
    limparErroCampo();

    if (estado.tipo === "pdf") {
      const ficheiro = ficheiros[0];
      if (ficheiro.type !== "application/pdf") {
        mostrarErroCampo(t("erroApenasPdf"));
        return;
      }
      estado.pdf = ficheiro;
      if (dropzoneTextoPdf) {
        dropzoneTextoPdf.innerHTML = t("dzPdfSelecionado", { nome: escaparHtml(ficheiro.name) });
      }
      if (dropzoneAjudaPdf) {
        dropzoneAjudaPdf.textContent = t("dzPdfTrocar", { tamanho: formatarTamanho(ficheiro.size) });
      }
    } else {
      const imagens = ficheiros.filter((f) => f.type.startsWith("image/"));
      if (imagens.length !== ficheiros.length) {
        mostrarErroCampo(t("erroAlgunsIgnorados"));
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
      img.alt = `${indice + 1}`;
      img.onload = () => URL.revokeObjectURL(img.src);

      const btnRemover = document.createElement("button");
      btnRemover.type = "button";
      btnRemover.className = "preview-fotos__remover";
      btnRemover.textContent = "✕";
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
      dropzoneAjudaFotos.textContent = t("dzFotosContagem", { n: estado.fotos.length });
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
    this.value = ""; // permite escolher o mesmo ficheiro outra vez
  });

  /* ---------- input de câmera (dispositivos móveis) ---------- */
  inputCamera.addEventListener("change", function () {
    const ficheiros = Array.from(this.files || []);
    this.value = ""; // permite tirar outra foto imediatamente

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

/* ============================================================
   CÂMERA NO DESKTOP (getUserMedia)
   ============================================================ */
function abrirCameraDesktop(aoCapturar) {
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

/* ============================================================
   ESTADO GLOBAL DA CONFIGURAÇÃO / CHAVE DE CORREÇÃO
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
  iniciarIdioma();
  carregarConfiguracaoLocal();
  aplicarTraducoes();

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
  const btnIdioma = document.getElementById("btnIdioma");

  const chaveAcoes = document.getElementById("chaveAcoes");
  const chaveResumo = document.getElementById("chaveResumo");
  const btnRemoverChave = document.getElementById("btnRemoverChave");

  const btnModoSimples = document.getElementById("btnModoSimples");
  const btnModoLote = document.getElementById("btnModoLote");
  const textoBotaoHero = document.getElementById("textoBotaoHero");

  const modalLoteOverlay = document.getElementById("modalLoteOverlay");
  const btnFecharModalLote = document.getElementById("btnFecharModalLote");
  const loteLista = document.getElementById("loteLista");
  const btnAdicionarAluno = document.getElementById("btnAdicionarAluno");
  const btnEnviarLote = document.getElementById("btnEnviarLote");

  const modalRelatorioOverlay = document.getElementById("modalRelatorioOverlay");
  const btnFecharRelatorio = document.getElementById("btnFecharRelatorio");
  const relatorioSub = document.getElementById("relatorioSub");
  const relatorioCorpo = document.getElementById("relatorioCorpo");
  const relatorioResumo = document.getElementById("relatorioResumo");
  const btnExportarLote = document.getElementById("btnExportarLote");

  const rodapeAno = document.getElementById("rodapeAno");

  if (rodapeAno) rodapeAno.textContent = String(new Date().getFullYear());

  /* ============================================================
     UPLOAD DA PROVA (modal "+ Nova prova")
     ============================================================ */
  const anexoProva = criarUploadAnexo({
    radios: formProva.tipoFicheiro,
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
    chaveTextoPdf: "dzChavePdfTexto",
    chaveTextoFotos: "dzChaveFotosAjuda",
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
      mostrarToast(t("toastChaveRemovida"));
    });
  }

  atualizarResumoChave();

  /* ============================================================
     MODO: CORREÇÃO SIMPLES vs CORREÇÃO EM LOTE
     ============================================================ */
  let modoAtual = "simples";

  function definirModo(modo) {
    modoAtual = modo;
    btnModoSimples.classList.toggle("ativo", modo === "simples");
    btnModoLote.classList.toggle("ativo", modo === "lote");
    if (textoBotaoHero) {
      textoBotaoHero.setAttribute("data-i18n", modo === "simples" ? "heroBotaoSimples" : "heroBotaoLote");
      textoBotaoHero.textContent = modo === "simples" ? t("heroBotaoSimples") : t("heroBotaoLote");
    }
  }

  btnModoSimples.addEventListener("click", () => definirModo("simples"));
  btnModoLote.addEventListener("click", () => definirModo("lote"));

  function abrirModalConformeModo() {
    if (modoAtual === "lote") abrirModalLote();
    else abrirModal();
  }

  /* ============================================================
     MODAL DE NOVA PROVA (CORREÇÃO SIMPLES)
     ============================================================ */
  function abrirModal() {
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    inputNome.focus();
  }

  function fecharModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = "";
    limparFormulario();
  }

  function limparFormulario() {
    formProva.reset();
    anexoProva.resetar();
    ["nome", "numero", "ficheiro"].forEach(limparErro);
    inputNome.classList.remove("invalido");
    inputNumero.classList.remove("invalido");
  }

  btnAbrirTopo.addEventListener("click", abrirModalConformeModo);
  btnAbrirHero.addEventListener("click", abrirModalConformeModo);
  btnFecharModal.addEventListener("click", fecharModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) fecharModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!modalOverlay.hidden) {
      fecharModal();
      return;
    }
    if (!modalLoteOverlay.hidden) {
      fecharModalLote();
      return;
    }
    if (!modalRelatorioOverlay.hidden) {
      fecharRelatorio();
      return;
    }
    if (painelConfig.classList.contains("aberto") || painelChat.classList.contains("aberto")) {
      fecharPaineis();
    }
  });

  /* ---------- validação e envio (correção simples) ---------- */
  function validarFormulario() {
    let valido = true;

    const nome = inputNome.value.trim();
    if (nome.length < 2) {
      mostrarErro("nome", t("erroNome"));
      inputNome.classList.add("invalido");
      valido = false;
    } else {
      limparErro("nome");
      inputNome.classList.remove("invalido");
    }

    const numero = inputNumero.value.trim();
    if (numero.length < 1) {
      mostrarErro("numero", t("erroNumero"));
      inputNumero.classList.add("invalido");
      valido = false;
    } else {
      limparErro("numero");
      inputNumero.classList.remove("invalido");
    }

    if (anexoProva.estado.tipo === "pdf" && !anexoProva.estado.pdf) {
      mostrarErro("ficheiro", t("erroAnexarPdf"));
      valido = false;
    }
    if (anexoProva.estado.tipo === "foto" && anexoProva.estado.fotos.length === 0) {
      mostrarErro("ficheiro", t("erroAnexarFoto"));
      valido = false;
    }

    return valido;
  }

  formProva.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const prova = {
      id: Date.now() + "-" + proximoId(),
      nome: inputNome.value.trim(),
      numero: inputNumero.value.trim(),
      tipo: anexoProva.estado.tipo,
      ficheiros:
        anexoProva.estado.tipo === "pdf"
          ? [anexoProva.estado.pdf]
          : [...anexoProva.estado.fotos],
      estadoAnalise: "analise",
      nota: null,
      loteId: null,
    };

    adicionarProvaNaFila(prova);
    fecharModal();
    mostrarToast(t("toastProvaEnviada", { nome: escaparHtml(prova.nome) }));
    simularCorrecaoIA(prova);
  });

  /* ============================================================
     FILA DE PROVAS
     ============================================================ */
  function adicionarProvaNaFila(prova) {
    secFila.hidden = false;

    const card = document.createElement("div");
    card.className = "prova-card";
    card.id = `prova-${prova.id}`;

    const icone = prova.tipo === "pdf" ? "📄" : "📷";

    card.innerHTML = `
      <div class="prova-card__icone">${icone}</div>
      <div class="prova-card__info">
        <div class="prova-card__nome">${escaparHtml(prova.nome)}</div>
        <div class="prova-card__meta">${t("provaMeta", {
          numero: escaparHtml(prova.numero),
          n: prova.ficheiros.length,
        })}</div>
      </div>
      <div class="prova-card__estado estado--analise" data-estado>${t("estadoAnalise")}</div>
    `;

    listaProvas.prepend(card);
  }

  function atualizarProvaNaFila(prova) {
    const card = document.getElementById(`prova-${prova.id}`);
    if (!card) return;

    const estadoEl = card.querySelector("[data-estado]");
    if (!estadoEl) return;

    estadoEl.classList.remove("estado--analise");
    estadoEl.classList.add("estado--concluido");
    estadoEl.textContent = t("estadoNota", { nota: prova.nota, max: configuracao.notaMax });

    if (!card.querySelector(".prova-card__acoes")) {
      const acoes = document.createElement("div");
      acoes.className = "prova-card__acoes";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--pequeno";
      btn.textContent = t("cardExportar");
      btn.addEventListener("click", () => exportarProvasParaCsv([prova]));
      acoes.appendChild(btn);
      card.appendChild(acoes);
    }
  }

  /* ============================================================
     SIMULAÇÃO DE CORREÇÃO COM IA
     (ponto de integração com o backend/IA real)
     ============================================================ */
  const provasPorId = new Map();

  function simularCorrecaoIA(prova, aoConcluir) {
    provasPorId.set(prova.id, prova);

    const tempoBase = 1500 + Math.random() * 1500;

    setTimeout(() => {
      prova.nota = calcularNotaSimulada();
      prova.estadoAnalise = "concluido";
      atualizarProvaNaFila(prova);
      if (!prova.loteId) {
        mostrarToast(t("toastCorrecaoConcluida", { nome: escaparHtml(prova.nome), nota: prova.nota, max: configuracao.notaMax }));
      }
      if (aoConcluir) aoConcluir(prova);
    }, tempoBase);
  }

  function calcularNotaSimulada() {
    const rigorFactor =
      {
        flexivel: 0.9,
        equilibrado: 0.75,
        rigoroso: 0.6,
        "muito-rigoroso": 0.45,
      }[configuracao.rigor] ?? 0.75;

    const toleranciaBonus = (configuracao.tolerancia / 100) * 0.15;
    const base = rigorFactor + toleranciaBonus;
    const variacao = (Math.random() - 0.5) * 0.25;
    const fracao = Math.min(1, Math.max(0, base + variacao));

    return Math.round(fracao * configuracao.notaMax * 10) / 10;
  }

  /* ============================================================
     EXPORTAÇÃO CSV
     ============================================================ */
  function baixarCsv(linhas, nomeFicheiro) {
    const csv = linhas
      .map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeFicheiro;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportarProvasParaCsv(provas) {
    if (!provas.length) {
      mostrarToast(t("toastSemProvasExportar"));
      return;
    }

    const linhas = [[t("csvNome"), t("csvNumero"), t("csvTipo"), t("csvNota"), t("csvNotaMax"), t("csvEstado")]];
    provas.forEach((p) => {
      linhas.push([
        p.nome,
        p.numero,
        p.tipo,
        p.nota ?? "",
        configuracao.notaMax,
        p.estadoAnalise === "concluido" ? t("estadoConcluidoLabel") : t("estadoAnaliseLabel"),
      ]);
    });

    baixarCsv(linhas, `provas-corretoria-${Date.now()}.csv`);
  }

  if (btnExportarTudo) {
    btnExportarTudo.addEventListener("click", () => {
      const concluidas = Array.from(provasPorId.values()).filter((p) => p.estadoAnalise === "concluido");
      if (concluidas.length === 0) {
        mostrarToast(t("toastSemProvasCorrigidas"));
        return;
      }
      exportarProvasParaCsv(concluidas);
    });
  }

  /* ============================================================
     CORREÇÃO EM LOTE
     ============================================================ */
  let linhasLote = [];
  const lotesEmAndamento = new Map(); // loteId -> { total, restantes, provas }

  function criarLinhaLote() {
    const id = proximoId();
    const numero = linhasLote.length + 1;

    const wrapper = document.createElement("div");
    wrapper.className = "lote-linha";
    wrapper.dataset.linhaId = String(id);
    wrapper.innerHTML = `
      <div class="lote-linha__topo">
        <span class="lote-linha__titulo" data-i18n="loteAlunoTitulo">${t("loteAlunoTitulo", { n: numero })}</span>
        <button type="button" class="lote-linha__remover" data-i18n="loteRemoverAluno">${t("loteRemoverAluno")}</button>
      </div>

      <div class="lote-linha__campos">
        <div class="campo">
          <label data-i18n="labelNome">${t("labelNome")}</label>
          <input type="text" class="lote-nome" maxlength="100" placeholder="${t("placeholderNome")}" data-i18n-placeholder="placeholderNome" />
          <small class="campo__erro" data-erro="nomeLote${id}"></small>
        </div>
        <div class="campo">
          <label data-i18n="labelNumero">${t("labelNumero")}</label>
          <input type="text" class="lote-numero" maxlength="20" placeholder="${t("placeholderNumero")}" data-i18n-placeholder="placeholderNumero" />
          <small class="campo__erro" data-erro="numeroLote${id}"></small>
        </div>
      </div>

      <div class="campo">
        <span class="campo__rotulo" data-i18n="labelFormato">${t("labelFormato")}</span>
        <div class="tipo-toggle" role="radiogroup">
          <label class="tipo-toggle__opcao">
            <input type="radio" name="tipoFicheiroLote${id}" value="pdf" checked />
            <span data-i18n="optPdf">${t("optPdf")}</span>
          </label>
          <label class="tipo-toggle__opcao">
            <input type="radio" name="tipoFicheiroLote${id}" value="foto" />
            <span data-i18n="optFoto">${t("optFoto")}</span>
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
              <p><strong data-i18n="dzFotosCarregar">${t("dzFotosCarregar")}</strong></p>
              <small data-i18n="dzFotosGaleria">${t("dzFotosGaleria")}</small>
            </div>
            <div class="dropzone__opcao" id="opcaoCameraLote${id}">
              <span class="dropzone__icone">📷</span>
              <p><strong data-i18n="dzFotosTirar">${t("dzFotosTirar")}</strong></p>
              <small data-i18n="dzFotosCamera">${t("dzFotosCamera")}</small>
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
    linhasLote.forEach((linha, indice) => {
      const titulo = linha.elemento.querySelector(".lote-linha__titulo");
      if (titulo) titulo.textContent = t("loteAlunoTitulo", { n: indice + 1 });
    });
  }

  function abrirModalLote() {
    loteLista.innerHTML = "";
    linhasLote = [];
    limparErro("lote");
    criarLinhaLote();
    modalLoteOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function fecharModalLote() {
    modalLoteOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  btnFecharModalLote.addEventListener("click", fecharModalLote);
  modalLoteOverlay.addEventListener("click", (e) => {
    if (e.target === modalLoteOverlay) fecharModalLote();
  });

  btnAdicionarAluno.addEventListener("click", () => {
    criarLinhaLote();
  });

  btnEnviarLote.addEventListener("click", () => {
    if (linhasLote.length === 0) {
      mostrarErro("lote", t("erroLoteVazio"));
      return;
    }

    let valido = true;
    const provasParaEnviar = [];

    linhasLote.forEach((linha) => {
      const inputNomeLote = linha.elemento.querySelector(".lote-nome");
      const inputNumeroLote = linha.elemento.querySelector(".lote-numero");
      const nome = inputNomeLote.value.trim();
      const numero = inputNumeroLote.value.trim();

      if (nome.length < 2) {
        mostrarErro(`nomeLote${linha.id}`, t("erroNome"));
        valido = false;
      } else {
        limparErro(`nomeLote${linha.id}`);
      }

      if (numero.length < 1) {
        mostrarErro(`numeroLote${linha.id}`, t("erroNumero"));
        valido = false;
      } else {
        limparErro(`numeroLote${linha.id}`);
      }

      if (linha.anexo.estado.tipo === "pdf" && !linha.anexo.estado.pdf) {
        mostrarErro(`ficheiroLote${linha.id}`, t("erroAnexarPdf"));
        valido = false;
      }
      if (linha.anexo.estado.tipo === "foto" && linha.anexo.estado.fotos.length === 0) {
        mostrarErro(`ficheiroLote${linha.id}`, t("erroAnexarFoto"));
        valido = false;
      }

      if (nome.length >= 2 && numero.length >= 1) {
        provasParaEnviar.push({
          id: Date.now() + "-" + proximoId(),
          nome,
          numero,
          tipo: linha.anexo.estado.tipo,
          ficheiros:
            linha.anexo.estado.tipo === "pdf"
              ? [linha.anexo.estado.pdf]
              : [...linha.anexo.estado.fotos],
          estadoAnalise: "analise",
          nota: null,
          loteId: null,
        });
      }
    });

    if (!valido) return;

    limparErro("lote");

    const loteId = "lote-" + Date.now();
    provasParaEnviar.forEach((p) => (p.loteId = loteId));

    lotesEmAndamento.set(loteId, {
      total: provasParaEnviar.length,
      restantes: provasParaEnviar.length,
      provas: provasParaEnviar,
    });

    provasParaEnviar.forEach((prova) => {
      adicionarProvaNaFila(prova);
      simularCorrecaoIA(prova, () => aoProvaDoLoteConcluir(loteId));
    });

    fecharModalLote();
    mostrarToast(t("toastLoteEnviado", { n: provasParaEnviar.length }));
  });

  function aoProvaDoLoteConcluir(loteId) {
    const lote = lotesEmAndamento.get(loteId);
    if (!lote) return;
    lote.restantes -= 1;
    if (lote.restantes <= 0) {
      mostrarToast(t("toastLoteConcluido"));
      gerarRelatorioLote(lote.provas);
      lotesEmAndamento.delete(loteId);
    }
  }

  /* ============================================================
     RELATÓRIO DO LOTE
     ============================================================ */
  let ultimoRelatorioProvas = [];

  function gerarRelatorioLote(provas) {
    ultimoRelatorioProvas = provas;
    relatorioCorpo.innerHTML = "";

    let somaPercentagem = 0;

    provas.forEach((p) => {
      const percentagem = configuracao.notaMax > 0 ? Math.round((p.nota / configuracao.notaMax) * 1000) / 10 : 0;
      somaPercentagem += percentagem;

      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${escaparHtml(p.nome)}</td>
        <td>${escaparHtml(p.numero)}</td>
        <td>${p.nota} / ${configuracao.notaMax}</td>
        <td>${percentagem}%</td>
      `;
      relatorioCorpo.appendChild(linha);
    });

    const media = provas.length ? Math.round((somaPercentagem / provas.length) * 10) / 10 : 0;

    relatorioSub.textContent = t("relatorioSubTexto", { n: provas.length });
    relatorioResumo.innerHTML = `
      ${t("relatorioMedia", { valor: media })}
      <small>${t("relatorioMediaSub", { n: provas.length })}</small>
    `;

    modalRelatorioOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function fecharRelatorio() {
    modalRelatorioOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  btnFecharRelatorio.addEventListener("click", fecharRelatorio);
  modalRelatorioOverlay.addEventListener("click", (e) => {
    if (e.target === modalRelatorioOverlay) fecharRelatorio();
  });

  btnExportarLote.addEventListener("click", () => {
    if (!ultimoRelatorioProvas.length) {
      mostrarToast(t("toastSemProvasExportar"));
      return;
    }

    const linhas = [[t("csvNome"), t("csvNumero"), t("csvNota"), t("csvNotaMax"), t("csvPercentagem")]];
    ultimoRelatorioProvas.forEach((p) => {
      const percentagem = configuracao.notaMax > 0 ? Math.round((p.nota / configuracao.notaMax) * 1000) / 10 : 0;
      linhas.push([p.nome, p.numero, p.nota, configuracao.notaMax, percentagem]);
    });

    baixarCsv(linhas, `relatorio-lote-corretoria-${Date.now()}.csv`);
  });

  /* ============================================================
     PAINÉIS LATERAIS (Chat e Configurações)
     ============================================================ */
  function algumPainelAberto() {
    return painelChat.classList.contains("aberto") || painelConfig.classList.contains("aberto");
  }

  function atualizarOverlay() {
    painelOverlay.hidden = !algumPainelAberto();
  }

  function abrirChat() {
    painelConfig.classList.remove("aberto");
    painelChat.classList.add("aberto");
    btnAbrirChat.hidden = true;
    atualizarOverlay();
  }

  function fecharPaineis() {
    painelChat.classList.remove("aberto");
    painelConfig.classList.remove("aberto");
    btnAbrirChat.hidden = false;
    atualizarOverlay();
  }

  function abrirConfig() {
    painelChat.classList.remove("aberto");
    btnAbrirChat.hidden = false;
    painelConfig.classList.add("aberto");
    atualizarOverlay();
  }

  if (btnChat) btnChat.addEventListener("click", abrirChat);
  if (btnAbrirChat) btnAbrirChat.addEventListener("click", abrirChat);
  if (btnFecharChat) btnFecharChat.addEventListener("click", fecharPaineis);

  if (btnConfig) btnConfig.addEventListener("click", abrirConfig);
  if (btnFecharConfig) btnFecharConfig.addEventListener("click", fecharPaineis);

  if (painelOverlay) painelOverlay.addEventListener("click", fecharPaineis);

  /* ============================================================
     CHAT COM A IA (simulado — ligar aqui o backend/IA real)
     ============================================================ */
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = chatInput.value.trim();
      if (!texto) return;

      adicionarMensagemChat(texto, "eu");
      chatInput.value = "";

      setTimeout(() => {
        adicionarMensagemChat(gerarRespostaChat(texto), "ia");
      }, 500 + Math.random() * 400);
    });
  }

  function adicionarMensagemChat(texto, autor) {
    const msg = document.createElement("div");
    msg.className = autor === "eu" ? "msg msg--eu" : "msg msg--ia";
    msg.textContent = texto;
    chatMensagens.appendChild(msg);
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
  }

  function gerarRespostaChat(pergunta) {
    const p = pergunta.toLowerCase();
    if (p.includes("nota") || p.includes("rigor") || p.includes("strict") || p.includes("score")) {
      return t("chatRespostaRigor", { rigor: configuracao.rigor, max: configuracao.notaMax });
    }
    if (p.includes("chave") || p.includes("gabarito") || p.includes("key") || p.includes("answer")) {
      const temChave = anexoChave.estado.pdf || anexoChave.estado.fotos.length > 0;
      return temChave ? t("chatRespostaChaveSim") : t("chatRespostaChaveNao");
    }
    return t("chatRespostaGenerica");
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
      mostrarToast(t("toastConfigGuardada"));
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
      btnTema.setAttribute("aria-label", paraClaro ? t("temaAtivarClaro") : t("temaAtivarEscuro"));
      btnTema.title = paraClaro ? t("temaClaro") : t("temaEscuro");
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

  /* ============================================================
     IDIOMA (PT / EN)
     ============================================================ */
  if (btnIdioma) {
    btnIdioma.addEventListener("click", () => {
      idiomaAtual = idiomaAtual === "pt" ? "en" : "pt";
      try {
        localStorage.setItem(CHAVE_IDIOMA, idiomaAtual);
      } catch (e) {
        /* localStorage indisponível — ignora */
      }
      aplicarTraducoes();
      // Re-sincroniza textos que dependem do estado atual (não são [data-i18n] puros)
      aplicarTema(document.documentElement.getAttribute("data-theme") || "dark");
      definirModo(modoAtual);
      renumerarLinhasLote();
    });
  }
}
