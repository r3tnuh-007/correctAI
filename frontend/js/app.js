/* ============================================================
   CorretorIA — Arquivo Principal (Orquestrador)
   - Importa e coordena todos os módulos
   - Inicializa a aplicação
   ============================================================ */

"use strict";

// ============================================================
// UTILITÁRIOS GLOBAIS
// ============================================================

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
let esconderToastAoClicar = null;

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensagem;
  toast.hidden = false;

  clearTimeout(toastTimeoutId);
  if (esconderToastAoClicar) {
    document.removeEventListener("click", esconderToastAoClicar);
    esconderToastAoClicar = null;
  }

  function esconder() {
    toast.hidden = true;
    clearTimeout(toastTimeoutId);
    document.removeEventListener("click", esconder);
    esconderToastAoClicar = null;
  }

  // Tempo máximo, caso o utilizador não clique em lado nenhum
  toastTimeoutId = setTimeout(esconder, 4200);

  // Só começa a "ouvir" cliques a partir do próximo ciclo, para o
  // próprio clique que abriu o toast não o fechar de imediato.
  setTimeout(() => {
    esconderToastAoClicar = esconder;
    document.addEventListener("click", esconder);
  }, 0);
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

// Exporta utilitários globalmente
window.escavarHtml = escaparHtml;
window.formatarTamanho = formatarTamanho;
window.mostrarToast = mostrarToast;
window.mostrarErro = mostrarErro;
window.limparErro = limparErro;
window.proximoId = proximoId;
window.baixarCsv = baixarCsv;

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
  console.log("🚀 Inicializando CorretorIA...");

  // 1. Iniciar idioma
  if (typeof iniciarIdioma === 'function') {
    iniciarIdioma();
  }

  // 2. Carregar configurações
  if (typeof carregarConfiguracao === 'function') {
    carregarConfiguracao();
  }

  // 3. Aplicar traduções
  if (typeof aplicarTraducoes === 'function') {
    aplicarTraducoes();
  }

  // 4. Iniciar módulos
  if (typeof iniciarTema === 'function') {
    iniciarTema();
  }

  if (typeof iniciarModoCorrecao === 'function') {
    iniciarModoCorrecao();
  }

  if (typeof iniciarModalSimples === 'function') {
    iniciarModalSimples();
  }

  if (typeof iniciarModalLote === 'function') {
    iniciarModalLote();
  }

  if (typeof iniciarFila === 'function') {
    iniciarFila();
  }

  if (typeof iniciarPaineis === 'function') {
    iniciarPaineis();
  }

  if (typeof iniciarChat === 'function') {
    iniciarChat();
  }

  if (typeof iniciarConfiguracoes === 'function') {
    iniciarConfiguracoes();
  }

  // 5. Botão de idioma
  const btnIdioma = document.getElementById("btnIdioma");
  if (btnIdioma && typeof atualizarBotaoIdioma === 'function') {
    atualizarBotaoIdioma(btnIdioma);
    btnIdioma.addEventListener("click", function() {
      if (typeof alternarIdioma === 'function') {
        alternarIdioma();
        atualizarBotaoIdioma(btnIdioma);
        // Re-sincroniza elementos visuais
        if (typeof atualizarModo === 'function') {
          atualizarModo();
        }
        // Sincroniza a animação decorativa (IA a ajudar o humano)
        if (window.animacaoIAInstancia && typeof window.idiomaAtual === 'function') {
          window.animacaoIAInstancia.mudarIdioma(window.idiomaAtual());
        }
      }
    });
  }

  console.log("✅ CorretorIA inicializado com sucesso!");
});
