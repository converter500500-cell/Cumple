/* ======================================================
   1. ESCENA, CÁMARA Y RENDER
====================================================== */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050b1e);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); 

/* ======================================================
   🎵 MÚSICA DE FONDO
====================================================== */
const bgMusic = new Audio("musica.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.35;
let musicStarted = false; 

/* ======================================================
   2. TEXTURA DE BRILLO
====================================================== */
function createGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d");

  const g = ctx.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,220,150,0.6)");
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.fillRect(0,0,32,32);
  return new THREE.CanvasTexture(c);
}
const glowTexture = createGlowTexture();

/* ======================================================
   3. FONDO ESTRELLADO
====================================================== */
const starGeometry = new THREE.BufferGeometry();
const stars = [];
for (let i = 0; i < 1000; i++) {
  stars.push((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, -20);
}
starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(stars, 3));
scene.add(new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ color: 0x88aaff, size: 0.12, transparent: true, opacity: 0.8 })
));

/* ======================================================
   4. DESEOS NORMALES + COLORES
====================================================== */
const wishes = [
  { text: "Que la vida te sonría siempre ✨", color: "#ffd700" },
  { text: "Que todos tus sueños se cumplan 💫", color: "#87cefa" },
  { text: "Que nunca te falte amor 🤍", color: "#ffb6c1" },
  { text: "Que cada día sea una nueva alegría 🌷", color: "#ff69b4" },
  { text: "Que tu luz ilumine a todos 🌟", color: "#fff176" },
  { text: "Que la felicidad te encuentre siempre 😊", color: "#98fb98" },
  { text: "Que la calma y la paz te acompañen 🌿", color: "#66cdaa" },
  { text: "Que sigas brillando como eres ✨", color: "#ffa500" },
  { text: "Que la vida te regale momentos mágicos 💖", color: "#da70d6" },
  { text: "Que nunca falten razones para sonreír 😄", color: "#00ced1" },
  { text: "Que tus deseos encuentren camino 🌠", color: "#ff8c00" },
  { text: "Que seas feliz hoy y siempre 💛", color: "#fffacd" },
  { text: "Que el amor te rodee 💞", color: "#ff1493" },
  { text: "Que este año sea inolvidable 🎁", color: "#cdb4db" }
];

function showWishMessage(x, y) {
  const wish = wishes[Math.floor(Math.random() * wishes.length)];
  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = wish.text;
  msg.style.left = `${x}px`;
  msg.style.top = `${y}px`;
  msg.style.color = wish.color;
  msg.style.textShadow = `0 0 20px ${wish.color}`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 10000);
}

/* ======================================================
   5. MENSAJES DORADOS
====================================================== */
const goldenMessages = [
  "Feliz cumpleaños Jackelyn 🎉\nQue tengas más dinero que excusas 💸",
  "Feliz cumpleaños Jackelyn 🎂\nQue encuentres tu sugar viejito 🤑",
  "Feliz cumpleaños Jackelyn ✨\nQue la cuenta bancaria nunca llore",
  "Feliz cumpleaños Jackelyn 🎁\nViajes, lujos y cero estrés ✈️",
  "Feliz cumpleaños Jackelyn 😎\nQue el dinero te persiga",
  "Feliz cumpleaños Jackelyn 💛\nQue el WiFi y la suerte nunca fallen",
  "Feliz cumpleaños Jackelyn 💎\nQue la vida te consienta",
  "Feliz cumpleaños Jackelyn 🌟\nMenos trabajo, más dinero",
  "Feliz cumpleaños Jackelyn 😂\nQue el sugar sea generoso",
  "Feliz cumpleaños Jackelyn 🥂\nBrindando por más billetes"
];

/* ======================================================
   6. ESTRELLAS FUGACES
====================================================== */
const shootingStars = [];
const trails = [];

function createShootingStar() {
  const isGolden = Math.random() < 0.2;

  const star = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: isGolden ? 0xffd700 : 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending
  }));

  star.scale.set(isGolden ? 1.4 : 1.0, isGolden ? 1.4 : 1.0, 1);
  star.position.set(-12 + Math.random() * 8, 6 + Math.random() * 3, 0);
  scene.add(star);

  shootingStars.push({
    sprite: star,
    vx: 0.02 + Math.random() * 0.02,
    vy: -0.02 - Math.random() * 0.02,
    trailTick: 0,
    isGolden
  });
}

function createTrail(x, y) {
  const p = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0x88ccff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
  }));
  p.position.set(x, y, 0);
  p.scale.set(0.4, 0.4, 1);
  scene.add(p);
  trails.push({ sprite: p, life: 0.6 });
}

/* ======================================================
   7. TEXTO DORADO EN PARTÍCULAS
====================================================== */
const textParticles = [];

function forceExplodeGoldenText() {
  textParticles.forEach(p => {
    if (p.phase !== "explode") {
      p.phase = "explode";
      p.vx = (Math.random() - 0.5) * 0.3;
      p.vy = (Math.random() - 0.5) * 0.3;
    }
  });
}

function createGoldenText() {
  const message = goldenMessages[Math.floor(Math.random() * goldenMessages.length)];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1600;
  canvas.height = 500;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";

  const lines = message.split("\n");
  ctx.font = "bold 60px sans-serif";
  ctx.fillText(lines[0], 800, 180);
  ctx.font = "bold 50px sans-serif";
  ctx.fillText(lines[1], 800, 300);

  const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const step = 3;

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      if (data[(y * canvas.width + x) * 4 + 3] > 150) {

        const p = new THREE.Sprite(new THREE.SpriteMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending
        }));

        p.position.set(
          (x - canvas.width / 2) / 60,
          (canvas.height / 2 - y) / 60,
          3
        );

        p.scale.set(0.06, 0.06, 1);
        scene.add(p);

        textParticles.push({
          sprite: p,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          life: 6.0,
          phase: "form",
          timer: 0
        });
      }
    }
  }
}

/* ======================================================
   8. CLICK EN ESTRELLAS
====================================================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", e => {

  if (!musicStarted) {
    bgMusic.volume = 0;
    bgMusic.play().catch(() => {});
    musicStarted = true;

    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      bgMusic.volume = Math.min(v, 0.35);
      if (v >= 0.35) clearInterval(fade);
    }, 200);
  }

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(shootingStars.map(s => s.sprite));
  if (hits.length === 0) return;

  const star = hits[0].object;
  const data = shootingStars.find(s => s.sprite === star);

  if (data.isGolden) {
    forceExplodeGoldenText();
    createGoldenText();
  } else {
    showWishMessage(e.clientX, e.clientY);
  }

  scene.remove(star);
  shootingStars.splice(shootingStars.indexOf(data), 1);
});

/* ======================================================
   9. ANIMACIÓN
====================================================== */
function animate() {
  requestAnimationFrame(animate);

  shootingStars.forEach((s,i) => {
    s.sprite.position.x += s.vx;
    s.sprite.position.y += s.vy;
    s.trailTick++;
    if (s.trailTick % 4 === 0) createTrail(s.sprite.position.x, s.sprite.position.y);
    if (s.sprite.position.y < -10 || s.sprite.position.x > 25) {
      scene.remove(s.sprite);
      shootingStars.splice(i,1);
    }
  });

  trails.forEach((t,i) => {
    t.life -= 0.03;
    t.sprite.material.opacity = t.life;
    if (t.life <= 0) {
      scene.remove(t.sprite);
      trails.splice(i,1);
    }
  });

  textParticles.forEach((p,i) => {
    p.timer += 0.016;

    if (p.phase === "form") {
      p.sprite.material.opacity += 0.04;
      if (p.sprite.material.opacity >= 1) {
        p.phase = "hold";
        p.timer = 0;
      }
    }
    else if (p.phase === "hold") {
      if (p.timer > 3.0) p.phase = "explode";
    }
    else {
      p.sprite.position.x += p.vx;
      p.sprite.position.y += p.vy;
      p.life -= 0.015;
      p.sprite.material.opacity = p.life;
    }

    if (p.life <= 0) {
      scene.remove(p.sprite);
      textParticles.splice(i,1);
    }
  });

  renderer.render(scene, camera);
}

animate();

/* ======================================================
   10. SPAWN
====================================================== */
setInterval(createShootingStar, 900);
