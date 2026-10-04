const light = document.getElementById("light");
const intro = document.getElementById("intro");
const canvas = document.getElementById("particleCanvas");

const ctx = canvas.getContext("2d");


// ========================================
// CANVAS SETUP
// ========================================

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ========================================
// FINGER POSITION
// ========================================

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight * 0.45;

let currentX = targetX;
let currentY = targetY;

let lastX = currentX;
let lastY = currentY;

let isTouching = false;


// ========================================
// PARTICLES
// ========================================

const particles = [];

const MAX_PARTICLES = 180;


function createParticle(x, y, speed) {

    if (particles.length >= MAX_PARTICLES) {
        particles.shift();
    }

    const angle =
        Math.random() * Math.PI * 2;

    const force =
        Math.random() * 1.8 +
        speed * 0.03;

    particles.push({

        x: x,
        y: y,

        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force,

        size:
            Math.random() * 2.2 + 0.6,

        life: 1,

        decay:
            Math.random() * 0.018 + 0.012
    });
}


// ========================================
// FINGER TRACKING
// ========================================

function setFinger(x, y) {

    targetX = x;
    targetY = y;
}


intro.addEventListener(
    "pointerdown",
    function(event) {

        isTouching = true;

        setFinger(
            event.clientX,
            event.clientY
        );

        light.classList.add("active");

    }
);


intro.addEventListener(
    "pointermove",
    function(event) {

        setFinger(
            event.clientX,
            event.clientY
        );

    }
);


intro.addEventListener(
    "pointerup",
    function() {

        isTouching = false;

        light.classList.remove("active");

    }
);


intro.addEventListener(
    "pointercancel",
    function() {

        isTouching = false;

        light.classList.remove("active");

    }
);


// ========================================
// TOUCH FALLBACK
// ========================================

intro.addEventListener(
    "touchstart",
    function(event) {

        isTouching = true;

        const touch = event.touches[0];

        setFinger(
            touch.clientX,
            touch.clientY
        );

    },
    { passive: false }
);


intro.addEventListener(
    "touchmove",
    function(event) {

        event.preventDefault();

        const touch = event.touches[0];

        setFinger(
            touch.clientX,
            touch.clientY
        );

    },
    { passive: false }
);


intro.addEventListener(
    "touchend",
    function() {

        isTouching = false;

    },
    { passive: false }
);


// ========================================
// ANIMATION
// ========================================

function animate() {

    // Smooth movement

    const smoothness =
        isTouching ? 0.22 : 0.12;


    currentX +=
        (targetX - currentX) *
        smoothness;

    currentY +=
        (targetY - currentY) *
        smoothness;


    // Calculate finger speed

    const dx =
        currentX - lastX;

    const dy =
        currentY - lastY;

    const speed =
        Math.sqrt(dx * dx + dy * dy);


    lastX = currentX;
    lastY = currentY;


    // Move light

    light.style.left =
        currentX + "px";

    light.style.top =
        currentY + "px";


    // Create particles while moving

    if (isTouching && speed > 0.5) {

        const amount =
            Math.min(
                5,
                Math.ceil(speed / 4)
            );

        for (let i = 0; i < amount; i++) {

            createParticle(
                currentX,
                currentY,
                speed
            );

        }
    }


    // Draw particles

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];


        p.x += p.vx;
        p.y += p.vy;


        // Slowly slow particles down

        p.vx *= 0.97;
        p.vy *= 0.97;


        p.life -= p.decay;


        if (p.life <= 0) {

            particles.splice(i, 1);

            continue;
        }


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size * p.life,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(255,255,255,${p.life * 0.7})`;

        ctx.fill();
    }


    requestAnimationFrame(animate);
}


animate();