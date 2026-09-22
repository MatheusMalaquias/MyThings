/**
 * Nav.js — destaca no menu qual página está aberta no momento.
 * Não depende do Supabase; pode carregar em qualquer página que tenha .site-nav.
 */
document.addEventListener('DOMContentLoaded', () => {
  const paginaAtual = location.pathname.split('/').pop() || 'Index.html';
  document.querySelectorAll('.site-nav a').forEach(link => {
    if (link.getAttribute('href') === paginaAtual) {
      link.classList.add('ativo');
      link.setAttribute('aria-current', 'page');
    }
  });
});