const slides = document.querySelectorAll('#slideshow img');
const caption = document.querySelector('.caption');
const playBtn = document.getElementById('play-btn');

const captions = [
  'Cada foto é uma lembrança de tudo o que já vivemos e um lembrete de tudo o que ainda vamos construir juntos.',
  'Com esse sorriso você conquistou meu coração 😍...',
  'Daí eu tive a oportunidade de vê-la pessoalmente...',
  'Ter um primeiro encontro...',
  'E um primeiro beijo...',
  'Também fizemos uma viagem juntos...',
  'Que deu início ao nosso felizes para sempre..',
  'Ficamos longe por um tempo...',
  'Mas sempre me trouxe para perto...',
  'E foi no mesmo lugar, aonde tudo começou...',
  'Que tive a certeza que queria você por toda a eternidade...',
  'Sei o quanto sou imperfeito...',
  'E o quanto preciso melhorar...',
  'Mas quero fazer isso com e por você...',
  'Não é o fim, mas o começo de uma eternidade juntos!!'
];

let index = 0;
let intervalId = null;
let isPlaying = false;

// Mostrar a imagem atual
function showImage(i) {
  slides.forEach(slide => slide.classList.remove('active', 'zoom-in', 'zoom-out'));
  slides[i].classList.add('active', i % 2 === 0 ? 'zoom-in' : 'zoom-out');
  caption.textContent = captions[i];
}

// Inicializa primeira imagem
showImage(index);

// Avançar imagem
function nextImage() {
  index = (index + 1) % slides.length;
  showImage(index);
}

// Botão Play/Pause
playBtn.addEventListener('click', () => {
  if (!isPlaying) {
    intervalId = setInterval(nextImage, 5000);
    playBtn.textContent = '⏸️';
    isPlaying = true;
  } else {
    clearInterval(intervalId);
    playBtn.textContent = '▶️';
    isPlaying = false;
  }
});

// Seleciona todas as seções
const sections = document.querySelectorAll('section');
let currentSection = 0;

// Função para rolar suavemente até a seção
function scrollToSection(i) {
  sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Botão “next” -> próxima seção
document.getElementById('next').addEventListener('click', () => {
  if (currentSection < sections.length - 1) {
    currentSection++;
    scrollToSection(currentSection);
  }
});

// Botão “prev” -> seção anterior
document.getElementById('prev').addEventListener('click', () => {
  if (currentSection > 0) {
    currentSection--;
    scrollToSection(currentSection);
  }
});