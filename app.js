const light = document.getElementById("light");
const intro = document.getElementById("intro");

let lastX = window.innerWidth / 2;
let lastY = window.innerHeight * 0.45;

function moveLight(x, y) {
    lastX = x;
    lastY = y;

    light.style.left = `${x}px`;
    light.style.top = `${y}px`;
}

intro.addEventListener("pointermove", (event) => {
    moveLight(event.clientX, event.clientY);
});

intro.addEventListener("pointerdown", (event) => {

    moveLight(event.clientX, event.clientY);

    light.style.width = "55px";
    light.style.height = "55px";

    light.style.boxShadow = `
        0 0 25px rgba(255,255,255,0.9),
        0 0 80px rgba(255,255,255,0.5),
        0 0 140px rgba(255,255,255,0.25)
    `;
});

intro.addEventListener("pointerup", () => {

    light.style.width = "22px";
    light.style.height = "22px";

    light.style.boxShadow = `
        0 0 15px rgba(255,255,255,0.8),
        0 0 45px rgba(255,255,255,0.35)
    `;
});