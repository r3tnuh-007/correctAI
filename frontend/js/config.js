/* ============================================================
   Configurações e Tema
   ============================================================ */

"use strict";

const CHAVE_ARMAZENAMENTO = "corretoria_config_v1";
const CHAVE_TEMA = "corretoria_tema";

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

function carregarConfiguracao() {
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

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  const btnTema = document.getElementById("btnTema");
  if (btnTema) {
    // O botão mantém o mesmo ícone (SVG via máscara + currentColor), que já se
    // adapta sozinho à cor do tema ativo — só o texto acessível muda de estado.
    const paraClaro = tema === "dark";
    btnTema.setAttribute("aria-label", paraClaro ? "Activar modo claro" : "Activar modo escuro");
    btnTema.title = paraClaro ? "Modo claro" : "Modo escuro";
  }
}

function iniciarTema() {
  let temaGuardado = null;

  try {
    temaGuardado = localStorage.getItem(CHAVE_TEMA);
  } catch (e) {}
  const temaInicial = temaGuardado || document.documentElement.getAttribute("data-theme") || "dark";
  aplicarTema(temaInicial);

  const btnTema = document.getElementById("btnTema");
  if (btnTema) {
    btnTema.addEventListener("click", function() {
      const atual = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      aplicarTema(atual);
      try {
        localStorage.setItem(CHAVE_TEMA, atual);
      } catch (e) {}
    });
  }
}

function getConfiguracao() {
  return configuracao;
}

// Exporta globalmente
window.configuracao = configuracao;
window.carregarConfiguracao = carregarConfiguracao;
window.guardarConfiguracaoLocal = guardarConfiguracaoLocal;
window.iniciarTema = iniciarTema;
window.getConfiguracao = getConfiguracao;
