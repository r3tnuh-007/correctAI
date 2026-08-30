/* ============================================================
   FILA DE PROVAS
   ============================================================ */

"use strict";

const provasPorId = new Map();

function adicionarProvaNaFila(prova) {
  const t = window.t || function(chave) { return chave; };
  const escaparHtml = window.escavarHtml || function(texto) { return texto; };
  const secFila = document.getElementById("secFila");
  const listaProvas = document.getElementById("listaProvas");

  if (!secFila || !listaProvas) return;
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
  provasPorId.set(prova.id, prova);
}

function atualizarProvaNaFila(prova) {
  const t = window.t || function(chave) { return chave; };
  const card = document.getElementById(`prova-${prova.id}`);
  if (!card) return;

  const estadoEl = card.querySelector("[data-estado]");
  if (!estadoEl) return;

  const config = window.getConfiguracao ? window.getConfiguracao() : { notaMax: 20 };

  estadoEl.classList.remove("estado--analise", "estado--concluido", "estado--erro");

  // Remove ações e mensagem de erro de uma tentativa anterior — são
  // sempre reconstruídas de acordo com o estado atual da prova.
  const acoesAntigas = card.querySelector(".prova-card__acoes");
  if (acoesAntigas) acoesAntigas.remove();
  const erroMsgAntiga = card.querySelector(".prova-card__erro-msg");
  if (erroMsgAntiga) erroMsgAntiga.remove();

  if (prova.estadoAnalise === "analise") {
    estadoEl.classList.add("estado--analise");
    estadoEl.textContent = t("estadoAnalise");
    return;
  }

  if (prova.estadoAnalise === "erro") {
    estadoEl.classList.add("estado--erro");
    estadoEl.textContent = t("estadoErro");

    if (prova.erroMensagem) {
      const msgEl = document.createElement("div");
      msgEl.className = "prova-card__erro-msg";
      msgEl.textContent = prova.erroMensagem;
      card.appendChild(msgEl);
    }

    const acoes = document.createElement("div");
    acoes.className = "prova-card__acoes";

    const btnRetry = document.createElement("button");
    btnRetry.type = "button";
    btnRetry.className = "btn btn--pequeno";
    btnRetry.textContent = t("cardTentarNovamente");
    btnRetry.addEventListener("click", () => {
      prova.estadoAnalise = "analise";
      prova.erroMensagem = null;
      atualizarProvaNaFila(prova);
      if (typeof window.corrigirProvaNoServidor === 'function') {
        window.corrigirProvaNoServidor(prova);
      }
    });

    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.className = "btn btn--pequeno btn--perigo";
    btnRemover.textContent = t("cardRemover");
    btnRemover.addEventListener("click", () => {
      removerProvaDaFila(prova.id);
    });

    acoes.append(btnRetry, btnRemover);
    card.appendChild(acoes);
    return;
  }

  estadoEl.classList.add("estado--concluido");
  estadoEl.textContent = t("estadoNota", { nota: prova.nota, max: config.notaMax });

  const acoes = document.createElement("div");
  acoes.className = "prova-card__acoes";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn--pequeno";
  btn.textContent = t("cardExportar");
  btn.addEventListener("click", () => {
    if (typeof exportarProvasParaCsv === 'function') {
      exportarProvasParaCsv([prova]);
    }
  });
  acoes.appendChild(btn);
  card.appendChild(acoes);
}

function removerProvaDaFila(id) {
  const card = document.getElementById(`prova-${id}`);
  if (card) card.remove();
  provasPorId.delete(id);

  const listaProvas = document.getElementById("listaProvas");
  const secFila = document.getElementById("secFila");
  if (listaProvas && secFila && listaProvas.children.length === 0) {
    secFila.hidden = true;
  }
}

function getProvasPorId() {
  return provasPorId;
}

function iniciarFila() {
  const btnExportarTudo = document.getElementById("btnExportarTudo");
  if (!btnExportarTudo) return;

  btnExportarTudo.addEventListener("click", function() {
    const provas = Array.from(provasPorId.values());
    if (typeof window.exportarProvasParaCsv === 'function') {
      window.exportarProvasParaCsv(provas);
    }
  });
}

// Exporta globalmente
window.adicionarProvaNaFila = adicionarProvaNaFila;
window.atualizarProvaNaFila = atualizarProvaNaFila;
window.removerProvaDaFila = removerProvaDaFila;
window.getProvasPorId = getProvasPorId;
window.iniciarFila = iniciarFila;