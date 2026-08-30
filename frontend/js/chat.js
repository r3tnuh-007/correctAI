/* ============================================================
   CHAT COM A IA
   ============================================================ */

"use strict";

function adicionarMensagemChat(texto, autor) {
  const chatMensagens = document.getElementById("chatMensagens");
  if (!chatMensagens) return;
  
  const msg = document.createElement("div");
  msg.className = autor === "eu" ? "msg msg--eu" : "msg msg--ia";
  msg.textContent = texto;
  chatMensagens.appendChild(msg);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

function gerarRespostaChat(pergunta) {
  const t = window.t || function(chave) { return chave; };
  const getConfiguracao = window.getConfiguracao || function() { return { rigor: "equilibrado", notaMax: 20 }; };
  const anexoChave = window.anexoChave || { estado: { pdf: null, fotos: [] } };

  const p = pergunta.toLowerCase();
  const config = getConfiguracao();
  
  if (p.includes("nota") || p.includes("rigor") || p.includes("strict") || p.includes("score")) {
    return t("chatRespostaRigor", { rigor: config.rigor, max: config.notaMax });
  }
  
  if (p.includes("chave") || p.includes("gabarito") || p.includes("key") || p.includes("answer")) {
    const temChave = (anexoChave && anexoChave.estado && (anexoChave.estado.pdf || anexoChave.estado.fotos.length > 0));
    return temChave ? t("chatRespostaChaveSim") : t("chatRespostaChaveNao");
  }
  
  return t("chatRespostaGenerica");
}

function iniciarChat() {
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  
  if (!chatForm || !chatInput) return;

  chatForm.addEventListener("submit", function(e) {
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

// Exporta globalmente
window.adicionarMensagemChat = adicionarMensagemChat;
window.gerarRespostaChat = gerarRespostaChat;
window.iniciarChat = iniciarChat;