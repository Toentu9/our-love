// Album photos are loaded locally.
const memoryPhotos = [
  'memory-01.jpg', 'memory-02.jpg',
  'memory-03.jpg', 'memory-04.jpg',
  'memory-05.jpg', 'memory-06.jpg',
  'memory-07.jpg', 'memory-08.jpg',
  'memory-09.jpg', 'memory-10.jpg',
  'memory-11.jpg', 'memory-12.jpg',
  'memory-13.jpg', 'memory-14.jpg',
  'memory-15.jpg', 'memory-16.jpg',
  'memory-17.jpg', 'memory-18.jpg',
  'memory-19.jpg'
];

const screens = [...document.querySelectorAll('.screen')];
const dots = [...document.querySelectorAll('.progress-dot')];

let activeScreen = 0;

function getElement(id) {
  return document.getElementById(id);
}

// Chuyển màn hình
function goToScreen(id) {
  const nextIndex = screens.findIndex(screen => screen.id === id);

  if (nextIndex < 0) return;

  activeScreen = nextIndex;

  screens.forEach((screen, index) => {
    const isActive = index === nextIndex;
    screen.classList.toggle('active', isActive);
    screen.setAttribute('aria-hidden', String(!isActive));
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === nextIndex);
  });

  if (id === 'treeStory') {
    window.setTimeout(() => {
      makeHeartLeaves();

      const treeStage = getElement('treeStage');
      if (treeStage) treeStage.classList.add('grown');
    }, 120);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Các nút chuyển màn hình
getElement('startStory')?.addEventListener('click', () => {
  goToScreen('treeStory');
});

document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => {
    goToScreen(button.dataset.next);
  });
});

getElement('brandHome')?.addEventListener('click', event => {
  event.preventDefault();
  goToScreen('welcome');
});

getElement('replayStory')?.addEventListener('click', () => {
  getElement('treeStage')?.classList.remove('grown');
  goToScreen('welcome');
});

// Tạo tán cây hình trái tim
function makeHeartLeaves() {
  const container = getElement('heartLeaves');
  const stage = getElement('treeStage');

  if (!container || !stage) return;

  container.replaceChildren();

  const width = stage.clientWidth || 460;
  const height = stage.clientHeight || 485;
  const scale = Math.min(width / 500, height / 560);

  const centerX = width / 2;
  const centerY = 220 * scale;
  const heartScale = 9 * scale;

  const points = [];

  function heartPoint(t, factor = 1) {
    const x = 16 * Math.pow(Math.sin(t), 3);

    const y =
      13 * Math.cos(t)
      - 5 * Math.cos(2 * t)
      - 2 * Math.cos(3 * t)
      - Math.cos(4 * t);

    return {
      x: centerX + x * heartScale * factor,
      y: centerY - y * heartScale * factor
    };
  }

  [1, 0.78, 0.55].forEach((factor, ring) => {
    const count = ring === 0 ? 38 : ring === 1 ? 25 : 16;

    for (let i = 0; i < count; i++) {
      const t =
        (Math.PI * 2 * i / count)
        + (ring % 2 ? 0.07 : 0);

      points.push({
        ...heartPoint(t, factor),
        size: ring === 0 ? 17 : ring === 1 ? 15 : 13
      });
    }
  });

  const inner = [
    [-0.28, -0.12], [-0.12, -0.24],
    [0.10, -0.25], [0.29, -0.12],
    [-0.34, 0.08], [-0.18, 0.12],
    [0, 0.02], [0.18, 0.12],
    [0.34, 0.08], [-0.16, 0.28],
    [0.15, 0.28], [0, 0.38]
  ];

  inner.forEach(([x, y]) => {
    points.push({
      x: centerX + x * width * 0.38,
      y: centerY + y * height * 0.29,
      size: 14
    });
  });

  const colors = [
    '#e98da5', '#f2a3b5', '#dc7894',
    '#f5b4c2', '#d96f8e', '#ed9aab'
  ];

  points.forEach((point, i) => {
    const leaf = document.createElement('span');

    leaf.className = 'leaf-heart';
    leaf.textContent = '♥';

    leaf.style.left = `${point.x}px`;
    leaf.style.top = `${point.y}px`;
    leaf.style.fontSize = `${point.size * scale + 2}px`;

    leaf.style.setProperty(
      '--leaf-color',
      colors[i % colors.length]
    );

    leaf.style.setProperty(
      '--delay',
      `${0.55 + i * 0.038}s`
    );

    leaf.style.setProperty(
      '--rot',
      `${(i * 31) % 54 - 27}deg`
    );

    container.appendChild(leaf);
  });
}

// Trái tim bay trong nền
const floatingHearts = getElement('floatingHearts');

function addFloatingHeart() {
  if (!floatingHearts) return;

  const heart = document.createElement('span');

  heart.className = 'float-heart';
  heart.textContent = Math.random() > 0.45 ? '♡' : '♥';

  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${10 + Math.random() * 13}px`;
  heart.style.animationDuration = `${9 + Math.random() * 8}s`;
  heart.style.opacity = `${0.2 + Math.random() * 0.35}`;

  floatingHearts.appendChild(heart);

  window.setTimeout(() => heart.remove(), 18000);
}

for (let i = 0; i < 8; i++) {
  window.setTimeout(addFloatingHeart, i * 650);
}

window.setInterval(addFloatingHeart, 1700);

// Carousel ảnh kỷ niệm 3D
const track = getElement('carouselTrack');
const galleryCount = getElement('galleryCount');
const galleryCaption = getElement('galleryCaption');

let currentPhoto = 0;
let cards = [];

function wrappedOffset(index, center, total) {
  let diff = index - center;

  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  return diff;
}

// Hộp ảnh phóng to
const lightbox = getElement('lightbox');
const lightboxImage = getElement('lightboxImage');
const lightboxCaption = getElement('lightboxCaption');

function openLightbox(index) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;

  currentPhoto = index;
  updateCarousel();

  lightboxImage.src = memoryPhotos[index];

  lightboxCaption.textContent =
    `A little moment, just us · ${String(index + 1).padStart(2, '0')}`;

  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

function stepLightbox(step) {
  if (!lightboxImage || !lightboxCaption) return;

  nextPhoto(step);

  lightboxImage.src = memoryPhotos[currentPhoto];

  lightboxCaption.textContent =
    `A little moment, just us · ${String(currentPhoto + 1).padStart(2, '0')}`;
}

// Tạo các thẻ ảnh
if (track) {
  cards = memoryPhotos.map((src, index) => {
    const card = document.createElement('button');

    card.type = 'button';
    card.className = 'memory-card';

    card.setAttribute(
      'aria-label',
      `Mở ảnh kỷ niệm ${index + 1}`
    );

    const image = document.createElement('img');

    image.src = src;
    image.alt = `Ảnh kỷ niệm ${index + 1}`;
    image.loading = index < 5 ? 'eager' : 'lazy';

    image.addEventListener('error', () => {
      console.warn(`Không tìm thấy ảnh: ${src}`);
    });

    card.appendChild(image);

    card.addEventListener('click', () => {
      const offset = wrappedOffset(
        index,
        currentPhoto,
        memoryPhotos.length
      );

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
}

// Cập nhật vị trí carousel
function updateCarousel() {
  if (!cards.length) return;

  const isMobile = window.matchMedia(
    '(max-width: 680px)'
  ).matches;

  const spacing = isMobile
    ? 91
    : window.innerWidth <= 900
      ? 112
      : 132;

  cards.forEach((card, index) => {
    const offset = wrappedOffset(
      index,
      currentPhoto,
      cards.length
    );

    const distance = Math.abs(offset);

    if (distance > 2) {
      card.style.opacity = '0';
      card.style.pointerEvents = 'none';
      card.style.zIndex = '0';

      card.style.transform =
        `translate(-50%,-50%) translateX(${offset * spacing}px) rotateY(${-offset * 27}deg) scale(.65)`;

      card.classList.remove('center-card');
      return;
    }

    const scales = {
      0: 1,
      1: 0.87,
      2: 0.72
    };

    const opacities = {
      0: 1,
      1: 0.76,
      2: 0.42
    };

    card.style.opacity = String(opacities[distance]);
    card.style.pointerEvents = 'auto';
    card.style.zIndex = String(10 - distance);

    card.style.transform =
      `translate(-50%,-50%) translateX(${offset * spacing}px) rotateY(${-offset * 27}deg) scale(${scales[distance]})`;

    card.classList.toggle('center-card', offset === 0);
  });

  if (galleryCount) {
    galleryCount.textContent =
      `${String(currentPhoto + 1).padStart(2, '0')} / ${String(memoryPhotos.length).padStart(2, '0')}`;
  }

  if (galleryCaption) {
    galleryCaption.textContent =
      `Our little memory · ${String(currentPhoto + 1).padStart(2, '0')}`;
  }
}

// Chuyển ảnh trước / sau
function nextPhoto(step = 1) {
  currentPhoto =
    (currentPhoto + step + memoryPhotos.length)
    % memoryPhotos.length;

  updateCarousel();
}

getElement('galleryPrev')?.addEventListener('click', () => {
  nextPhoto(-1);
});

getElement('galleryNext')?.addEventListener('click', () => {
  nextPhoto(1);
});

// Tự động xoay ảnh
window.addEventListener('resize', updateCarousel);

updateCarousel();

window.setInterval(() => {
  const galleryScreen = screens[2];

  if (
    galleryScreen &&
    galleryScreen.classList.contains('active') &&
    lightbox &&
    !lightbox.classList.contains('open')
  ) {
    nextPhoto(1);
  }
}, 3800);

// Các nút trong lightbox
getElement('lightboxClose')?.addEventListener(
  'click',
  closeLightbox
);

getElement('lightboxPrev')?.addEventListener('click', () => {
  stepLightbox(-1);
});

getElement('lightboxNext')?.addEventListener('click', () => {
  stepLightbox(1);
});

lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// Điều khiển bằng bàn phím
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (lightbox?.classList.contains('open')) {
    if (event.key === 'ArrowRight') {
      stepLightbox(1);
    }

    if (event.key === 'ArrowLeft') {
      stepLightbox(-1);
    }
  }
});
