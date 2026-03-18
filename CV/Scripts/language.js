// Scripts/Language.js
function setLanguage(lang) {
  const elements = document.querySelectorAll("[data-lang]");
  elements.forEach(el => {
    if (el.getAttribute("data-lang") === lang) {
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  });

  // Salva a preferência no localStorage
  localStorage.setItem("language", lang);
}

// Mantém o idioma ao navegar entre páginas
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("language") || "pt";
  setLanguage(savedLang);
});
