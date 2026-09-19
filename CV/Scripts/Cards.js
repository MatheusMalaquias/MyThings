// Scripts/cards.js
// Abre um modal com as informações completas do card clicado.

function getVisible(elements) {
  return elements.find(el => el.style.display !== 'none') || elements[0];
}

function openModal(btn) {
  const card = btn.closest('.card');
  const modal = document.getElementById('project-modal');

  // Título (pega o h3 visível no idioma atual)
  const titles = Array.from(card.querySelectorAll('h3'));
  const titleEl = getVisible(titles);
  document.getElementById('modal-title').textContent = titleEl ? titleEl.textContent.trim() : '';

  // Descrição completa (pega o parágrafo visível dentro de .card-desc-full)
  const fullWrap = card.querySelector('.card-desc-full');
  const descEl = fullWrap ? getVisible(Array.from(fullWrap.querySelectorAll('p'))) : null;
  document.getElementById('modal-desc').textContent = descEl ? descEl.textContent.trim() : '';

  // Imagem/placeholder do projeto
  const visualSource = card.querySelector('.carousel, .card-visual-placeholder');
  const modalVisual = document.getElementById('modal-visual');
  modalVisual.innerHTML = '';
  if (visualSource) {
    modalVisual.appendChild(visualSource.cloneNode(true));
  }

  // Links (Ver Projeto / Falar sobre este projeto)
  const linksSource = card.querySelector('.card-links');
  const modalLinks = document.getElementById('modal-links');
  modalLinks.innerHTML = '';
  if (linksSource) {
    modalLinks.appendChild(linksSource.cloneNode(true));
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOnOverlay(e) {
  if (e.target.id === 'project-modal') {
    closeModal();
  }
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});