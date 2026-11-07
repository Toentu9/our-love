
// 19 ảnh kỷ niệm nằm cùng thư mục với index.html
const memoryPhotos = Array.from(
  { length: 19 },
  (_, i) => `memory-${String(i + 1).padStart(2, "0")}.jpg`
);

// ==============================
// CHUYỂN TRANG
// ==============================

const screens = [...document.querySelectorAll(".screen")];
const dots = [...document.querySelectorAll(".progress-dot")];

function goToScreen(id) {
  const nextIndex = screens.findIndex(screen => screen.id === id);

  if (nextIndex < 0) return;

  screens.forEach((screen, index) => {
    const active = index === nextIndex;

    screen.classList.toggle("active", active);
    screen.setAttribute("aria-hidden", String(!active));
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === nextIndex);
  });

  if (id === "treeStory") {
    const stage = document.getElementById("treeStage");

    stage?.classList.remove("grown");

    requestAnimationFrame(() => {
      makeHeartLeaves();

      requestAnimationFrame(() => {
        stage?.classList.add("grown");
      });
    });
  }

  if (id === "memories") {
    updateCarousel();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Nút trái tim trang đầu -> trang đếm thời gian
document.getElementById("startStory")?.addEventListener("click", () => {
  goToScreen("togetherTime");
});

// Các nút trái tim chuyển trang
document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => {
    goToScreen(button.dataset.next);
  });
});

// Logo trở về trang đầu
document.getElementById("brandHome")?.addEventListener("click", event => {
  event.preventDefault();

  document.getElementById("treeStage")?.classList.remove("grown");

  goToScreen("welcome");
});

// Nút xem lại câu chuyện
document.getElementById("replayStory")?.addEventListener("click", () => {
  document.getElementById("treeStage")?.classList.remove("grown");

  goToScreen("welcome");
});

// ==============================
// BỘ ĐẾM THỜI GIAN BÊN NHAU
// ==============================

// Ngày bắt đầu: 19/11/2025 lúc 00:00
const relationshipStart = new Date(2025, 10, 19, 0, 0, 0);

function updateTogetherTimer() {
  const now = new Date();

  let elapsed = Math.max(
    0,
    now.getTime() - relationshipStart.getTime()
  );

  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;
  const MINUTE = 60 * 1000;

  const days = Math.floor(elapsed / DAY);
  elapsed %= DAY;

  const hours = Math.floor(elapsed / HOUR);
  elapsed %= HOUR;

  const minutes = Math.floor(elapsed / MINUTE);

  const seconds = Math.floor(
    (now.getTime() - relationshipStart.getTime()) / 1000
  ) % 60;

  const values = {
    daysCount: days,
    hoursCount: hours,
    minutesCount: minutes,
    secondsCount: seconds
  };

  for (const [id, value] of Object.entries(values)) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = String(value).padStart(2, "0");
    }
  }
}

updateTogetherTimer();
window.setInterval(updateTogetherTimer, 1000);

// ==============================
// CÂY TRÁI TIM
// ==============================

function makeHeartLeaves() {
  const container = document.getElementById("heartLeaves");
  const stage = document.getElementById("treeStage");

  if (!container || !stage) return;

  container.replaceChildren();

  const width = stage.clientWidth || 560;
  const height = stage.clientHeight || 580;

  const scale = Math.min(width / 500, height / 560);

  const centerX = width / 2;
  const centerY = 215 * scale;
  const heartScale = 10.8 * scale;

  const points = [];

  // Công thức tạo hình trái tim
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

  // Nhiều lớp lá bao quanh để tán cây đầy hơn
  const rings = [
    { factor: 1, count: 68, size: 15 },
    { factor: 0.91, count: 62, size: 15 },
    { factor: 0.81, count: 56, size: 14 },
    { factor: 0.70, count: 49, size: 14 },
    { factor: 0.58, count: 42, size: 13 },
    { factor: 0.45, count: 32, size: 13 }
  ];

  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i++) {
      const t =
        (Math.PI * 2 * i / ring.count)
        + (ringIndex % 2 ? 0.025 : 0);

      points.push({
        ...heartPoint(t, ring.factor),
        size: ring.size + Math.random() * 2
      });
    }
  });

  // Lấp phần giữa tán cây
  for (let row = 0; row < 13; row++) {
    const yNorm = -0.72 + row * 0.115;

    const half = Math.sqrt(
      Math.max(0.04, 1 - yNorm * yNorm)
    );

    const count = Math.round(7 + half * 13);

    for (let col = 0; col < count; col++) {
      const xNorm = count === 1
        ? 0
        : -half + (2 * half * col / (count - 1));

      const jitterX = (Math.random() - 0.5) * 12 * scale;
      const jitterY = (Math.random() - 0.5) * 12 * scale;

      points.push({
        x: centerX + xNorm * 150 * scale + jitterX,
        y: centerY + yNorm * 104 * scale + jitterY,
        size: 11 + Math.random() * 5
      });
    }
  }

  // Màu lá trái tim đậm hơn
  const colors = [
    "#b93662",
    "#c6426d",
    "#d34b78",
    "#bd315f",
    "#d85a82",
    "#c94a73",
    "#e16a8e",
    "#b82f5c"
  ];

  points.forEach((point, index) => {
    const leaf = document.createElement("span");

    leaf.className = "leaf-heart";
    leaf.textContent = "♥";

    leaf.style.left = `${point.x}px`;
    leaf.style.top = `${point.y}px`;

    leaf.style.fontSize =
      `${point.size * scale + 2}px`;

    leaf.style.setProperty(
      "--leaf-color",
      colors[index % colors.length]
    );

    leaf.style.setProperty(
      "--delay",
      `${0.25 + index * 0.004}s`
    );

    leaf.style.setProperty(
      "--rot",
      `${(index * 29) % 48 - 24}deg`
    );

    container.appendChild(leaf);
  });
}

// ==============================
// TRÁI TIM RƠI XUỐNG
// ==============================

const floatingHearts = document.getElementById("floatingHearts");

function addFloatingHeart() {
  if (!floatingHearts || document.hidden) return;

  const heart = document.createElement("span");

  heart.className = "float-heart";

  heart.textContent = Math.random() > 0.38
    ? "♡"
    : "♥";

  heart.style.left = `${Math.random() * 100}%`;

  heart.style.fontSize =
    `${12 + Math.random() * 19}px`;

  heart.style.animationDuration =
    `${8 + Math.random() * 8}s`;

  const drift = (Math.random() - 0.5) * 150;

  heart.style.setProperty(
    "--drift",
    `${drift}px`
  );

  const opacity = 0.12 + Math.random() * 0.22;

  heart.style.setProperty(
    "--heart-opacity",
    opacity
  );

  floatingHearts.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, 17000);
}

// Tạo nhiều trái tim ngay khi mở trang
for (let i = 0; i < 28; i++) {
  window.setTimeout(addFloatingHeart, i * 180);
}

// Tiếp tục tạo trái tim liên tục
window.setInterval(addFloatingHeart, 360);

// ==============================
// ALBUM ẢNH 3D
// ==============================

const track = document.getElementById("carouselTrack");
const galleryCount = document.getElementById("galleryCount");
const galleryCaption = document.getElementById("galleryCaption");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");

let currentPhoto = 0;
let cards = [];

// Tính khoảng cách giữa ảnh và ảnh chính
function wrappedOffset(index, center, total) {
  let diff = index - center;

  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  return diff;
}

// Cập nhật vị trí album
function updateCarousel() {
  if (
    !track ||
    !galleryCount ||
    !galleryCaption ||
    !cards.length
  ) return;

  const isMobile = window.matchMedia(
    "(max-width: 680px)"
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

    const scale = distance === 0
      ? 1
      : distance === 1
        ? 0.87
        : 0.72;

    const opacity = distance === 0
      ? 1
      : distance === 1
        ? 0.76
        : 0.42;

    card.style.opacity = distance > 2
      ? "0"
      : String(opacity);

    card.style.pointerEvents = distance > 2
      ? "none"
      : "auto";

    card.style.zIndex = String(10 - distance);

    card.style.transform =
      `translate(-50%, -50%) ` +
      `translateX(${offset * spacing}px) ` +
      `rotateY(${-offset * 27}deg) ` +
      `scale(${distance > 2 ? 0.65 : scale})`;

    card.classList.toggle(
      "center-card",
      offset === 0
    );
  });

  galleryCount.textContent =
    `${String(currentPhoto + 1).padStart(2, "0")} / ` +
    `${String(memoryPhotos.length).padStart(2, "0")}`;

  galleryCaption.textContent =
    `Our little memory · ${String(currentPhoto + 1).padStart(2, "0")}`;
}

// Chuyển ảnh
function nextPhoto(step = 1) {
  currentPhoto =
    (currentPhoto + step + memoryPhotos.length)
    % memoryPhotos.length;

  updateCarousel();
}

// Mở ảnh lớn
function openLightbox(index) {
  currentPhoto = index;

  updateCarousel();

  if (lightboxImage) {
    lightboxImage.src = memoryPhotos[index];
  }

  if (lightboxCaption) {
    lightboxCaption.textContent =
      `A little moment, just us · ${String(index + 1).padStart(2, "0")}`;
  }

  lightbox?.classList.add("open");
  lightbox?.setAttribute("aria-hidden", "false");
}

// Đóng ảnh lớn
function closeLightbox() {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("aria-hidden", "true");
}

// Chuyển ảnh trong lightbox
function stepLightbox(step) {
  nextPhoto(step);

  if (lightboxImage) {
    lightboxImage.src = memoryPhotos[currentPhoto];
  }

  if (lightboxCaption) {
    lightboxCaption.textContent =
      `A little moment, just us · ${String(currentPhoto + 1).padStart(2, "0")}`;
  }
}

// Tạo 19 thẻ ảnh
cards = memoryPhotos.map((src, index) => {
  const card = document.createElement("button");

  card.type = "button";
  card.className = "memory-card";

  card.setAttribute(
    "aria-label",
    `Mở ảnh kỷ niệm ${index + 1}`
  );

  const image = document.createElement("img");

  image.src = src;
  image.alt = `Ảnh kỷ niệm ${index + 1}`;
  image.loading = index < 5 ? "eager" : "lazy";

  image.addEventListener("error", () => {
    console.warn(
      `Không tìm thấy ảnh: ${src}. Hãy kiểm tra tên file.`
    );

    card.classList.add("image-missing");
  });

  card.appendChild(image);

  card.addEventListener("click", () => {
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

  track?.appendChild(card);

  return card;
});

// Các nút album
document.getElementById("galleryPrev")?.addEventListener(
  "click",
  () => nextPhoto(-1)
);

document.getElementById("galleryNext")?.addEventListener(
  "click",
  () => nextPhoto(1)
);

// Các nút lightbox
document.getElementById("lightboxClose")?.addEventListener(
  "click",
  closeLightbox
);

document.getElementById("lightboxPrev")?.addEventListener(
  "click",
  () => stepLightbox(-1)
);

document.getElementById("lightboxNext")?.addEventListener(
  "click",
  () => stepLightbox(1)
);

// Bấm ra ngoài ảnh để đóng
lightbox?.addEventListener("click", event => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// Điều khiển bằng bàn phím
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeLightbox();
  }

  if (
    lightbox?.classList.contains("open") &&
    event.key === "ArrowRight"
  ) {
    stepLightbox(1);
  }

  if (
    lightbox?.classList.contains("open") &&
    event.key === "ArrowLeft"
  ) {
    stepLightbox(-1);
  }
});

// Khi thay đổi kích thước màn hình
window.addEventListener("resize", () => {
  updateCarousel();

  if (
    document.getElementById("treeStory")?.classList.contains("active")
  ) {
    makeHeartLeaves();
  }
});

// Khởi tạo album
updateCarousel();

// Tự động xoay album mỗi 3.8 giây
window.setInterval(() => {
  if (
    document.getElementById("memories")?.classList.contains("active") &&
    !lightbox?.classList.contains("open")
  ) {
    nextPhoto(1);
  }
}, 3800);
