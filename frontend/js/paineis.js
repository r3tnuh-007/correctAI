/* ============================================================
   PAINÉIS LATERAIS (Chat e Configurações)
   ============================================================ */

"use strict";

function algumPainelAberto() {
  const painelChat = document.getElementById("painelChat");
  const painelConfig = document.getElementById("painelConfig");
  return (painelChat && painelChat.classList.contains("aberto")) || 
         (painelConfig && painelConfig.classList.contains("aberto"));
}

function atualizarOverlay() {
  const painelOverlay = document.getElementById("painelOverlay");
  if (painelOverlay) painelOverlay.hidden = !algumPainelAberto();
}

function abrirChat() {
  const painelChat = document.getElementById("painelChat");
  const painelConfig = document.getElementById("painelConfig");
  const btnAbrirChat = document.getElementById("btnAbrirChat");
  
  if (painelConfig) painelConfig.classList.remove("aberto");
  if (painelChat) painelChat.classList.add("aberto");
  if (btnAbrirChat) btnAbrirChat.hidden = true;
  atualizarOverlay();
}

function fecharPaineis() {
  const painelChat = document.getElementById("painelChat");
  const painelConfig = document.getElementById("painelConfig");
  const btnAbrirChat = document.getElementById("btnAbrirChat");
  
  if (painelChat) painelChat.classList.remove("aberto");
  if (painelConfig) painelConfig.classList.remove("aberto");
  if (btnAbrirChat) btnAbrirChat.hidden = false;
  atualizarOverlay();
}

function abrirConfig() {
  const painelChat = document.getElementById("painelChat");
  const painelConfig = document.getElementById("painelConfig");
  const btnAbrirChat = document.getElementById("btnAbrirChat");
  
  if (painelChat) painelChat.classList.remove("aberto");
  if (btnAbrirChat) btnAbrirChat.hidden = false;
  if (painelConfig) painelConfig.classList.add("aberto");
  atualizarOverlay();
}

function iniciarPaineis() {
  const btnChat = document.getElementById("btnChat");
  const btnAbrirChat = document.getElementById("btnAbrirChat");
  const btnFecharChat = document.getElementById("btnFecharChat");
  const btnConfig = document.getElementById("btnConfig");
  const btnFecharConfig = document.getElementById("btnFecharConfig");
  const painelOverlay = document.getElementById("painelOverlay");

  if (btnChat) btnChat.addEventListener("click", abrirChat);
  if (btnAbrirChat) btnAbrirChat.addEventListener("click", abrirChat);
  if (btnFecharChat) btnFecharChat.addEventListener("click", fecharPaineis);

  if (btnConfig) btnConfig.addEventListener("click", abrirConfig);
  if (btnFecharConfig) btnFecharConfig.addEventListener("click", fecharPaineis);

  if (painelOverlay) painelOverlay.addEventListener("click", fecharPaineis);

  /* ---------- mantém o botão de abrir o chat acima do rodapé ---------- */
  const rodape = document.querySelector(".rodape");
  const margemBase = 24; // 1.5rem, igual ao "bottom" definido em CSS

  function ajustarBotaoAbrirChatSobreRodape() {
    if (!btnAbrirChat || !rodape) return;
    const rodapeTopo = rodape.getBoundingClientRect().top;
    const sobreposicao = window.innerHeight - rodapeTopo;

    btnAbrirChat.style.bottom = sobreposicao > 0
      ? `${margemBase + sobreposicao}px`
      : "";
  }

  window.addEventListener("scroll", ajustarBotaoAbrirChatSobreRodape, { passive: true });
  window.addEventListener("resize", ajustarBotaoAbrirChatSobreRodape);
  ajustarBotaoAbrirChatSobreRodape();
}

// Exporta globalmente
window.iniciarPaineis = iniciarPaineis;
window.abrirChat = abrirChat;
window.fecharPaineis = fecharPaineis;
window.abrirConfig = abrirConfig;