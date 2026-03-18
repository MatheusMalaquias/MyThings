const overlay = document.getElementById('overlay');
const posX = document.getElementById('posX');
const posY = document.getElementById('posY');
const size = document.getElementById('size');

posX.addEventListener('input', () => {
  overlay.style.left = `${posX.value}px`;
});
posY.addEventListener('input', () => {
  overlay.style.top = `${posY.value}px`;
});
size.addEventListener('input', () => {
  overlay.style.width = `${size.value}px`;
  overlay.style.height = `${size.value}px`;
});