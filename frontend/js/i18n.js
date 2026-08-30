/* ============================================================
   i18n — Traduções e gerenciamento de idioma
   ============================================================ */

"use strict";

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
    cardTentarNovamente: "🔁 Tentar novamente",
    cardRemover: "🗑 Remover",
    provaMeta: "Nº {numero} · {n} ficheiro(s)",
    estadoAnalise: "A analisar…",
    estadoNota: "Nota: {nota} / {max}",
    estadoErro: "Erro na correção",
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
    toastCorrecaoErro: "❌ Não foi possível corrigir a prova de {nome}: {mensagem}",
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
    cardTentarNovamente: "🔁 Try again",
    cardRemover: "🗑 Remove",
    provaMeta: "No. {numero} · {n} file(s)",
    estadoAnalise: "Analysing…",
    estadoNota: "Score: {nota} / {max}",
    estadoErro: "Grading error",

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
    toastCorrecaoErro: "❌ Could not grade {nome}'s exam: {mensagem}",
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
let idiomaAtual = "en";

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
}

function atualizarBotaoIdioma(btnIdioma) {
  if (!btnIdioma) return;
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

function iniciarIdioma() {
  try {
    const guardado = localStorage.getItem(CHAVE_IDIOMA);
    if (guardado === "pt" || guardado === "en") idiomaAtual = guardado;
  } catch (e) {
    /* localStorage indisponível — mantém o padrão */
  }
}

function alternarIdioma() {
  idiomaAtual = idiomaAtual === "pt" ? "en" : "pt";
  try {
    localStorage.setItem(CHAVE_IDIOMA, idiomaAtual);
  } catch (e) {
    /* localStorage indisponível — ignora */
  }
  aplicarTraducoes();
  return idiomaAtual;
}

// Exporta para uso global
window.t = t;
window.aplicarTraducoes = aplicarTraducoes;
window.iniciarIdioma = iniciarIdioma;
window.alternarIdioma = alternarIdioma;
window.atualizarBotaoIdioma = atualizarBotaoIdioma;
window.idiomaAtual = () => idiomaAtual;