/* ============================================================
   CorretorIA — Lógica do frontend (JavaScript puro)
   - Modal de carregamento de provas
   - Escolha PDF (1 ficheiro) ou Fotos (várias páginas)
   - Várias provas em fila de análise
   - Simulação da correção com IA (ligar aqui o backend/IA real)
   ============================================================ */

"use strict";

/* ---------- Referências ao DOM ---------- */
const modalOverlay = document.getElementById("modalOverlay");
const btnAbrirTopo = document.getElementById("btnAbrirModalTopo");
const btnAbrirHero = document.getElementById("btnAbrirModalHero");
const btnFecharModal = document.getElementById("btnFecharModal");
const formProva = document.getElementById("formProva");
const inputNome = document.getElementById("inputNome");
const inputNumero = document.getElementById("inputNumero");
const dropzoneTexto = document.getElementById("dropzoneTexto");
const dropzoneAjuda = document.getElementById("dropzoneAjuda");
const previewFotos = document.getElementById("previewFotos");
const listaProvas = document.getElementById("listaProvas");
const secFila = document.getElementById("secFila");
const toast = document.getElementById("toast");
const inputFicheiro = document.getElementById("inputFicheiro");
const inputCamera = document.getElementById("inputCamera");

const dropzone = document.getElementById("dropzone");
const dropzoneConteudo = document.getElementById("dropzoneConteudo");


/* ---------- Estado ---------- */
const estado = {
  tipo: "pdf", // "pdf" | "foto"
  pdf: null, // File
  fotos: [], // File[]
  provas: [], // provas submetidas
};

/* ============================================================
   MODAL
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

btnAbrirTopo.addEventListener("click", abrirModal);
btnAbrirHero.addEventListener("click", abrirModal);
btnFecharModal.addEventListener("click", fecharModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) fecharModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) fecharModal();
});

/* ============================================================
   ESCOLHA DO TIPO: PDF vs FOTOS
   ============================================================ */






inputCamera.type = "file";
inputCamera.accept = "image/*";
inputCamera.capture = "environment";
inputCamera.multiple = true;
inputCamera.hidden = true;

document.body.appendChild(inputCamera);

formProva.tipoFicheiro.forEach((radio) => {
  radio.addEventListener("change", () => {

    estado.tipo = radio.value;
    estado.pdf = null;
    estado.fotos = [];

    previewFotos.innerHTML = "";

    if (estado.tipo === "pdf") {

      // ==========================
      // MODO PDF
      // ==========================

      inputFicheiro.accept = "application/pdf";
      inputFicheiro.multiple = false;

      dropzoneConteudo.innerHTML = `
        <span class="dropzone__icone">⇪</span>

        <p id="dropzoneTexto">
          Arrasta o PDF aqui ou <u>clica para escolher</u>
        </p>

        <small id="dropzoneAjuda">
          1 ficheiro PDF
        </small>
      `;

    } else {

      // ==========================
      // MODO FOTOS
      // ==========================

      inputFicheiro.accept = "image/*";
      inputFicheiro.multiple = true;

      dropzoneConteudo.innerHTML = `

        <div class="dropzone__opcoes">

          <!-- UPLOAD -->
          <div class="dropzone__opcao" id="opcaoUpload">

            <span class="dropzone__icone">⇪</span>

            <p>
              <strong>Carregar fotos</strong>
            </p>

            <small>
              Escolher da ficheiro (jpg, pnj)
            </small>

          </div>


          <!-- CÂMERA -->
          <div class="dropzone__opcao" id="opcaoCamera">

            <span class="dropzone__icone">📷</span>

            <p>
              <strong>Tirar foto</strong>
            </p>

            <small>
              Abrir câmera
            </small>

          </div>

        </div>

        <small id="dropzoneAjuda">
          Várias fotos — uma por página da prova
        </small>
      `;
    }

    limparErro("ficheiro");
  });
});






formProva.tipoFicheiro.forEach((radio) => {
  radio.addEventListener("change", () => {
    estado.tipo = radio.value;
    estado.pdf = null;
    estado.fotos = [];
    previewFotos.innerHTML = "";

    if (estado.tipo === "pdf") {
      inputFicheiro.accept = "application/pdf";
      inputFicheiro.multiple = false;
      dropzoneTexto.innerHTML =
        "Arrasta o PDF aqui ou <u>clica para escolher</u>";
      dropzoneAjuda.textContent = "1 ficheiro PDF";
    } else {
      inputFicheiro.accept = "image/*";
      inputFicheiro.multiple = true;

      dropzoneTexto.innerHTML = `
			Arrasta as fotos aqui ou
			<span class="dropzone__acao">
				<u>clica para escolher</u>
			</span>
			<span class="dropzone__acao dropzone__camera">
				📷 <u>Tirar foto</u>
			</span>
		`;

      dropzoneAjuda.textContent = "Várias fotos — uma por página da prova";
    }

    limparErro("ficheiro");
  });
});




/* ============================================================
   DROPZONE (clique + arrastar e largar)
   ============================================================ */
dropzone.addEventListener("click", (e) => {

  // ==========================================
  // BOTÃO DA CÂMERA
  // ==========================================

  const camera = e.target.closest("#opcaoCamera");

  if (camera) {

    e.preventDefault();
    e.stopPropagation();

    inputCamera.click();

    return;
  }


  // ==========================================
  // BOTÃO DE UPLOAD
  // ==========================================

  const upload = e.target.closest("#opcaoUpload");

  if (upload) {

    e.preventDefault();
    e.stopPropagation();

    inputFicheiro.click();

    return;
  }


  // ==========================================
  // MODO PDF
  // ==========================================

  if (estado.tipo === "pdf") {

    inputFicheiro.click();

  }

});

inputCamera.addEventListener("change", () => {

  const fotos = Array.from(inputCamera.files);

  if (!fotos.length) {
    return;
  }

  console.log("Fotos capturadas:", fotos);

  // Aqui vamos usar a MESMA função
  // que já utilizas para processar inputFicheiro.

  inputCamera.value = "";

});



["dragover", "dragenter"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("arrastar");
  }),
);

["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("arrastar");
  }),
);

dropzone.addEventListener("drop", (e) => {
  adicionarFicheiros(e.dataTransfer.files);
});

inputFicheiro.addEventListener("change", () => {
  adicionarFicheiros(inputFicheiro.files);
  inputFicheiro.value = ""; // permite escolher o mesmo ficheiro outra vez
});

function adicionarFicheiros(fileList) {
  const ficheiros = Array.from(fileList);
  limparErro("ficheiro");

  if (estado.tipo === "pdf") {
    const ficheiro = ficheiros[0];
    if (!ficheiro) return;
    if (ficheiro.type !== "application/pdf") {
      mostrarErro("ficheiro", "Apenas ficheiros PDF são aceites.");
      return;
    }
    estado.pdf = ficheiro;
    dropzoneTexto.innerHTML = `✅ <strong>${escaparHtml(ficheiro.name)}</strong>`;
    dropzoneAjuda.textContent =
      formatarTamanho(ficheiro.size) + " — clica para trocar";
  } else {
    const imagens = ficheiros.filter((f) => f.type.startsWith("image/"));
    if (imagens.length !== ficheiros.length) {
      mostrarErro(
        "ficheiro",
        "Alguns ficheiros foram ignorados: apenas imagens são aceites.",
      );
    }
    estado.fotos.push(...imagens);
    renderizarPreviewFotos();
  }
}

/* ---------- Pré-visualização das fotos ---------- */
function renderizarPreviewFotos() {
  previewFotos.innerHTML = "";

  estado.fotos.forEach((foto, indice) => {
    const item = document.createElement("div");
    item.className = "preview-fotos__item";

    const img = document.createElement("img");
    img.src = URL.createObjectURL(foto);
    img.alt = `Página ${indice + 1} da prova`;
    img.onload = () => URL.revokeObjectURL(img.src);

    const btnRemover = document.createElement("button");
    btnRemover.type = "button";
    btnRemover.className = "preview-fotos__remover";
    btnRemover.textContent = "✕";
    btnRemover.setAttribute("aria-label", `Remover página ${indice + 1}`);
    btnRemover.addEventListener("click", () => {
      estado.fotos.splice(indice, 1);
      renderizarPreviewFotos();
    });

    item.append(img, btnRemover);
    previewFotos.appendChild(item);
  });

  if (estado.fotos.length > 0) {
    dropzoneTexto.innerHTML = `📷 <strong>${estado.fotos.length}</strong> página(s) adicionada(s)`;
    dropzoneAjuda.textContent = "Clica ou arrasta para adicionar mais páginas";
  }
}

/* ============================================================
   VALIDAÇÃO E SUBMISSÃO
   ============================================================ */
formProva.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validarFormulario()) return;

  const prova = {
    id: Date.now(),
    nome: inputNome.value.trim(),
    numero: inputNumero.value.trim(),
    tipo: estado.tipo,
    ficheiros: estado.tipo === "pdf" ? [estado.pdf] : [...estado.fotos],
    estadoAnalise: "analise",
    nota: null,
  };

  estado.provas.push(prova);
  adicionarProvaNaFila(prova);
  fecharModal();
  mostrarToast(`Prova de ${prova.nome} enviada para análise.`);
  simularCorrecaoIA(prova);
});

function validarFormulario() {
  let valido = true;

  const nome = inputNome.value.trim();
  if (nome.length < 2) {
    mostrarErro("nome", "Indica o nome completo do estudante.");
    inputNome.classList.add("invalido");
    valido = false;
  } else {
    limparErro("nome");
    inputNome.classList.remove("invalido");
  }

  const numero = inputNumero.value.trim();
  if (numero.length < 1) {
    mostrarErro("numero", "Indica o número de estudante.");
    inputNumero.classList.add("invalido");
    valido = false;
  } else {
    limparErro("numero");
    inputNumero.classList.remove("invalido");
  }

  if (estado.tipo === "pdf" && !estado.pdf) {
    mostrarErro("ficheiro", "Anexa o PDF da prova.");
    valido = false;
  }
  if (estado.tipo === "foto" && estado.fotos.length === 0) {
    mostrarErro("ficheiro", "Anexa pelo menos uma foto da prova.");
    valido = false;
  }

  return valido;
}

function mostrarErro(campo, mensagem) {
  const el = document.querySelector(`[data-erro="${campo}"]`);
  if (el) el.textContent = mensagem;
}

function limparErro(campo) {
  mostrarErro(campo, "");
}

function limparFormulario() {
  formProva.reset();
  estado.pdf = null;
  estado.fotos = [];
  estado.tipo = "pdf";
  previewFotos.innerHTML = "";
  dropzoneTexto.innerHTML = "Arrasta o PDF aqui ou <u>clica para escolher</u>";
  dropzoneAjuda.textContent = "1 ficheiro PDF";
  ["nome", "numero", "ficheiro"].forEach(limparErro);
  inputNome.classList.remove("invalido");
  inputNumero.classList.remove("invalido");
}

/* ============================================================
   FILA DE PROVAS + SIMULAÇÃO DA CORREÇÃO COM IA
   ============================================================ */
function adicionarProvaNaFila(prova) {
  secFila.hidden = false;

  const card = document.createElement("article");
  card.className = "prova-card";
  card.id = `prova-${prova.id}`;

  const totalPaginas = prova.ficheiros.length;
  const descricaoFicheiros =
    prova.tipo === "pdf" ? "1 ficheiro PDF" : `${totalPaginas} foto(s)`;

  card.innerHTML = `
    <div class="prova-card__icone">${prova.tipo === "pdf" ? "📄" : "📷"}</div>
    <div class="prova-card__info">
      <div class="prova-card__nome">${escaparHtml(prova.nome)}</div>
      <div class="prova-card__meta">
        Nº ${escaparHtml(prova.numero)} · ${descricaoFicheiros}
      </div>
    </div>
    <span class="prova-card__estado estado--analise">⏳ A analisar…</span>
  `;

  listaProvas.prepend(card);
}

/* Substitui esta função pela chamada real à API de IA (fetch).
   A nota simulada respeita as configurações de rigorosidade/tolerância. */
function simularCorrecaoIA(prova) {
  const duracao = 3000 + Math.random() * 3000;

  // Guarda as regras usadas no momento da correção
  prova.config = JSON.parse(JSON.stringify(config));

  setTimeout(() => {
    const resultado = calcularNota(prova);
    prova.estadoAnalise = "concluido";
    prova.nota = resultado.nota;
    prova.notaMaxima = resultado.notaMaxima;
    prova.detalhes = resultado.detalhes;
    prova.comentario = resultado.comentario;

    const card = document.getElementById(`prova-${prova.id}`);
    if (!card) return;

    const badge = card.querySelector(".prova-card__estado");
    badge.className = "prova-card__estado estado--concluido";
    badge.textContent = `✅ Corrigida — Nota: ${prova.nota}/${prova.notaMaxima}`;

    card.appendChild(criarBarraExportacao(prova));
    mostrarToast(
      `Prova de ${prova.nome} corrigida: ${prova.nota}/${prova.notaMaxima}`,
    );
  }, duracao);
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
let toastTimer;
function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 4000);
}

function formatarTamanho(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

/* ============================================================
   PAINEL DE CONFIGURAÇÕES + CHAT COM A IA
   ============================================================ */
const painelConfig = document.getElementById("painelConfig");
const painelChat = document.getElementById("painelChat");
const painelOverlay = document.getElementById("painelOverlay");
const btnConfig = document.getElementById("btnConfig");
const btnFecharConfig = document.getElementById("btnFecharConfig");
const btnChat = document.getElementById("btnChat");
const btnAbrirChat = document.getElementById("btnAbrirChat");
const btnFecharChat = document.getElementById("btnFecharChat");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMensagens = document.getElementById("chatMensagens");
const rangeTolerancia = document.getElementById("rangeTolerancia");
const valTolerancia = document.getElementById("valTolerancia");
const btnGuardarConfig = document.getElementById("btnGuardarConfig");

/* ---------- Configuração de avaliação ---------- */
const CONFIG_CHAVE = "corretoria:config";

const config = {
  rigor: "equilibrado",
  tolerancia: 30,
  notaMaxima: 20,
  metricas: ["conteudo", "raciocinio"],
  criterios: "",
};

function carregarConfig() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CONFIG_CHAVE) || "null");
    if (guardado) Object.assign(config, guardado);
  } catch (_) {
    /* ignora dados inválidos */
  }

  document.getElementById("selRigor").value = config.rigor;
  rangeTolerancia.value = config.tolerancia;
  valTolerancia.textContent = config.tolerancia + "%";
  document.getElementById("inputNotaMax").value = config.notaMaxima;
  document.getElementById("txtCriterios").value = config.criterios;
  document.querySelectorAll("[data-metrica]").forEach((cb) => {
    cb.checked = config.metricas.includes(cb.dataset.metrica);
  });
}

function guardarConfig(silencioso) {
  config.rigor = document.getElementById("selRigor").value;
  config.tolerancia = Number(rangeTolerancia.value);
  config.notaMaxima =
    Number(document.getElementById("inputNotaMax").value) || 20;
  config.criterios = document.getElementById("txtCriterios").value.trim();
  config.metricas = Array.from(document.querySelectorAll("[data-metrica]"))
    .filter((cb) => cb.checked)
    .map((cb) => cb.dataset.metrica);

  localStorage.setItem(CONFIG_CHAVE, JSON.stringify(config));

  if (silencioso !== true) {
    mostrarToast("Configurações guardadas.");
    fecharPaineis();
  }
}

/* Guarda automaticamente sempre que algo muda (persistência imediata) */
painelConfig.addEventListener("change", () => guardarConfig(true));
painelConfig.addEventListener("input", () => guardarConfig(true));

rangeTolerancia.addEventListener("input", () => {
  valTolerancia.textContent = rangeTolerancia.value + "%";
});
btnGuardarConfig.addEventListener("click", () => guardarConfig(false));

/* ---------- Abrir / fechar painéis ---------- */
function atualizarOverlay() {
  const algumAberto =
    painelConfig.classList.contains("aberto") ||
    painelChat.classList.contains("aberto");
  painelOverlay.hidden = !algumAberto;
  btnAbrirChat.hidden = painelChat.classList.contains("aberto");
}

function alternarConfig() {
  painelConfig.classList.toggle("aberto");
  atualizarOverlay();
}

function alternarChat(forcar) {
  const abrir =
    typeof forcar === "boolean"
      ? forcar
      : !painelChat.classList.contains("aberto");
  painelChat.classList.toggle("aberto", abrir);
  atualizarOverlay();
  if (abrir) chatInput.focus();
}

function fecharPaineis() {
  painelConfig.classList.remove("aberto");
  painelChat.classList.remove("aberto");
  atualizarOverlay();
}

btnConfig.addEventListener("click", alternarConfig);
btnFecharConfig.addEventListener("click", fecharPaineis);
btnChat.addEventListener("click", () => alternarChat());
btnAbrirChat.addEventListener("click", () => alternarChat(true));
btnFecharChat.addEventListener("click", () => alternarChat(false));
painelOverlay.addEventListener("click", fecharPaineis);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.hidden) fecharPaineis();
});

/* ---------- Chat ---------- */
function adicionarMensagem(texto, autor) {
  const div = document.createElement("div");
  div.className = `msg msg--${autor}`;
  div.textContent = texto;
  chatMensagens.appendChild(div);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
  return div;
}

/* Substitui esta função por um fetch() à tua API de IA. */
function responderIA(pergunta) {
  const aEscrever = adicionarMensagem("A IA está a escrever…", "ia");
  aEscrever.classList.add("msg--escrever");

  setTimeout(() => {
    aEscrever.remove();
    const p = pergunta.toLowerCase();
    let resposta;

    if (p.includes("rigor")) {
      resposta = `O nível de rigorosidade atual é "${config.rigor}", com ${config.tolerancia}% de tolerância a erros ortográficos. Podes alterá-lo no painel de configurações (⚙️).`;
    } else if (
      p.includes("métrica") ||
      p.includes("metrica") ||
      p.includes("critério") ||
      p.includes("criterio")
    ) {
      resposta = `Estou a avaliar estas métricas: ${config.metricas.join(", ") || "nenhuma selecionada"}. Nota máxima: ${config.notaMaxima}.`;
    } else if (p.includes("nota") || p.includes("prova")) {
      const total = estado.provas.length;
      const corrigidas = estado.provas.filter(
        (pr) => pr.estadoAnalise === "concluido",
      ).length;
      resposta = total
        ? `Tens ${total} prova(s) submetida(s), ${corrigidas} já corrigida(s).`
        : "Ainda não carregaste nenhuma prova. Usa o botão “+ Nova prova”.";
    } else {
      resposta =
        "Entendido. Posso ajudar com critérios de avaliação, níveis de rigorosidade e explicação das notas atribuídas.";
    }

    adicionarMensagem(resposta, "ia");
  }, 900);
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto) return;
  adicionarMensagem(texto, "eu");
  chatInput.value = "";
  responderIA(texto);
});

carregarConfig();
atualizarOverlay();

/* ============================================================
   CÁLCULO DA NOTA — ligado às configurações
   ============================================================ */
const METRICAS_ROTULOS = {
  conteudo: "Correção do conteúdo",
  raciocinio: "Raciocínio e método",
  organizacao: "Organização e estrutura",
  ortografia: "Ortografia e gramática",
  caligrafia: "Legibilidade da caligrafia",
};

/* Quanto mais rigoroso, mais penalizado é o desempenho bruto */
const FATOR_RIGOR = {
  flexivel: 1.08,
  equilibrado: 1.0,
  rigoroso: 0.9,
  "muito-rigoroso": 0.8,
};

function calcularNota(prova) {
  const cfg = prova.config || config;
  const notaMaxima = cfg.notaMaxima || 20;
  const metricas = cfg.metricas.length ? cfg.metricas : ["conteudo"];
  const fator = FATOR_RIGOR[cfg.rigor] ?? 1;
  const tolerancia = (cfg.tolerancia ?? 0) / 100;

  const detalhes = metricas.map((chave) => {
    // desempenho bruto simulado (0.55–1.0) — substituir pelo resultado real da IA
    let bruto = 0.55 + Math.random() * 0.45;

    // as métricas de forma beneficiam da tolerância configurada
    if (chave === "ortografia" || chave === "caligrafia") {
      bruto = bruto + (1 - bruto) * tolerancia;
    }

    const pontuacao = Math.max(0, Math.min(1, bruto * fator));
    return {
      chave,
      rotulo: METRICAS_ROTULOS[chave] || chave,
      percentagem: Math.round(pontuacao * 100),
      pontos: Number((pontuacao * (notaMaxima / metricas.length)).toFixed(2)),
    };
  });

  const nota = Number(
    detalhes.reduce((soma, d) => soma + d.pontos, 0).toFixed(1),
  );

  const comentario = [
    `Avaliação com rigorosidade "${cfg.rigor}" e ${cfg.tolerancia}% de tolerância a erros de forma.`,
    `Métricas consideradas: ${detalhes.map((d) => `${d.rotulo} (${d.percentagem}%)`).join("; ")}.`,
    cfg.criterios
      ? `Critérios adicionais aplicados: ${cfg.criterios}`
      : "Sem critérios adicionais definidos.",
    nota >= notaMaxima * 0.75
      ? "Desempenho global sólido; poucas lacunas identificadas."
      : nota >= notaMaxima * 0.5
        ? "Desempenho suficiente, com falhas pontuais a rever."
        : "Desempenho insuficiente; recomenda-se revisão dos conteúdos essenciais.",
  ].join(" ");

  return { nota, notaMaxima, detalhes, comentario };
}

/* ============================================================
   EXPORTAÇÃO — CSV e PDF
   ============================================================ */
function criarBarraExportacao(prova) {
  const barra = document.createElement("div");
  barra.className = "prova-card__acoes";

  const btnCsv = document.createElement("button");
  btnCsv.type = "button";
  btnCsv.className = "btn btn--pequeno";
  btnCsv.textContent = "⬇ CSV";
  btnCsv.addEventListener("click", () => exportarCSV([prova]));

  const btnPdf = document.createElement("button");
  btnPdf.type = "button";
  btnPdf.className = "btn btn--pequeno";
  btnPdf.textContent = "⬇ PDF";
  btnPdf.addEventListener("click", () => exportarPDF(prova));

  barra.append(btnCsv, btnPdf);
  return barra;
}

function campoCsv(valor) {
  return `"${String(valor ?? "").replace(/"/g, '""')}"`;
}

function exportarCSV(provas) {
  const linhas = [
    [
      "Nome",
      "Número",
      "Rigorosidade",
      "Tolerância (%)",
      "Métricas",
      "Critérios",
      "Nota",
      "Nota máxima",
      "Comentários da IA",
    ]
      .map(campoCsv)
      .join(","),
  ];

  provas.forEach((prova) => {
    const cfg = prova.config || config;
    linhas.push(
      [
        prova.nome,
        prova.numero,
        cfg.rigor,
        cfg.tolerancia,
        (prova.detalhes || [])
          .map((d) => `${d.rotulo}: ${d.percentagem}%`)
          .join(" | "),
        cfg.criterios || "—",
        prova.nota,
        prova.notaMaxima,
        prova.comentario,
      ]
        .map(campoCsv)
        .join(","),
    );
  });

  const csv = "\uFEFF" + linhas.join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const nomeFicheiro =
    provas.length === 1
      ? `correcao-${provas[0].numero || provas[0].nome}.csv`
      : "correcoes.csv";

  const link = document.createElement("a");
  link.href = url;
  link.download = nomeFicheiro;
  link.click();
  URL.revokeObjectURL(url);
  mostrarToast("CSV exportado.");
}

function exportarPDF(prova) {
  const cfg = prova.config || config;
  const linhasMetricas = (prova.detalhes || [])
    .map(
      (d) =>
        `<tr><td>${escaparHtml(d.rotulo)}</td><td>${d.percentagem}%</td><td>${d.pontos}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8" />
    <title>Correção — ${escaparHtml(prova.nome)}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 32px; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      .sub { color: #555; font-size: 13px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13px; }
      th, td { border: 1px solid #ccc; padding: 7px 9px; text-align: left; }
      th { background: #f2f2f2; }
      .nota { font-size: 22px; font-weight: bold; margin: 8px 0 18px; }
      .bloco { font-size: 13px; line-height: 1.55; }
      h2 { font-size: 14px; margin: 18px 0 6px; }
    </style></head><body>
    <h1>Relatório de Correção — CorretorIA</h1>
    <div class="sub">Gerado em ${new Date().toLocaleString("pt-PT")}</div>

    <h2>Estudante</h2>
    <div class="bloco">Nome: <strong>${escaparHtml(prova.nome)}</strong><br />
      Número: <strong>${escaparHtml(prova.numero)}</strong></div>

    <h2>Configuração da avaliação</h2>
    <div class="bloco">Rigorosidade: <strong>${escaparHtml(cfg.rigor)}</strong><br />
      Tolerância a erros de forma: <strong>${cfg.tolerancia}%</strong><br />
      Critérios adicionais: ${escaparHtml(cfg.criterios || "—")}</div>

    <h2>Métricas avaliadas</h2>
    <table><thead><tr><th>Métrica</th><th>Desempenho</th><th>Pontos</th></tr></thead>
      <tbody>${linhasMetricas}</tbody></table>

    <div class="nota">Nota final: ${prova.nota} / ${prova.notaMaxima}</div>

    <h2>Comentários da IA</h2>
    <div class="bloco">${escaparHtml(prova.comentario || "")}</div>
    </body></html>`;

  const janela = window.open("", "_blank");
  if (!janela) {
    mostrarToast("Permite pop-ups para exportar em PDF.");
    return;
  }
  janela.document.write(html);
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 400);
}

/* Exportar todas as provas corrigidas */
const btnExportarTudo = document.getElementById("btnExportarTudo");
if (btnExportarTudo) {
  btnExportarTudo.addEventListener("click", () => {
    const corrigidas = estado.provas.filter(
      (p) => p.estadoAnalise === "concluido",
    );
    if (!corrigidas.length) {
      mostrarToast("Ainda não há provas corrigidas para exportar.");
      return;
    }
    exportarCSV(corrigidas);
  });
}

/* ============================================================
   TEMA — LIGHT / DARK
   ============================================================ */

const btnTema = document.getElementById("btnTema");

// Carregar o tema guardado
const temaSalvo = localStorage.getItem("tema");

if (temaSalvo === "dark" || temaSalvo === "light") {
  document.documentElement.setAttribute("data-theme", temaSalvo);
}

// Atualiza o botão conforme o tema atual
function atualizarBotaoTema() {
  const temaAtual = document.documentElement.getAttribute("data-theme");

  if (temaAtual === "dark") {
    btnTema.textContent = "☀️";
    btnTema.setAttribute("aria-label", "Activar modo claro");
    btnTema.setAttribute("title", "Modo claro");
  } else {
    btnTema.textContent = "🌙";
    btnTema.setAttribute("aria-label", "Activar modo escuro");
    btnTema.setAttribute("title", "Modo escuro");
  }
}

// Alternar tema ao clicar
btnTema.addEventListener("click", () => {
  const temaAtual =
    document.documentElement.getAttribute("data-theme") || "light";

  const novoTema = temaAtual === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", novoTema);

  // Guardar preferência
  localStorage.setItem("tema", novoTema);

  // Atualizar botão
  atualizarBotaoTema();
});

// Inicializar botão
atualizarBotaoTema();
