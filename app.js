const monument = [-77.0353, 38.8895];

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    zoom: 2,
    center: [80, 20],
});

map.on('style.load', () => {
    map.setProjection({
        type: 'globe',
    });
});

// ------------------------------
// AUTO ROTATION + USER CONTROL
// ------------------------------

let userInteracting = false;
let lastInteractionTime = 0;
let popupOpen = false;

function rotateGlobe() {
    const now = Date.now();

    // rotate ONLY if user is not controlling it,
    // popup is not open, and 2 sec passed after they stop
    if (!userInteracting && !popupOpen && now - lastInteractionTime > 300) {
        const speed = 0.02;
        const c = map.getCenter();
        map.setCenter([c.lng + speed, c.lat]);
    }

    requestAnimationFrame(rotateGlobe);
}

function stopRotationTemporarily() {
    userInteracting = true;
    lastInteractionTime = Date.now();
}

function resumeRotationSoon() {
    userInteracting = false;
    lastInteractionTime = Date.now();
}

// --- USER INTERACTION EVENTS ---
map.on("mousedown", stopRotationTemporarily);
map.on("mouseup", resumeRotationSoon);

map.on("dragstart", stopRotationTemporarily);
map.on("dragend", resumeRotationSoon);

map.on("wheel", stopRotationTemporarily);

map.on("touchstart", stopRotationTemporarily);
map.on("touchend", resumeRotationSoon);

// Start rotating
map.on("load", () => {
    rotateGlobe();
});

// ------------------------------
// MARKER + POPUP
// ------------------------------

const popup = new maplibregl.Popup({ offset: 25 })
    .setText('Construction on the Washington Monument began in 1848.');

// STOP rotation when popup opens
popup.on('open', () => {
    popupOpen = true;
    stopRotationTemporarily();
});

// RESUME when popup closes
popup.on('close', () => {
    popupOpen = false;
    resumeRotationSoon();
});

const el = document.createElement('div');
el.id = 'marker';

new maplibregl.Marker({ element: el })
    .setLngLat(monument)
    .setPopup(popup)
    .addTo(map);

