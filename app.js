const light = document.getElementById("light");
const intro = document.getElementById("intro");

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight * 0.45;

let currentX = targetX;
let currentY = targetY;

let isTouching = false;


// ==============================
// UPDATE FINGER POSITION
// ==============================

function setFinger(x, y) {
    targetX = x;
    targetY = y;
}


// ==============================
// POINTER EVENTS
// ==============================

intro.addEventListener("pointerdown", function (event) {

    isTouching = true;

    setFinger(
        event.clientX,
        event.clientY
    );

    light.classList.add("active");
});


intro.addEventListener("pointermove", function (event) {

    setFinger(
        event.clientX,
        event.clientY
    );

});


intro.addEventListener("pointerup", function () {

    isTouching = false;

    light.classList.remove("active");

});


intro.addEventListener("pointercancel", function () {

    isTouching = false;

    light.classList.remove("active");

});


// ==============================
// TOUCH FALLBACK
// ==============================

intro.addEventListener(
    "touchstart",
    function (event) {

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
    function (event) {

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
    function () {

        isTouching = false;

    },
    { passive: false }
);


// ==============================
// SMOOTH FOLLOW
// ==============================

function animate() {

    const speed = isTouching ? 0.22 : 0.12;

    currentX +=
        (targetX - currentX) * speed;

    currentY +=
        (targetY - currentY) * speed;


    light.style.left = currentX + "px";
    light.style.top = currentY + "px";


    requestAnimationFrame(animate);
}

animate();