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
const MAX_PARTICLES = 300;

let ripple = null;
let universeInitialized = false;


// ========================================
// CREATE TOUCH PARTICLE
// ========================================

function createParticle(x, y, speed) {

    if (particles.length >= MAX_PARTICLES) {
        particles.shift();
    }

    const angle = Math.random() * Math.PI * 2;

    const distance = Math.random() * 25 + 5;

    const force = Math.random() * 1.2 + speed * 0.02;

    particles.push({

        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,

        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force,

        size: Math.random() * 2.2 + 0.6,

        life: 1,

        decay: Math.random() * 0.014 + 0.008
    });
}


// ========================================
// CREATE AMBIENT UNIVERSE
// ========================================

function initializeUniverse() {

    if (universeInitialized) return;

    for (let i = 0; i < MAX_PARTICLES; i++) {

        particles.push({

            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,

            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,

            size: Math.random() * 1.8 + 0.4,

            life: Math.random() * 0.7 + 0.3,

            decay: 0
        });
    }

    universeInitialized = true;
}

initializeUniverse();


// ========================================
// FINGER TRACKING
// ========================================

function setFinger(x, y) {

    targetX = x;
    targetY = y;
}


intro.addEventListener("pointerdown", function(event) {

    isTouching = true;

    setFinger(
        event.clientX,
        event.clientY
    );

    light.classList.add("active");

    ripple = {

        x: event.clientX,
        y: event.clientY,

        radius: 0,

        strength: 1
    };
});


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

        ripple = {

            x: touch.clientX,
            y: touch.clientY,

            radius: 0,

            strength: 1
        };

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

    // ------------------------------------
    // Smooth finger movement
    // ------------------------------------

    const smoothness =
        isTouching ? 0.22 : 0.12;

    currentX +=
        (targetX - currentX) *
        smoothness;

    currentY +=
        (targetY - currentY) *
        smoothness;


    // ------------------------------------
    // Finger speed
    // ------------------------------------

    const fingerDX =
        currentX - lastX;

    const fingerDY =
        currentY - lastY;

    const speed =
        Math.sqrt(
            fingerDX * fingerDX +
            fingerDY * fingerDY
        );

    lastX = currentX;
    lastY = currentY;


    // ------------------------------------
    // Move light
    // ------------------------------------

    light.style.left =
        currentX + "px";

    light.style.top =
        currentY + "px";


    // ------------------------------------
    // Create particles while touching
    // ------------------------------------

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


    // ------------------------------------
    // Clear canvas
    // ------------------------------------

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    // ------------------------------------
    // Ripple
    // ------------------------------------

    if (ripple) {

        ripple.radius += 7;

        ripple.strength *= 0.96;


        ctx.beginPath();

        ctx.arc(
            ripple.x,
            ripple.y,
            ripple.radius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            `rgba(255,255,255,${ripple.strength * 0.35})`;

        ctx.lineWidth = 1.5;

        ctx.stroke();


        if (ripple.strength < 0.03) {

            ripple = null;
        }
    }


    // ------------------------------------
    // PARTICLE PHYSICS
    // ------------------------------------

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p = particles[i];


        // --------------------------------
        // Finger attraction / repulsion
        // --------------------------------

        const dx =
            currentX - p.x;

        const dy =
            currentY - p.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            isTouching &&
            distance < 180
        ) {

            const force =
                (180 - distance) / 180;

            p.vx +=
                (dx / (distance || 1)) *
                force *
                0.08;

            p.vy +=
                (dy / (distance || 1)) *
                force *
                0.08;
        }


        if (
            isTouching &&
            distance < 45
        ) {

            const force =
                (45 - distance) / 45;

            p.vx -=
                (dx / (distance || 1)) *
                force *
                0.35;

            p.vy -=
                (dy / (distance || 1)) *
                force *
                0.35;
        }


        // --------------------------------
        // Ripple force
        // --------------------------------

        if (ripple) {

            const rippleDX =
                p.x - ripple.x;

            const rippleDY =
                p.y - ripple.y;

            const rippleDistance =
                Math.sqrt(
                    rippleDX * rippleDX +
                    rippleDY * rippleDY
                );

            const ringWidth = 35;


            if (
                rippleDistance >
                    ripple.radius - ringWidth &&

                rippleDistance <
                    ripple.radius + ringWidth
            ) {

                const force =
                    ripple.strength *
                    (
                        1 -
                        Math.abs(
                            rippleDistance -
                            ripple.radius
                        ) /
                        ringWidth
                    );


                p.vx +=
                    (rippleDX /
                        (rippleDistance || 1)) *
                    force *
                    2;

                p.vy +=
                    (rippleDY /
                        (rippleDistance || 1)) *
                    force *
                    2;
            }
        }


        // --------------------------------
        // Move particle
        // --------------------------------

        p.x += p.vx;
        p.y += p.vy;


        // --------------------------------
        // Slow particle
        // --------------------------------

        p.vx *= 0.985;
        p.vy *= 0.985;


        // --------------------------------
        // Ambient particle life
        // --------------------------------

        if (p.decay > 0) {

            p.life -= p.decay;
        }


        // --------------------------------
        // Remove dead particles
        // --------------------------------

        if (p.life <= 0) {

            particles.splice(i, 1);

            continue;
        }


        // --------------------------------
        // Screen wrapping
        // --------------------------------

        if (p.x < -10) {
            p.x = window.innerWidth + 10;
        }

        if (p.x > window.innerWidth + 10) {
            p.x = -10;
        }

        if (p.y < -10) {
            p.y = window.innerHeight + 10;
        }

        if (p.y > window.innerHeight + 10) {
            p.y = -10;
        }


        // --------------------------------
        // Draw particle
        // --------------------------------

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size * Math.max(p.life, 0.3),
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(
                255,
                255,
                255,
                ${Math.max(p.life, 0.3) * 0.7}
            )`;

        ctx.fill();
    }


    // ------------------------------------
    // Continue animation
    // ------------------------------------

    requestAnimationFrame(animate);
}


animate();