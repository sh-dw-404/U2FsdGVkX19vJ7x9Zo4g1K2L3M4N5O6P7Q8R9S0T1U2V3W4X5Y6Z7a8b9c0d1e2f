const light = document.getElementById("light");
const intro = document.getElementById("intro");

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight * 0.45;

let currentX = targetX;
let currentY = targetY;

let touching = false;

// Finger position
function updateFinger(x, y) {
    targetX = x;
    targetY = y;
}

// Track finger continuously
intro.addEventListener("pointermove", (event) => {
    updateFinger(event.clientX, event.clientY);
});

intro.addEventListener("pointerdown", (event) => {
    touching = true;
    updateFinger(event.clientX, event.clientY);

    light.style.width = "55px";
    light.style.height = "55px";

    light.style.boxShadow = `
        0 0 25px rgba(255,255,255,0.95),
        0 0 80px rgba(255,255,255,0.55),
        0 0 150px rgba(255,255,255,0.25)
    `;
});

intro.addEventListener("pointerup", () => {
    touching = false;

    light.style.width = "22px";
    light.style.height = "22px";

    light.style.boxShadow = `
        0 0 15px rgba(255,255,255,0.8),
        0 0 45px rgba(255,255,255,0.35)
    `;
});

intro.addEventListener("pointercancel", () => {
    touching = false;
});

// Smooth movement
function animate() {

    // Lower number = heavier/smoother
    const smoothness = touching ? 0.18 : 0.12;

    currentX += (targetX - currentX) * smoothness;
    currentY += (targetY - currentY) * smoothness;

    light.style.left = `${currentX}px`;
    light.style.top = `${currentY}px`;

    requestAnimationFrame(animate);
}

animate();