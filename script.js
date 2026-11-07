// Album photos are loaded locally so the website works without a server.
const memoryPhotos = [
  'assets/memories/memory-01.jpg', 'assets/memories/memory-02.jpg',
  'assets/memories/memory-03.jpg', 'assets/memories/memory-04.jpg',
  'assets/memories/memory-05.jpg', 'assets/memories/memory-06.jpg',
  'assets/memories/memory-07.jpg', 'assets/memories/memory-08.jpg',
  'assets/memories/memory-09.jpg', 'assets/memories/memory-10.jpg',
  'assets/memories/memory-11.jpg', 'assets/memories/memory-12.jpg',
  'assets/memories/memory-13.jpg', 'assets/memories/memory-14.jpg',
  'assets/memories/memory-15.jpg', 'assets/memories/memory-16.jpg',
  'assets/memories/memory-17.jpg', 'assets/memories/memory-18.jpg',
  'assets/memories/memory-19.jpg'
];

const screens = [...document.querySelectorAll('.screen')];
const dots = [...document.querySelectorAll('.progress-dot')];
let activeScreen = 0;

function goToScreen(id) {
  const nextIndex = screens.findIndex(screen => screen.id === id);
  if (nextIndex < 0) return;
  activeScreen = nextIndex;
  screens.forEach((screen, index) => {
    const isActive = index === nextIndex;
    screen.classList.toggle('active', isActive);
    screen.setAttribute('aria-hidden', String(!isActive));
  });
  dots.forEach((dot, index) => dot.classList.toggle('active', index === nextIndex));
  if (id === 'treeStory') {
    window.setTimeout(() => {
      makeHeartLeaves(); // Recalculate positions after the hidden screen becomes visible (also fits mobile).
      document.getElementById('treeStage').classList.add('grown');
    }, 120);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('startStory').addEventListener('click', () => goToScreen('treeStory'));
document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => goToScreen(button.dataset.next));
});
document.getElementById('brandHome').addEventListener('click', event => {
  event.preventDefault();
  goToScreen('welcome');
});
document.getElementById('replayStory').addEventListener('click', () => {
  document.getElementById('treeStage').classList.remove('grown');
  goToScreen('welcome');
});

// Make a heart-shaped canopy from tiny heart leaves.
function makeHeartLeaves() {
  const container = document.getElementById('heartLeaves');
  container.replaceChildren();
  const stage = document.getElementById('treeStage');
  const width = stage.clientWidth || 460;
  const height = stage.clientHeight || 485;
  const scale = Math.min(width / 500, height / 560);
  const centerX = width / 2;
  const centerY = 220 * scale;
  const heartScale = 9 * scale;
  const points = [];

  function heartPoint(t, factor = 1) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return { x: centerX + x * heartScale * factor, y: centerY - y * heartScale * factor };
  }
  // Outer outline, followed by two smaller heart-shaped rings for a full canopy.
  [1, .78, .55].forEach((factor, ring) => {
    const count = ring === 0 ? 38 : ring === 1 ? 25 : 16;
    for (let i = 0; i < count; i++) {
      const t = (Math.PI * 2 * i / count) + (ring % 2 ? .07 : 0);
      points.push({ ...heartPoint(t, factor), size: ring === 0 ? 17 : ring === 1 ? 15 : 13 });
    }
  });
  // A few inner leaves fill the silhouette while keeping the heart shape readable.
  const inner = [
    [-.28,-.12],[-.12,-.24],[.10,-.25],[.29,-.12],[-.34,.08],[-.18,.12],[0,.02],[.18,.12],[.34,.08],[-.16,.28],[.15,.28],[0,.38]
  ];
  inner.forEach(([x,y]) => points.push({ x:centerX+x*width*.38, y:centerY+y*height*.29, size:14 }));
  const colors = ['#e98da5','#f2a3b5','#dc7894','#f5b4c2','#d96f8e','#ed9aab'];
  points.forEach((point, i) => {
    const leaf = document.createElement('span');
    leaf.className = 'leaf-heart';
    leaf.textContent = '♥';
    leaf.style.left = `${point.x}px`;
    leaf.style.top = `${point.y}px`;
    leaf.style.fontSize = `${point.size * scale + 2}px`;
    leaf.style.setProperty('--leaf-color', colors[i % colors.length]);
    leaf.style.setProperty('--delay', `${0.55 + i * 0.038}s`);
    leaf.style.setProperty('--rot', `${(i * 31) % 54 - 27}deg`);
    container.appendChild(leaf);
  });
}
// Leaves are created when the tree screen is first shown, so dimensions are measured accurately.

// Soft floating hearts in the background.
const floatingHearts = document.getElementById('floatingHearts');
function addFloatingHeart() {
  const heart = document.createElement('span');
  heart.className = 'float-heart';
  heart.textContent = Math.random() > .45 ? '♡' : '♥';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${10 + Math.random() * 13}px`;
  heart.style.animationDuration = `${9 + Math.random() * 8}s`;
  heart.style.opacity = `${.2 + Math.random() * .35}`;
  floatingHearts.appendChild(heart);
  window.setTimeout(() => heart.remove(), 18000);
}
for (let i = 0; i < 8; i++) window.setTimeout(addFloatingHeart, i * 650);
window.setInterval(addFloatingHeart, 1700);

// 3D carousel: five photos are shown around the selected memory.
const track = document.getElementById('carouselTrack');
const galleryCount = document.getElementById('galleryCount');
const galleryCaption = document.getElementById('galleryCaption');
let currentPhoto = 0;
const cards = memoryPhotos.map((src, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'memory-card';
  card.setAttribute('aria-label', `Mở ảnh kỷ niệm ${index + 1}`);
  const image = document.createElement('img');
  image.src = src;
  image.alt = `Ảnh kỷ niệm ${index + 1}`;
  image.loading = index < 5 ? 'eager' : 'lazy';
  card.appendChild(image);
  card.addEventListener('click', () => {
    const offset = wrappedOffset(index, currentPhoto, memoryPhotos.length);
    if (Math.abs(offset) <= 2 && offset !== 0) {
      currentPhoto = index;
      updateCarousel();
    } else if (offset === 0) {
      openLightbox(index);
    }
  });
  track.appendChild(card);
  return card;
});
function wrappedOffset(index, center, total) {
  let diff = index - center;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}
function updateCarousel() {
  const isMobile = window.matchMedia('(max-width: 680px)').matches;
  const spacing = isMobile ? 91 : (window.innerWidth <= 900 ? 112 : 132);
  cards.forEach((card, index) => {
    const offset = wrappedOffset(index, currentPhoto, cards.length);
    const distance = Math.abs(offset);
    if (distance > 2) {
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
      card.style.zIndex = '0';
      card.style.transform = `translate(-50%,-50%) translateX(${offset * spacing}px) rotateY(${-offset * 27}deg) scale(.65)`;
      card.classList.remove('center-card');
      return;
    }
    const scales = { 0: 1, 1: .87, 2: .72 };
    const opacities = { 0: 1, 1: .76, 2: .42 };
    card.style.opacity = String(opacities[distance]);
    card.style.pointerEvents = 'auto';
    card.style.zIndex = String(10 - distance);
    card.style.transform = `translate(-50%,-50%) translateX(${offset * spacing}px) rotateY(${-offset * 27}deg) scale(${scales[distance]})`;
    card.classList.toggle('center-card', offset === 0);
  });
  galleryCount.textContent = `${String(currentPhoto + 1).padStart(2,'0')} / ${String(memoryPhotos.length).padStart(2,'0')}`;
  galleryCaption.textContent = `Our little memory · ${String(currentPhoto + 1).padStart(2,'0')}`;
}
function nextPhoto(step = 1) {
  currentPhoto = (currentPhoto + step + memoryPhotos.length) % memoryPhotos.length;
  updateCarousel();
}
document.getElementById('galleryPrev').addEventListener('click', () => nextPhoto(-1));
document.getElementById('galleryNext').addEventListener('click', () => nextPhoto(1));
window.addEventListener('resize', updateCarousel);
updateCarousel();
window.setInterval(() => {
  if (screens[2].classList.contains('active') && !document.getElementById('lightbox').classList.contains('open')) nextPhoto(1);
}, 3800);

// Tap the centered photo to view it at a larger size.
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
function openLightbox(index) {
  currentPhoto = index;
  updateCarousel();
  lightboxImage.src = memoryPhotos[index];
  lightboxCaption.textContent = `A little moment, just us · ${String(index + 1).padStart(2,'0')}`;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
}
function stepLightbox(step) {
  nextPhoto(step);
  lightboxImage.src = memoryPhotos[currentPhoto];
  lightboxCaption.textContent = `A little moment, just us · ${String(currentPhoto + 1).padStart(2,'0')}`;
}
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => stepLightbox(-1));
document.getElementById('lightboxNext').addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
  if (lightbox.classList.contains('open') && event.key === 'ArrowRight') stepLightbox(1);
  if (lightbox.classList.contains('open') && event.key === 'ArrowLeft') stepLightbox(-1);
});
