/* ============================================================
   CorretorIA — Controle de tema
   ============================================================ */

const html = document.documentElement;
const btnTema = document.getElementById("btnConfig");


// ------------------------------------------------------------
// Recupera o tema salvo
// ------------------------------------------------------------

const temaSalvo = localStorage.getItem("tema");

if (temaSalvo === "light" || temaSalvo === "dark") {
  html.setAttribute("data-theme", temaSalvo);
}


// ------------------------------------------------------------
// Alternar entre Light e Dark
// ------------------------------------------------------------

if (btnTema) {
  btnTema.addEventListener("click", () => {
    const temaAtual = html.getAttribute("data-theme");

    const novoTema = temaAtual === "dark"
      ? "light"
      : "dark";

    html.setAttribute("data-theme", novoTema);

    localStorage.setItem("tema", novoTema);
  });
}
