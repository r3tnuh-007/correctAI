/* ============================================================
   CORREÇÃO COM IA
   ============================================================ */

"use strict";

function calcularNotaSimulada() {
  const config = window.getConfiguracao ? window.getConfiguracao() : { rigor: "equilibrado", tolerancia: 30, notaMax: 20 };
  
  const rigorFactor = {
    flexivel: 0.9,
    equilibrado: 0.75,
    rigoroso: 0.6,
    "muito-rigoroso": 0.45,
  }[config.rigor] ?? 0.75;

  const toleranciaBonus = (config.tolerancia / 100) * 0.15;
  const base = rigorFactor + toleranciaBonus;
  const variacao = (Math.random() - 0.5) * 0.25;
  const fracao = Math.min(1, Math.max(0, base + variacao));

  return Math.round(fracao * config.notaMax * 10) / 10;
}

function simularCorrecaoIA(prova, aoConcluir) {
  const t = window.t || function(chave) { return chave; };
  const mostrarToast = window.mostrarToast || function(msg) { alert(msg); };
  const atualizarProvaNaFilaFn = window.atualizarProvaNaFila || function() {};
  const getConfiguracao = window.getConfiguracao || function() { return { notaMax: 20 }; };

  const tempoBase = 1500 + Math.random() * 1500;

  setTimeout(() => {
    prova.nota = calcularNotaSimulada();
    prova.estadoAnalise = "concluido";
    atualizarProvaNaFilaFn(prova);
    
    if (!prova.loteId) {
      const config = getConfiguracao();
      mostrarToast(t("toastCorrecaoConcluida", { 
        nome: prova.nome, 
        nota: prova.nota, 
        max: config.notaMax 
      }));
    }
    
    if (aoConcluir) aoConcluir(prova);
  }, tempoBase);
}

/**
 * Envia a prova para correção real no servidor (via api-service.js).
 * Substitui a simulação local sempre que o serviço de API está disponível.
 */
async function corrigirProvaNoServidor(prova, aoConcluir) {
  const t = window.t || function(chave) { return chave; };
  const mostrarToast = window.mostrarToast || function(msg) { alert(msg); };
  const atualizarProvaNaFilaFn = window.atualizarProvaNaFila || function() {};
  const getConfiguracao = window.getConfiguracao || function() { return { notaMax: 20 }; };

  if (typeof window.enviarProvaParaCorrecao !== 'function') {
    // api-service.js não está carregado — recorre à simulação local.
    simularCorrecaoIA(prova, aoConcluir);
    return;
  }

  const config = getConfiguracao();
  const anexoChave = window.anexoChave;
  const chave = (anexoChave && anexoChave.estado && (anexoChave.estado.pdf || anexoChave.estado.fotos.length > 0))
    ? anexoChave.estado
    : null;

  try {
    const resposta = await window.enviarProvaParaCorrecao(prova, prova.ficheiros, config, chave);

    prova.nota = (resposta && typeof resposta.nota === 'number') ? resposta.nota : prova.nota;
    prova.estadoAnalise = "concluido";
    atualizarProvaNaFilaFn(prova);

    if (!prova.loteId) {
      mostrarToast(t("toastCorrecaoConcluida", {
        nome: prova.nome,
        nota: prova.nota,
        max: config.notaMax,
      }));
    }
  } catch (erro) {
    const mensagemErro = (erro && erro.message) || String(erro);
    prova.estadoAnalise = "erro";
    prova.erroMensagem = mensagemErro;
    atualizarProvaNaFilaFn(prova);
    mostrarToast(t("toastCorrecaoErro", {
      nome: prova.nome,
      mensagem: mensagemErro,
    }));
  } finally {
    if (aoConcluir) aoConcluir(prova);
  }
}

function exportarProvasParaCsv(provas) {
  const t = window.t || function(chave) { return chave; };
  const mostrarToast = window.mostrarToast || function(msg) { alert(msg); };
  const baixarCsv = window.baixarCsv || function() {};
  const getConfiguracao = window.getConfiguracao || function() { return { notaMax: 20 }; };

  if (!provas.length) {
    mostrarToast(t("toastSemProvasExportar"));
    return;
  }

  const config = getConfiguracao();
  const linhas = [[t("csvNome"), t("csvNumero"), t("csvTipo"), t("csvNota"), t("csvNotaMax"), t("csvEstado")]];
  
  provas.forEach((p) => {
    linhas.push([
      p.nome,
      p.numero,
      p.tipo,
      p.nota ?? "",
      config.notaMax,
      p.estadoAnalise === "concluido" ? t("estadoConcluidoLabel") : t("estadoAnaliseLabel"),
    ]);
  });

  baixarCsv(linhas, `provas-corretoria-${Date.now()}.csv`);
}

// Exporta globalmente
window.calcularNotaSimulada = calcularNotaSimulada;
window.simularCorrecaoIA = simularCorrecaoIA;
window.corrigirProvaNoServidor = corrigirProvaNoServidor;
window.exportarProvasParaCsv = exportarProvasParaCsv;