"use strict";

/*
============================================================
BIRTHDAY UNIVERSE
V6 → V19 COMPLETE ENGINE

V6  - Particle Universe
V7  - Cinematic Transition
V8  - Audio Engine
V9  - Voice Engine
V10 - Memory System
V11 - Interactive Chat
V12 - Photo World
V13 - Video Memories
V14 - Open When Letters
V15 - 365 Reasons
V16 - Distance Chapter
V17 - Secret Mechanics
V18 - Final Cinematic
V19 - Mobile Optimization
============================================================
*/


/* =========================================================
   CORE ELEMENTS
========================================================= */

const light = document.getElementById("light");
const intro = document.getElementById("intro");
const canvas = document.getElementById("particleCanvas");

if (!light || !intro || !canvas) {
    throw new Error(
        "Required elements missing: #light, #intro or #particleCanvas"
    );
}

const ctx = canvas.getContext("2d");


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    particleCount: 260,

    maxParticles: 420,

    trailParticles: 5,

    particleAttractionRadius: 180,

    particleRepulsionRadius: 45,

    rippleSpeed: 7,

    rippleDecay: 0.955,

    reducedMotion:
        window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches

};


/* =========================================================
   STATE
========================================================= */

const state = {

    width: 0,
    height: 0,

    targetX: 0,
    targetY: 0,

    currentX: 0,
    currentY: 0,

    lastX: 0,
    lastY: 0,

    touching: false,

    pointerInside: false,

    particles: [],

    ripple: null,

    initialized: false,

    started: false,

    currentScene: "intro",

    secretTaps: 0,

    lastSecretTap: 0,

    audio: null,

    voice: null,

    audioReady: false,

    voiceReady: false,

    finalMode: false,

    animationFrame: null

};


/* =========================================================
   USER CONTENT
   Replace these later with your real material.
========================================================= */

const DATA = {

    memories: [

        {
            title: "The beginning",
            text: "Replace this with the first memory you want to preserve."
        },

        {
            title: "That moment",
            text: "A conversation, screenshot, joke or moment that still makes you smile."
        },

        {
            title: "One of my favorites",
            text: "This space will eventually contain one of your actual memories."
        },

        {
            title: "Another memory",
            text: "Add another moment from your story here."
        }

    ],


    letters: [

        {
            title: "you miss me",
            text:
                "I know the distance can feel heavy sometimes. " +
                "But if you are reading this, remember that " +
                "distance never erased what you mean to me."
        },

        {
            title: "you are sad",
            text:
                "You don't have to be okay every second. " +
                "Take your time. Breathe. And remember that " +
                "there is someone somewhere thinking about you."
        },

        {
            title: "you need a smile",
            text:
                "Consider this your official reminder that " +
                "you are ridiculously easy to care about."
        },

        {
            title: "it's your birthday",
            text:
                "Today belongs to you. Another year of you " +
                "existing in this world is worth celebrating."
        }

    ],


    chat: [

        {
            sender: "me",
            text: "Do you remember how all of this started?"
        },

        {
            sender: "you",
            text: "Maybe."
        },

        {
            sender: "me",
            text: "I remember enough."
        },

        {
            sender: "me",
            text: "And somehow, here we are."
        }

    ],


    reasons: [

        "Your laugh.",

        "The way you make ordinary moments memorable.",

        "The little things you probably don't even realize I notice.",

        "The fact that you are simply you.",

        "The conversations that somehow turn into hours.",

        "The memories we already have.",

        "The memories we haven't made yet.",

        "Because the world feels slightly different when you are in it.",

        "Because there is still so much I want to experience with you.",

        "Because you matter to me."

    ]

};


/* =========================================================
   UTILITY
========================================================= */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


function random(min, max) {

    return Math.random() *
        (max - min) +
        min;

}


function distance(x1, y1, x2, y2) {

    return Math.hypot(
        x1 - x2,
        y1 - y2
    );

}


/* =========================================================
   V19 — MOBILE VIEWPORT
========================================================= */

function getSceneRect() {

    return intro.getBoundingClientRect();

}


function resizeCanvas() {

    const rect =
        getSceneRect();

    state.width =
        Math.max(
            1,
            rect.width
        );

    state.height =
        Math.max(
            1,
            rect.height
        );

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        Math.round(
            state.width * dpr
        );

    canvas.height =
        Math.round(
            state.height * dpr
        );


    canvas.style.width =
        state.width + "px";

    canvas.style.height =
        state.height + "px";


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    state.targetX =
        clamp(
            state.targetX,
            0,
            state.width
        );

    state.targetY =
        clamp(
            state.targetY,
            0,
            state.height
        );


    state.currentX =
        clamp(
            state.currentX,
            0,
            state.width
        );

    state.currentY =
        clamp(
            state.currentY,
            0,
            state.height
        );

}


/* =========================================================
   V19 — EXACT TOUCH COORDINATES
========================================================= */

function localPoint(
    clientX,
    clientY
) {

    const rect =
        getSceneRect();


    return {

        x:
            clientX -
            rect.left,

        y:
            clientY -
            rect.top

    };

}


/* =========================================================
   V6 — PARTICLE UNIVERSE
========================================================= */

function createAmbientParticle() {

    return {

        x:
            random(
                0,
                state.width
            ),

        y:
            random(
                0,
                state.height
            ),

        vx:
            random(
                -0.12,
                0.12
            ),

        vy:
            random(
                -0.12,
                0.12
            ),

        size:
            random(
                0.4,
                1.8
            ),

        life:
            random(
                0.35,
                1
            ),

        decay: 0,

        ambient: true

    };

}


function initializeUniverse() {

    state.particles.length = 0;


    for (
        let i = 0;
        i < CONFIG.particleCount;
        i++
    ) {

        state.particles.push(
            createAmbientParticle()
        );

    }


    state.initialized =
        true;

}


/* =========================================================
   V3/V4 — TOUCH PARTICLES
========================================================= */

function createTrailParticle(
    x,
    y,
    speed
) {

    if (
        state.particles.length >=
        CONFIG.maxParticles
    ) {

        let removeIndex =
            state.particles.findIndex(
                particle =>
                    particle.ambient
            );


        if (removeIndex < 0) {
            removeIndex = 0;
        }


        state.particles.splice(
            removeIndex,
            1
        );

    }


    const angle =
        random(
            0,
            Math.PI * 2
        );


    const distanceFromFinger =
        random(
            5,
            30
        );


    const force =
        random(
            0.4,
            1.3
        ) +
        speed *
        0.02;


    state.particles.push({

        x:
            x +
            Math.cos(angle) *
            distanceFromFinger,

        y:
            y +
            Math.sin(angle) *
            distanceFromFinger,

        vx:
            Math.cos(angle) *
            force,

        vy:
            Math.sin(angle) *
            force,

        size:
            random(
                0.6,
                2.8
            ),

        life: 1,

        decay:
            random(
                0.008,
                0.022
            ),

        ambient: false

    });

}


/* =========================================================
   V5 — RIPPLE
========================================================= */

function createRipple(
    clientX,
    clientY
) {

    const point =
        localPoint(
            clientX,
            clientY
        );


    state.ripple = {

        x: point.x,

        y: point.y,

        radius: 0,

        strength: 1

    };

}


/* =========================================================
   POINTER HANDLING
========================================================= */

function setPointer(
    clientX,
    clientY,
    snap
) {

    const point =
        localPoint(
            clientX,
            clientY
        );


    state.targetX =
        point.x;

    state.targetY =
        point.y;


    if (snap) {

        state.currentX =
            point.x;

        state.currentY =
            point.y;

        state.lastX =
            point.x;

        state.lastY =
            point.y;


        light.style.left =
            point.x + "px";

        light.style.top =
            point.y + "px";

    }

}


intro.addEventListener(
    "pointerdown",
    event => {

        state.touching =
            true;

        state.pointerInside =
            true;


        setPointer(
            event.clientX,
            event.clientY,
            true
        );


        createRipple(
            event.clientX,
            event.clientY
        );


        light.classList.add(
            "active"
        );

    },
    {
        passive: true
    }
);


intro.addEventListener(
    "pointermove",
    event => {

        state.pointerInside =
            true;


        setPointer(
            event.clientX,
            event.clientY,
            false
        );

    },
    {
        passive: true
    }
);


function releasePointer() {

    state.touching =
        false;

    light.classList.remove(
        "active"
    );

}


intro.addEventListener(
    "pointerup",
    releasePointer
);


intro.addEventListener(
    "pointercancel",
    releasePointer
);


/* =========================================================
   V6-V18 — PARTICLE ANIMATION
========================================================= */

function updateParticles() {

    for (
        let i =
            state.particles.length - 1;

        i >= 0;

        i--
    ) {

        const p =
            state.particles[i];


        const dx =
            state.currentX -
            p.x;


        const dy =
            state.currentY -
            p.y;


        const d =
            Math.hypot(
                dx,
                dy
            ) || 1;


        /* ---------------------------------
           Finger attraction
        --------------------------------- */

        if (
            state.touching &&
            d < CONFIG.particleAttractionRadius
        ) {

            const force =
                (
                    CONFIG.particleAttractionRadius -
                    d
                ) /
                CONFIG.particleAttractionRadius;


            p.vx +=
                (
                    dx / d
                ) *
                force *
                0.075;


            p.vy +=
                (
                    dy / d
                ) *
                force *
                0.075;

        }


        /* ---------------------------------
           Finger repulsion
        --------------------------------- */

        if (
            state.touching &&
            d < CONFIG.particleRepulsionRadius
        ) {

            const force =
                (
                    CONFIG.particleRepulsionRadius -
                    d
                ) /
                CONFIG.particleRepulsionRadius;


            p.vx -=
                (
                    dx / d
                ) *
                force *
                0.34;


            p.vy -=
                (
                    dy / d
                ) *
                force *
                0.34;

        }


        /* ---------------------------------
           Ripple
        --------------------------------- */

        if (state.ripple) {

            const rx =
                p.x -
                state.ripple.x;


            const ry =
                p.y -
                state.ripple.y;


            const rd =
                Math.hypot(
                    rx,
                    ry
                ) || 1;


            const ring =
                36;


            if (
                rd >
                    state.ripple.radius -
                    ring &&

                rd <
                    state.ripple.radius +
                    ring
            ) {

                const force =
                    state.ripple.strength *
                    (
                        1 -
                        Math.abs(
                            rd -
                            state.ripple.radius
                        ) /
                        ring
                    );


                p.vx +=
                    (
                        rx / rd
                    ) *
                    force *
                    1.8;


                p.vy +=
                    (
                        ry / rd
                    ) *
                    force *
                    1.8;

            }

        }


        /* ---------------------------------
           Ambient drift
        --------------------------------- */

        if (p.ambient) {

            p.vx +=
                random(
                    -0.003,
                    0.003
                );

            p.vy +=
                random(
                    -0.003,
                    0.003
                );

        }


        /* ---------------------------------
           Move
        --------------------------------- */

        p.x +=
            p.vx;

        p.y +=
            p.vy;


        /* ---------------------------------
           Friction
        --------------------------------- */

        p.vx *=
            p.ambient
                ? 0.995
                : 0.985;

        p.vy *=
            p.ambient
                ? 0.995
                : 0.985;


        /* ---------------------------------
           Trail life
        --------------------------------- */

        if (!p.ambient) {

            p.life -=
                p.decay;

        }


        /* ---------------------------------
           Wrap around screen
        --------------------------------- */

        if (p.x < -10) {
            p.x =
                state.width + 10;
        }

        if (
            p.x >
            state.width + 10
        ) {
            p.x = -10;
        }

        if (p.y < -10) {
            p.y =
                state.height + 10;
        }

        if (
            p.y >
            state.height + 10
        ) {
            p.y = -10;
        }


        /* ---------------------------------
           Remove dead trail particles
        --------------------------------- */

        if (
            p.life <= 0
        ) {

            state.particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   DRAW PARTICLES
========================================================= */

function drawParticles() {

    ctx.clearRect(
        0,
        0,
        state.width,
        state.height
    );


    /* ---------------------------------
       Ripple ring
    --------------------------------- */

    if (state.ripple) {

        state.ripple.radius +=
            CONFIG.reducedMotion
                ? 14
                : CONFIG.rippleSpeed;


        state.ripple.strength *=
            CONFIG.rippleDecay;


        ctx.beginPath();


        ctx.arc(
            state.ripple.x,
            state.ripple.y,
            state.ripple.radius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            `rgba(
                255,
                255,
                255,
                ${state.ripple.strength * 0.35}
            )`;


        ctx.lineWidth =
            1.5;


        ctx.stroke();


        if (
            state.ripple.strength <
            0.03
        ) {

            state.ripple =
                null;

        }

    }


    /* ---------------------------------
       Particles
    --------------------------------- */

    for (
        const p of state.particles
    ) {

        const alpha =
            p.ambient
                ? 0.38
                : Math.max(
                    0.12,
                    p.life * 0.75
                );


        const size =
            p.ambient
                ? p.size
                : p.size *
                  Math.max(
                      p.life,
                      0.15
                  );


        ctx.beginPath();


        ctx.arc(
            p.x,
            p.y,
            Math.max(
                0.35,
                size
            ),
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            `rgba(
                255,
                255,
                255,
                ${alpha}
            )`;


        ctx.fill();

    }

}


/* =========================================================
   V18 — FINAL CINEMATIC PARTICLE MODE
========================================================= */

function finalParticleMode() {

    state.finalMode =
        true;


    state.touching =
        false;


    light.classList.remove(
        "active"
    );


    for (
        const p of state.particles
    ) {

        const centerX =
            state.width / 2;

        const centerY =
            state.height / 2;


        const dx =
            centerX -
            p.x;


        const dy =
            centerY -
            p.y;


        const d =
            Math.hypot(
                dx,
                dy
            ) || 1;


        p.vx +=
            dx / d *
            0.015;

        p.vy +=
            dy / d *
            0.015;

    }

}


/* =========================================================
   MASTER ANIMATION
========================================================= */

function animate() {

    const smoothness =
        state.touching
            ? 0.23
            : 0.11;


    state.currentX +=
        (
            state.targetX -
            state.currentX
        ) *
        smoothness;


    state.currentY +=
        (
            state.targetY -
            state.currentY
        ) *
        smoothness;


    const dx =
        state.currentX -
        state.lastX;


    const dy =
        state.currentY -
        state.lastY;


    const speed =
        Math.hypot(
            dx,
            dy
        );


    state.lastX =
        state.currentX;

    state.lastY =
        state.currentY;


    light.style.left =
        state.currentX + "px";

    light.style.top =
        state.currentY + "px";


    /* ---------------------------------
       Trail generation
    --------------------------------- */

    if (
        state.touching &&
        speed > 0.45
    ) {

        const amount =
            Math.min(
                CONFIG.trailParticles,
                Math.ceil(
                    speed / 4
                )
            );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            createTrailParticle(
                state.currentX,
                state.currentY,
                speed
            );

        }

    }


    updateParticles();

    drawParticles();


    state.animationFrame =
        requestAnimationFrame(
            animate
        );

}


/* =========================================================
   V7 — CINEMATIC SCENE ENGINE
========================================================= */

function createSceneSystem() {

    const existingScenes =
        document.querySelectorAll(
            ".generated-scene"
        );


    existingScenes.forEach(
        scene =>
            scene.remove()
    );


    const scenes = [];


    function sceneBase(
        id,
        label
    ) {

        const section =
            document.createElement(
                "section"
            );


        section.id =
            id;

        section.className =
            "generated-scene";


        Object.assign(
            section.style,
            {

                position: "absolute",

                inset: "0",

                width: "100%",

                height: "100%",

                minHeight: "100dvh",

                overflow: "auto",

                display: "none",

                alignItems: "center",

                justifyContent: "center",

                padding:
                    "32px 20px 100px",

                background:
                    "radial-gradient(circle at center,#121212,#030303 75%)",

                color: "#fff",

                zIndex: "10",

                opacity: "0",

                transition:
                    "opacity .65s ease"

            }
        );


        section.setAttribute(
            "aria-label",
            label
        );


        intro.parentElement.appendChild(
            section
        );


        scenes.push(
            section
        );


        return section;

    }


    function inner(
        section
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        Object.assign(
            wrapper.style,
            {

                width:
                    "min(900px,100%)",

                margin:
                    "auto",

                textAlign:
                    "center"

            }
        );


        section.appendChild(
            wrapper
        );


        return wrapper;

    }


    function title(
        wrapper,
        eyebrow,
        heading,
        text
    ) {

        const small =
            document.createElement(
                "div"
            );


        small.textContent =
            eyebrow;


        Object.assign(
            small.style,
            {

                font:
                    "10px Arial,sans-serif",

                letterSpacing:
                    ".28em",

                textTransform:
                    "uppercase",

                opacity:
                    ".5",

                marginBottom:
                    "25px"

            }
        );


        wrapper.appendChild(
            small
        );


        const h =
            document.createElement(
                "h2"
            );


        h.textContent =
            heading;


        Object.assign(
            h.style,
            {

                font:
                    "400 clamp(38px,9vw,75px) Georgia,serif",

                lineHeight:
                    "1.03",

                letterSpacing:
                    "-.04em",

                margin:
                    "0 auto 22px",

                maxWidth:
                    "760px"

            }
        );


        wrapper.appendChild(
            h
        );


        if (text) {

            const p =
                document.createElement(
                    "p"
                );


            p.textContent =
                text;


            Object.assign(
                p.style,
                {

                    font:
                        "14px/1.75 Arial,sans-serif",

                    opacity:
                        ".58",

                    maxWidth:
                        "650px",

                    margin:
                        "0 auto 28px"

                }
            );


            wrapper.appendChild(
                p
            );

        }

    }


    function button(
        wrapper,
        text,
        callback
    ) {

        const btn =
            document.createElement(
                "button"
            );


        btn.type =
            "button";


        btn.textContent =
            text;


        Object.assign(
            btn.style,
            {

                border:
                    "1px solid rgba(255,255,255,.25)",

                borderRadius:
                    "999px",

                background:
                    "rgba(255,255,255,.07)",

                color:
                    "#fff",

                padding:
                    "13px 21px",

                margin:
                    "8px",

                font:
                    "11px Arial,sans-serif",

                letterSpacing:
                    ".12em",

                textTransform:
                    "uppercase"

            }
        );


        btn.addEventListener(
            "click",
            callback
        );


        wrapper.appendChild(
            btn
        );


        return btn;

    }


    /* =====================================
       V7 — MEMORY INTRO
    ===================================== */

    const welcome =
        sceneBase(
            "v7-welcome",
            "Chapter one"
        );


    const welcomeInner =
        inner(welcome);


    title(
        welcomeInner,

        "chapter one",

        "This is where our little universe begins.",

        "Not everything has to be explained. Some things are better felt."
    );


    button(
        welcomeInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v10-memories"
            )
    );


    /* =====================================
       V10 — MEMORIES
    ===================================== */

    const memories =
        sceneBase(
            "v10-memories",
            "Memories"
        );


    const memoriesInner =
        inner(memories);


    title(
        memoriesInner,

        "chapter two",

        "The moments I keep coming back to.",

        "These will become your real photos, screenshots and memories."
    );


    const memoryGrid =
        document.createElement(
            "div"
        );


    Object.assign(
        memoryGrid.style,
        {

            display:
                "grid",

            gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",

            gap:
                "12px",

            margin:
                "25px 0"

        }
    );


    DATA.memories.forEach(
        (memory,index) => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            Object.assign(
                card.style,
                {

                    minHeight:
                        "170px",

                    padding:
                        "20px",

                    textAlign:
                        "left",

                    border:
                        "1px solid rgba(255,255,255,.12)",

                    borderRadius:
                        "18px",

                    background:
                        "rgba(255,255,255,.04)",

                    color:
                        "#fff"

                }
            );


            card.innerHTML =

                `<small style="
                    opacity:.45;
                    font:10px Arial;
                    letter-spacing:.2em;
                ">MEMORY ${String(index + 1).padStart(2,"0")}</small>

                <strong style="
                    display:block;
                    margin-top:30px;
                    font:400 22px Georgia;
                ">${memory.title}</strong>

                <span style="
                    display:block;
                    margin-top:10px;
                    font:13px/1.5 Arial;
                    opacity:.55;
                ">${memory.text}</span>`;


            card.addEventListener(
                "click",
                () => {

                    card.style.transform =
                        "scale(.97)";

                    setTimeout(
                        () =>
                            card.style.transform =
                                "",
                        180
                    );

                }
            );


            memoryGrid.appendChild(
                card
            );

        }
    );


    memoriesInner.appendChild(
        memoryGrid
    );


    button(
        memoriesInner,
        "Next",
        () =>
            showGeneratedScene(
                "v11-chat"
            )
    );


    /* =====================================
       V11 — CHAT
    ===================================== */

    const chatScene =
        sceneBase(
            "v11-chat",
            "Conversation"
        );


    const chatInner =
        inner(chatScene);


    title(
        chatInner,

        "chapter three",

        "Some conversations never really end.",

        "A place for the words that became part of your story."
    );


    const chatBox =
        document.createElement(
            "div"
        );


    Object.assign(
        chatBox.style,
        {

            maxWidth:
                "520px",

            margin:
                "20px auto",

            textAlign:
                "left"

        }
    );


    DATA.chat.forEach(
        message => {

            const bubble =
                document.createElement(
                    "div"
                );


            Object.assign(
                bubble.style,
                {

                    maxWidth:
                        "82%",

                    margin:
                        "10px " +
                        (
                            message.sender === "me"
                                ? "0 10px auto"
                                : "10px auto 10px 0"
                        ),

                    padding:
                        "13px 16px",

                    borderRadius:
                        "16px",

                    background:
                        message.sender === "me"
                            ? "rgba(255,255,255,.10)"
                            : "rgba(255,255,255,.045)",

                    font:
                        "14px/1.5 Arial"

                }
            );


            bubble.textContent =
                message.text;


            chatBox.appendChild(
                bubble
            );

        }
    );


    chatInner.appendChild(
        chatBox
    );


    button(
        chatInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v12-photos"
            )
    );


    /* =====================================
       V12 — PHOTO WORLD
    ===================================== */

    const photoScene =
        sceneBase(
            "v12-photos",
            "Photo world"
        );


    const photoInner =
        inner(photoScene);


    title(
        photoInner,

        "chapter four",

        "A world made from little pieces of you.",

        "Your actual photos will live here."
    );


    const photoMessage =
        document.createElement(
            "div"
        );


    photoMessage.innerHTML =
        `<div style="
            width:min(420px,90vw);
            aspect-ratio:1;
            margin:30px auto;
            border:1px solid rgba(255,255,255,.12);
            border-radius:24px;
            display:grid;
            place-items:center;
            background:
                radial-gradient(circle,#151515,#050505);
        ">
            <div style="
                text-align:center;
                padding:25px;
            ">
                <div style="
                    font-size:42px;
                    margin-bottom:15px;
                ">✦</div>

                <div style="
                    font:13px/1.6 Arial;
                    opacity:.55;
                ">
                    Your photographs will
                    become the stars of this room.
                </div>
            </div>
        </div>`;


    photoInner.appendChild(
        photoMessage
    );


    button(
        photoInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v13-videos"
            )
    );


    /* =====================================
       V13 — VIDEO MEMORIES
    ===================================== */

    const videoScene =
        sceneBase(
            "v13-videos",
            "Video memories"
        );


    const videoInner =
        inner(videoScene);


    title(
        videoInner,

        "chapter five",

        "Some memories move.",

        "Your videos will eventually become cinematic memory fragments."
    );


    const videoBox =
        document.createElement(
            "div"
        );


    Object.assign(
        videoBox.style,
        {

            width:
                "min(650px,92vw)",

            aspectRatio:
                "16 / 9",

            margin:
                "25px auto",

            borderRadius:
                "20px",

            border:
                "1px solid rgba(255,255,255,.12)",

            display:
                "grid",

            placeItems:
                "center",

            background:
                "#080808"

        }
    );


    videoBox.innerHTML =
        `<span style="
            font:12px Arial;
            opacity:.45;
            letter-spacing:.1em;
        ">
            VIDEO MEMORY
        </span>`;


    videoInner.appendChild(
        videoBox
    );


    button(
        videoInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v14-letters"
            )
    );


    /* =====================================
       V14 — OPEN WHEN
    ===================================== */

    const lettersScene =
        sceneBase(
            "v14-letters",
            "Open when letters"
        );


    const lettersInner =
        inner(lettersScene);


    title(
        lettersInner,

        "chapter six",

        "Open when you need me.",

        "Each one hides a little piece of what I want you to remember."
    );


    const letterGrid =
        document.createElement(
            "div"
        );


    Object.assign(
        letterGrid.style,
        {

            display:
                "grid",

            gridTemplateColumns:
                "repeat(auto-fit,minmax(190px,1fr))",

            gap:
                "12px",

            margin:
                "25px 0"

        }
    );


    DATA.letters.forEach(
        letter => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            Object.assign(
                card.style,
                {

                    minHeight:
                        "180px",

                    padding:
                        "20px",

                    textAlign:
                        "left",

                    border:
                        "1px solid rgba(255,255,255,.12)",

                    borderRadius:
                        "18px",

                    background:
                        "rgba(255,255,255,.04)",

                    color:
                        "#fff"

                }
            );


            let open =
                false;


            function renderLetter() {

                card.innerHTML =
                    open

                    ?

                    `<div style="
                        font:13px/1.6 Arial;
                        opacity:.8;
                    ">
                        ${letter.text}
                    </div>`

                    :

                    `<div style="
                        font:10px Arial;
                        letter-spacing:.2em;
                        opacity:.45;
                        text-transform:uppercase;
                    ">
                        OPEN WHEN
                    </div>

                    <div style="
                        font:400 23px Georgia;
                        margin-top:35px;
                    ">
                        ${letter.title}
                    </div>

                    <div style="
                        font:10px Arial;
                        opacity:.4;
                        margin-top:12px;
                    ">
                        TAP TO OPEN
                    </div>`;

            }


            renderLetter();


            card.addEventListener(
                "click",
                () => {

                    open =
                        !open;

                    renderLetter();

                }
            );


            letterGrid.appendChild(
                card
            );

        }
    );


    lettersInner.appendChild(
        letterGrid
    );


    button(
        lettersInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v15-reasons"
            )
    );


    /* =====================================
       V15 — 365 REASONS
    ===================================== */

    const reasonsScene =
        sceneBase(
            "v15-reasons",
            "Reasons"
        );


    const reasonsInner =
        inner(reasonsScene);


    title(
        reasonsInner,

        "chapter seven",

        "One reason is never enough.",

        "Eventually this becomes 365 reasons — one for every day."
    );


    const reasonNumber =
        document.createElement(
            "div"
        );


    reasonNumber.style.cssText =
        `
        font:400 64px Georgia;
        opacity:.85;
        margin:20px;
        `;


    const reasonText =
        document.createElement(
            "p"
        );


    reasonText.style.cssText =
        `
        max-width:620px;
        min-height:70px;
        margin:0 auto 25px;
        font:22px/1.4 Georgia;
        `;


    let reasonIndex =
        0;


    function showReason() {

        reasonIndex =
            Math.floor(
                Math.random() *
                DATA.reasons.length
            );


        reasonNumber.textContent =
            String(
                Math.floor(
                    Math.random() *
                    365
                ) + 1
            );


        reasonText.textContent =
            DATA.reasons[
                reasonIndex
            ];

    }


    showReason();


    reasonsInner.appendChild(
        reasonNumber
    );

    reasonsInner.appendChild(
        reasonText
    );


    button(
        reasonsInner,
        "Another reason",
        showReason
    );


    button(
        reasonsInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v16-distance"
            )
    );


    /* =====================================
       V16 — DISTANCE
    ===================================== */

    const distanceScene =
        sceneBase(
            "v16-distance",
            "Distance"
        );


    const distanceInner =
        inner(distanceScene);


    title(
        distanceInner,

        "chapter eight",

        "Distance is a measurement. Not the story.",

        "Different places. Different clocks. Still one little universe."
    );


    const distanceVisual =
        document.createElement(
            "div"
        );


    distanceVisual.style.cssText =
        `
        position:relative;
        width:min(500px,90vw);
        height:100px;
        margin:25px auto;
        `;


    distanceVisual.innerHTML =
        `
        <div style="
            position:absolute;
            left:10%;
            right:10%;
            top:50%;
            border-top:1px solid rgba(255,255,255,.2);
        "></div>

        <div style="
            position:absolute;
            left:8%;
            top:50%;
            width:14px;
            height:14px;
            border:1px solid white;
            border-radius:50%;
            transform:translateY(-50%);
            background:#030303;
        "></div>

        <div style="
            position:absolute;
            right:8%;
            top:50%;
            width:14px;
            height:14px;
            border:1px solid white;
            border-radius:50%;
            transform:translateY(-50%);
            background:#030303;
        "></div>

        <div style="
            position:absolute;
            left:50%;
            top:50%;
            width:8px;
            height:8px;
            border-radius:50%;
            transform:translate(-50%,-50%);
            background:white;
            box-shadow:0 0 30px white;
        "></div>
        `;


    distanceInner.appendChild(
        distanceVisual
    );


    button(
        distanceInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v17-secret"
            )
    );


    /* =====================================
       V17 — SECRET MECHANICS
    ===================================== */

    const secretScene =
        sceneBase(
            "v17-secret",
            "Secret room"
        );


    const secretInner =
        inner(secretScene);


    title(
        secretInner,

        "chapter nine",

        "There is something hidden here.",

        "Some things should only appear if you know how to look."
    );


    const secretHint =
        document.createElement(
            "p"
        );


    secretHint.textContent =
        "Tap the title seven times.";


    secretHint.style.cssText =
        `
        font:12px Arial;
        opacity:.4;
        margin:25px;
        `;


    secretInner.appendChild(
        secretHint
    );


    const secretButton =
        document.createElement(
            "button"
        );


    secretButton.type =
        "button";


    secretButton.textContent =
        "the secret";


    secretButton.style.cssText =
        `
        border:0;
        background:none;
        color:white;
        font:400 36px Georgia;
        padding:30px;
        `;


    secretInner.appendChild(
        secretButton
    );


    let taps =
        0;


    let lastTap =
        0;


    secretButton.addEventListener(
        "click",
        () => {

            const now =
                Date.now();


            if (
                now -
                lastTap >
                1800
            ) {

                taps = 0;

            }


            taps++;

            lastTap =
                now;


            if (taps >= 7) {

                secretHint.textContent =
                    "You found it.";


                secretButton.textContent =
                    "✦";


                secretButton.style.fontSize =
                    "80px";


                createSecretEffect();

            }

        }
    );


    button(
        secretInner,
        "Continue",
        () =>
            showGeneratedScene(
                "v18-finale"
            )
    );


    /* =====================================
       V18 — FINAL CINEMATIC
    ===================================== */

    const finaleScene =
        sceneBase(
            "v18-finale",
            "Finale"
        );


    const finaleInner =
        inner(finaleScene);


    title(
        finaleInner,

        "the final chapter",

        "And this is only the beginning.",

        "Everything before this was a doorway."
    );


    const finalText =
        document.createElement(
            "p"
        );


    finalText.textContent =
        "Happy birthday. " +
        "I hope this little universe " +
        "always reminds you that you are loved.";


    finalText.style.cssText =
        `
        max-width:620px;
        margin:30px auto;
        font:22px/1.6 Georgia;
        `;


    finaleInner.appendChild(
        finalText
    );


    button(
        finaleInner,
        "Enter the universe",
        () => {

            finalParticleMode();

            showGeneratedScene(
                "v18-finale"
            );

        }
    );


    button(
        finaleInner,
        "Start again",
        () =>
            showGeneratedScene(
                "v7-welcome"
            )
    );


    return scenes;

}


let generatedScenes =
    createSceneSystem();


/* =========================================================
   SCENE NAVIGATION
========================================================= */

function showGeneratedScene(
    id
) {

    const target =
        document.getElementById(
            id
        );


    if (!target) {
        return;
    }


    /* ---------------------------------
       Hide generated scenes
    --------------------------------- */

    generatedScenes.forEach(
        scene => {

            scene.style.opacity =
                "0";

            scene.style.pointerEvents =
                "none";

            scene.style.display =
                "none";

        }
    );


    /* ---------------------------------
       Hide original intro
    --------------------------------- */

    if (
        id !== "intro"
    ) {

        intro.style.opacity =
            "0";

        intro.style.pointerEvents =
            "none";

    }


    target.style.display =
        "flex";


    requestAnimationFrame(
        () => {

            target.style.opacity =
                "1";

            target.style.pointerEvents =
                "auto";

        }
    );


    state.currentScene =
        id;


    if (
        id === "v18-finale"
    ) {

        finalParticleMode();

    }

}


/* =========================================================
   V8 — AUDIO ENGINE
========================================================= */

function initializeAudio() {

    if (state.audio) {
        return;
    }


    state.audio =
        new Audio();


    state.audio.loop =
        true;


    state.audio.volume =
        0.45;


    state.audio.preload =
        "none";


    state.audioReady =
        true;

}


/*
To use your real song later:

state.audio.src =
    "assets/audio/song.mp3";

Then call:

state.audio.play();
*/


/* =========================================================
   V9 — VOICE ENGINE
========================================================= */

function initializeVoice() {

    if (
        !("speechSynthesis" in window)
    ) {

        return false;

    }


    state.voiceReady =
        true;


    return true;

}


function speak(
    text
) {

    if (
        !state.voiceReady
    ) {

        initializeVoice();

    }


    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.rate =
        0.88;


    utterance.pitch =
        1;


    utterance.volume =
        1;


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   V17 — SECRET EFFECT
========================================================= */

function createSecretEffect() {

    state.ripple = {

        x:
            state.width / 2,

        y:
            state.height / 2,

        radius:0,

        strength:1.5

    };


    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const angle =
            random(
                0,
                Math.PI * 2
            );


        const radius =
            random(
                20,
                100
            );


        const x =
            state.width / 2 +
            Math.cos(angle) *
            radius;


        const y =
            state.height / 2 +
            Math.sin(angle) *
            radius;


        createTrailParticle(
            x,
            y,
            random(2,8)
        );

    }

}


/* =========================================================
   V19 — ORIENTATION / RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        resizeCanvas();

    }
);


window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(
            () => {

                resizeCanvas();

                initializeUniverse();

            },
            200
        );

    }
);


/* =========================================================
   V8 — AUDIO INITIALIZATION
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target &&
            event.target.dataset &&
            event.target.dataset.audio
        ) {

            initializeAudio();

        }

    }
);


/* =========================================================
   V9 — OPTIONAL VOICE HOOK
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target &&
            event.target.dataset &&
            event.target.dataset.voice
        ) {

            speak(
                event.target.dataset.voice
            );

        }

    }
);


/* =========================================================
   INTRO → V7
========================================================= */

function startExperience() {

    if (
        state.started
    ) {

        return;

    }


    state.started =
        true;


    intro.classList.add(
        "has-started"
    );


    initializeAudio();

    initializeVoice();


    setTimeout(
        () => {

            showGeneratedScene(
                "v7-welcome"
            );

        },

        CONFIG.reducedMotion
            ? 0
            : 900

    );

}


/* =========================================================
   INTRO BUTTON
========================================================= */

const enterButton =
    document.getElementById(
        "enterButton"
    );


if (enterButton) {

    enterButton.addEventListener(
        "click",
        startExperience
    );

}


/* =========================================================
   INTRO TAP
========================================================= */

intro.addEventListener(
    "dblclick",
    () => {

        if (!state.started) {

            startExperience();

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

resizeCanvas();


state.targetX =
    state.width / 2;

state.targetY =
    state.height * 0.45;


state.currentX =
    state.targetX;

state.currentY =
    state.targetY;


state.lastX =
    state.currentX;

state.lastY =
    state.currentY;


initializeUniverse();

initializeVoice();

animate();


/* =========================================================
   V19 — PREVENT MOBILE SCROLL DURING INTRO
========================================================= */

intro.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();

    },
    {
        passive:false
    }
);


/* =========================================================
   V19 — CLEANUP
========================================================= */

window.addEventListener(
    "pagehide",
    () => {

        if (
            state.animationFrame
        ) {

            cancelAnimationFrame(
                state.animationFrame
            );

        }


        if (
            state.audio
        ) {

            state.audio.pause();

        }


        if (
            window.speechSynthesis
        ) {

            window.speechSynthesis.cancel();

        }

    }
);