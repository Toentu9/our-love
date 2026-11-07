// Album photos live beside index.html, style.css and this file.
const memoryPhotos = Array.from({ length: 19 }, (_, i) => `memory-${String(i + 1).padStart(2, '0')}.jpg`);

const screens = [...document.querySelectorAll('.screen')];
const dots = [...document.querySelectorAll('.progress-dot')];
let activeScreen = 0;

function goToScreen(id) {
  const nextIndex = screens.findIndex(screen => screen.id === id);
  if (nextIndex < 0) return;
  activeScreen = nextIndex;
  screens.forEach((screen, index) => {
    const active = index === nextIndex;
    screen.classList.toggle('active', active);
    screen.setAttribute('aria-hidden', String(!active));
  });
  dots.forEach((dot, index) => dot.classList.toggle('active', index === nextIndex));
  if (id === 'treeStory') {
    const stage = document.getElementById('treeStage');
    stage?.classList.remove('grown');
    requestAnimationFrame(() => {
      makeHeartLeaves();
      requestAnimationFrame(() => stage?.classList.add('grown'));
    });
  }
  if (id === 'memories') updateCarousel();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('startStory')?.addEventListener('click', () => goToScreen('togetherTime'));
document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => goToScreen(button.dataset.next)));
document.getElementById('brandHome')?.addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('treeStage')?.classList.remove('grown');
  goToScreen('welcome');
});
document.getElementById('replayStory')?.addEventListener('click', () => {
  document.getElementById('treeStage')?.classList.remove('grown');
  goToScreen('welcome');
});

// Live elapsed-time counter. The date is interpreted in the visitor's local timezone.
const relationshipStart = new Date(2025, 10, 19, 0, 0, 0);
function updateTogetherTimer() {
  const now = new Date();
  let elapsed = Math.max(0, now.getTime() - relationshipStart.getTime());
  const day = 86400000, hour = 3600000, minute = 60000;
  const days = Math.floor(elapsed / day); elapsed %= day;
  const hours = Math.floor(elapsed / hour); elapsed %= hour;
  const minutes = Math.floor(elapsed / minute);
  const seconds = Math.floor((now.getTime() - relationshipStart.getTime()) / 1000) % 60;
  const values = { daysCount: days, hoursCount: hours, minutesCount: minutes, secondsCount: seconds };
  for (const [id, value] of Object.entries(values)) {
    const node = document.getElementById(id);
    if (node) node.textContent = String(value).padStart(2, '0');
  }
}
updateTogetherTimer();
window.setInterval(updateTogetherTimer, 1000);

// A broad, dense heart-shaped canopy. The trunk and leaves scale with the tree stage.
function makeHeartLeaves() {
  const container = document.getElementById('heartLeaves');
  const stage = document.getElementById('treeStage');
  if (!container || !stage) return;
  container.replaceChildren();

  const width = stage.clientWidth || 560;
  const height = stage.clientHeight || 580;
  const scale = Math.min(width / 500, height / 560);
  const cx = width / 2;
  const cy = 215 * scale;
  const heartScale = 10.8 * scale;
  const points = [];

  function heartPoint(t, factor = 1) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return { x: cx + x * heartScale * factor, y: cy - y * heartScale * factor };
  }

  // Several close rings create a thick outline; extra inner points fill the canopy.
  const rings = [
    { factor: 1, count: 68, size: 15 },
    { factor: .91, count: 62, size: 15 },
    { factor: .81, count: 56, size: 14 },
    { factor: .70, count: 49, size: 14 },
    { factor: .58, count: 42, size: 13 },
    { factor: .45, count: 32, size: 13 }
  ];
  rings.forEach((ring, r) => {
    for (let i = 0; i < ring.count; i++) {
      const t = Math.PI * 2 * i / ring.count + (r % 2 ? .025 : 0);
      points.push({ ...heartPoint(t, ring.factor), size: ring.size + Math.random() * 2 });
    }
  });
  // Dense inner fill, softly randomized while staying inside the heart silhouette.
  for (let row = 0; row < 13; row++) {
    const yNorm = -.72 + row * .115;
    const half = Math.sqrt(Math.max(.04, 1 - yNorm * yNorm));
    const count = Math.round(7 + half * 13);
    for (let col = 0; col < count; col++) {
      const xNorm = count === 1 ? 0 : -half + (2 * half * col / (count - 1));
      const jitterX = (Math.random() - .5) * 12 * scale;
      const jitterY = (Math.random() - .5) * 12 * scale;
      points.push({
        x: cx + xNorm * 150 * scale + jitterX,
        y: cy + yNorm * 104 * scale + jitterY,
        size: 11 + Math.random() * 5
      });
    }
  }

  const colors = ['#b93662','#c6426d','#d34b78','#bd315f','#d85a82','#c94a73','#e16a8e','#b82f5c'];
  points.forEach((point, i) => {
    const leaf = document.createElement('span');
    leaf.className = 'leaf-heart';
    leaf.textContent = '♥';
    leaf.style.left = `${point.x}px`;
    leaf.style.top = `${point.y}px`;
    leaf.style.fontSize = `${point.size * scale + 2}px`;
    leaf.style.setProperty('--leaf-color', colors[i % colors.length]);
    leaf.style.setProperty('--delay', `${.25 + i * .004}s`);
    leaf.style.setProperty('--rot', `${(i * 29) % 48 - 24}deg`);
    container.appendChild(leaf);
  });
}

// Many small, translucent hearts gently fall from the top of the page.
const floatingHearts = document.getElementById('floatingHearts');
function addFloatingHeart() {
  if (!floatingHearts || document.hidden) return;
  const heart = document.createElement('span');
  heart.className = 'float-heart';
  heart.textContent = Math.random() > .38 ? '♡' : '♥';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 19}px`;
  heart.style.animationDuration = `${8 + Math.random() * 8}s`;
  heart.style.setProperty('--drift', `${(Math.random() - .5) * 150}px`);
  heart.style.opacity = `${.12 + Math.random() * .22}`;
  floatingHearts.appendChild(heart);
  window.setTimeout(() => heart.remove(), 17000);
}
for (let i = 0; i < 28; i++) window.setTimeout(addFloatingHeart, i * 180);
window.setInterval(addFloatingHeart, 360);

// 3D memory carousel.
const track = document.getElementById('carouselTrack');
const galleryCount = document.getElementById('galleryCount');
const galleryCaption = document.getElementById('galleryCaption');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
let currentPhoto = 0;
let cards = [];
function wrappedOffset(index, center, total) {
  let diff = index - center;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}
function updateCarousel() {
  if (!track || !galleryCount || !galleryCaption || !cards.length) return;
  const isMobile = window.matchMedia('(max-width: 680px)').matches;
  const spacing = isMobile ? 91 : (window.innerWidth <= 900 ? 112 : 132);
  cards.forEach((card, index) => {
    const offset = wrappedOffset(index, currentPhoto, cards.length);
    const distance = Math.abs(offset);
    const scale = distance === 0 ? 1 : distance === 1 ? .87 : .72;
    const opacity = distance === 0 ? 1 : distance === 1 ? .76 : .42;
    card.style.opacity = distance > 2 ? '0' : String(opacity);
    card.style.pointerEvents = distance > 2 ? 'none' : 'auto';
    card.style.zIndex = String(10 - distance);
    card.style.transform = `translate(-50%,-50%) translateX(${offset * spacing}px) rotateY(${-offset * 27}deg) scale(${distance > 2 ? .65 : scale})`;
    card.classList.toggle('center-card', offset === 0);
  });
  galleryCount.textContent = `${String(currentPhoto + 1).padStart(2,'0')} / ${String(memoryPhotos.length).padStart(2,'0')}`;
  galleryCaption.textContent = `Our little memory · ${String(currentPhoto + 1).padStart(2,'0')}`;
}
function nextPhoto(step = 1) {
  currentPhoto = (currentPhoto + step + memoryPhotos.length) % memoryPhotos.length;
  updateCarousel();
}
function openLightbox(index) {
  currentPhoto = index;
  updateCarousel();
  if (lightboxImage) lightboxImage.src = memoryPhotos[index];
  if (lightboxCaption) lightboxCaption.textContent = `A little moment, just us · ${String(index + 1).padStart(2,'0')}`;
  lightbox?.classList.add('open');
  lightbox?.setAttribute('aria-hidden', 'false');
}
function closeLightbox() {
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
}
function stepLightbox(step) {
  nextPhoto(step);
  if (lightboxImage) lightboxImage.src = memoryPhotos[currentPhoto];
  if (lightboxCaption) lightboxCaption.textContent = `A little moment, just us · ${String(currentPhoto + 1).padStart(2,'0')}`;
}
cards = memoryPhotos.map((src, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'memory-card';
  card.setAttribute('aria-label', `Mở ảnh kỷ niệm ${index + 1}`);
  const image = document.createElement('img');
  image.src = src;
  image.alt = `Ảnh kỷ niệm ${index + 1}`;
  image.loading = index < 5 ? 'eager' : 'lazy';
  image.addEventListener('error', () => card.classList.add('image-missing'));
  card.appendChild(image);
  card.addEventListener('click', () => {
    const offset = wrappedOffset(index, currentPhoto, memoryPhotos.length);
    if (Math.abs(offset) <= 2 && offset !== 0) { currentPhoto = index; updateCarousel(); }
    else if (offset === 0) openLightbox(index);
  });
  track?.appendChild(card);
  return card;
});
document.getElementById('galleryPrev')?.addEventListener('click', () => nextPhoto(-1));
document.getElementById('galleryNext')?.addEventListener('click', () => nextPhoto(1));
document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev')?.addEventListener('click', () => stepLightbox(-1));
document.getElementById('lightboxNext')?.addEventListener('click', () => stepLightbox(1));
lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
  if (lightbox?.classList.contains('open') && event.key === 'ArrowRight') stepLightbox(1);
  if (lightbox?.classList.contains('open') && event.key === 'ArrowLeft') stepLightbox(-1);
});
window.addEventListener('resize', () => {
  updateCarousel();
  if (document.getElementById('treeStory')?.classList.contains('active')) makeHeartLeaves();
});
updateCarousel();
window.setInterval(() => {
  if (document.getElementById('memories')?.classList.contains('active') && !lightbox?.classList.contains('open')) nextPhoto(1);
}, 3800);
