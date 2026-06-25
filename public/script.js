const API = "https://script.google.com/macros/s/AKfycbwVx1sme_YarOFphZScmLurXAScz6koLvYJxn51HKYMm02m7q0nIn40iUDZHUrBhOR6IQ/exec";

const loginScreen = document.getElementById("loginScreen");
const clientWindow = document.getElementById("clientWindow");

const leftWindow = document.getElementById("leftWindow");
const rightWindow = document.getElementById("rightWindow");

const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

const taskbar = document.getElementById("taskbar");
const taskbarButton = document.getElementById("taskbarButton");

const desktopIcon = document.getElementById("desktopIcon");

const log = document.getElementById("pesterlog");
const input = document.getElementById("chatInput");

function showTaskbar() {
    taskbar.style.display = "flex";
}

function hideTaskbar() {
    taskbar.style.display = "none";
}

hideTaskbar();
clientWindow.style.display = "none";
desktopIcon.style.display = "none";

const users = {
    gaminesqueCacogen: "Crowberry"
};

let loginLocked = false;

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function runLogin() {

    if (loginLocked) return;
    loginLocked = true;

    const u = username.value.trim();
    const p = password.value;

    loginMsg.textContent = "CONNECTING...";

    await sleep(300);
    loginMsg.textContent = "AUTHENTICATING...";

    await sleep(300);

    if (users[u] !== p) {
        loginMsg.textContent = "INVALID LOGIN";
        loginLocked = false;
        return;
    }

    loginMsg.textContent = "ACCESS GRANTED";

   await sleep(400);

const bg = document.getElementById("bgStars");
bg.style.display = "block";

requestAnimationFrame(() => {
    startBgStars();
});

document.getElementById("loginTitle").classList.add("rainbowGlow");

await sleep(600);

loginScreen.style.display = "none";

requestAnimationFrame(() => {

  clientWindow.style.display = "flex";
desktopIcon.style.display = "flex";
showTaskbar();

    const bg = document.getElementById("bgStars");

    bg.style.display = "block";

    requestAnimationFrame(() => {
        startBgStars();
    });
});

    loginLocked = false;
}

loginBtn.onclick = runLogin;

function enterLogin(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        runLogin();
    }
}

username.addEventListener("keydown", enterLogin);
password.addEventListener("keydown", enterLogin);

taskbarButton.onclick = () => {

    clientWindow.style.display = "flex";
clientWindow.classList.add("glitchIn");

    leftWindow.style.display = "flex";
    rightWindow.style.display = "flex";

    showTaskbar();
};

desktopIcon.onclick = () => {

    clientWindow.style.display = "flex";
    clientWindow.classList.add("glitchIn");

    leftWindow.style.display = "flex";
    rightWindow.style.display = "flex";

    showTaskbar();

};

document.getElementById("minBtn").onclick = () => {
    clientWindow.style.display = "none";
    showTaskbar();
};

document.getElementById("closeBtn").onclick = () => {
    clientWindow.style.display = "none";
    showTaskbar();
};

document.getElementById("chatMin").onclick = () => {
    rightWindow.style.display = "none";
};

document.getElementById("chatClose").onclick = () => {
    rightWindow.style.display = "none";
};

document.getElementById("maxBtn").onclick = () => {

    const isMax = leftWindow.dataset.max === "true";

    if (!isMax) {

        const rect = leftWindow.getBoundingClientRect();

        leftWindow.dataset.left = rect.left + "px";
        leftWindow.dataset.top = rect.top + "px";
        leftWindow.dataset.width = rect.width + "px";
        leftWindow.dataset.height = rect.height + "px";

        leftWindow.style.position = "fixed";
        leftWindow.style.left = "0";
        leftWindow.style.top = "0";
        leftWindow.style.width = "100vw";
        leftWindow.style.height = "100vh";

        rightWindow.style.display = "none";

        leftWindow.dataset.max = "true";

    } else {

        leftWindow.style.position = "absolute";
        leftWindow.style.left = leftWindow.dataset.left;
        leftWindow.style.top = leftWindow.dataset.top;
        leftWindow.style.width = leftWindow.dataset.width;
        leftWindow.style.height = leftWindow.dataset.height;

        rightWindow.style.display = "flex";

        leftWindow.dataset.max = "false";
    }
};

document.getElementById("chatMax").onclick = () => {

    const isMax = rightWindow.dataset.max === "true";

    if (!isMax) {

        const rect = rightWindow.getBoundingClientRect();

        rightWindow.dataset.left = rect.left + "px";
        rightWindow.dataset.top = rect.top + "px";
        rightWindow.dataset.width = rect.width + "px";
        rightWindow.dataset.height = rect.height + "px";

        rightWindow.style.position = "fixed";
        rightWindow.style.left = "0";
        rightWindow.style.top = "0";
        rightWindow.style.width = "100vw";
        rightWindow.style.height = "100vh";

        leftWindow.style.display = "none";

        rightWindow.dataset.max = "true";

    } else {

        rightWindow.style.position = "absolute";
        rightWindow.style.left = rightWindow.dataset.left;
        rightWindow.style.top = rightWindow.dataset.top;
        rightWindow.style.width = rightWindow.dataset.width;
        rightWindow.style.height = rightWindow.dataset.height;

        leftWindow.style.display = "flex";

        rightWindow.dataset.max = "false";
    }
};

function addMsg(text, self = true) {
    const div = document.createElement("div");
    div.innerHTML = text; // IMPORTANT CHANGE
    div.style.textAlign = self ? "right" : "left";
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const text = input.value.trim();
    if (!text) return;

    addMsg("YOU: " + text, true);
    input.value = "";
});

function makeDraggable(win, handle) {

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener("mousedown", (e) => {

        // only left click
        if (e.button !== 0) return;

        dragging = true;

        const rect = win.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        win.style.position = "absolute";

        // 🔥 prevents text selection / weird overlay behavior
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        win.style.left = (e.clientX - offsetX) + "px";
        win.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
        dragging = false;
    });
}

makeDraggable(leftWindow, leftWindow.querySelector(".titlebar"));
makeDraggable(rightWindow, rightWindow.querySelector(".titlebar"));

function makeResizable(win) {

    const handle = win.querySelector(".resize-handle");

    let resizing = false;
    let startX, startY;
    let startW, startH;

    handle.addEventListener("mousedown", (e) => {

        resizing = true;

        const rect = win.getBoundingClientRect();

        startX = e.clientX;
        startY = e.clientY;

        startW = rect.width;
        startH = rect.height;

        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener("mousemove", (e) => {

        if (!resizing) return;

        win.style.width = (startW + (e.clientX - startX)) + "px";
        win.style.height = (startH + (e.clientY - startY)) + "px";
    });

    document.addEventListener("mouseup", () => {
        resizing = false;
    });
}

makeResizable(leftWindow);
makeResizable(rightWindow);

const loginCanvas = document.getElementById("loginSpiro");

if(loginCanvas){

const ctx = loginCanvas.getContext("2d");

const cx = 40;
const cy = 40;

let angle = 0;

function rgb(i,t){

const r=Math.sin(t+i)*127+128;
const g=Math.sin(t+i+2)*127+128;
const b=Math.sin(t+i+4)*127+128;

return `rgb(${r|0},${g|0},${b|0})`;

}

function star(x,y,size,rot){

ctx.beginPath();

const spikes=4;
const outer=size;
const inner=size*.45;

for(let i=0;i<spikes*2;i++){

const radius=(i%2===0)?outer:inner;
const a=rot+i*Math.PI/spikes;

const px=x+Math.cos(a)*radius;
const py=y+Math.sin(a)*radius;

if(i===0)
ctx.moveTo(px,py);
else
ctx.lineTo(px,py);

}

ctx.closePath();
ctx.stroke();

}

function animate(){

ctx.clearRect(0,0,80,80);

ctx.lineWidth=1.6;
ctx.shadowBlur=10;

angle+=0.008;

const orbit=18;

for(let i=0;i<3;i++){

const phase=angle+i*(Math.PI*2/3);

const x=cx+Math.cos(phase)*orbit;
const y=cy+Math.sin(phase)*orbit;

ctx.strokeStyle=rgb(i,angle*1.5);
ctx.shadowColor=ctx.strokeStyle;

star(x,y,11,angle*1.2);

}

ctx.shadowBlur=12;

ctx.fillStyle="#fff";

ctx.beginPath();
ctx.arc(cx,cy,3,0,Math.PI*2);
ctx.fill();

requestAnimationFrame(animate);

}

animate();

}

const bg = document.getElementById("bgStars");

let bgStarted = false;

function startBgStars() {
    if (bgStarted) return;
    bgStarted = true;

    const bg = document.getElementById("bgStars");
    if (!bg) return;

    const ctx = bg.getContext("2d");

    function resize() {
        bg.width = window.innerWidth;
        bg.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    let t = 0;

    function rgb(i, time) {
        const r = Math.sin(time + i) * 127 + 128;
        const g = Math.sin(time + i + 2) * 127 + 128;
        const b = Math.sin(time + i + 4) * 127 + 128;
        return `rgb(${r|0},${g|0},${b|0})`;
    }

    function star(x, y, size, rot) {
        ctx.beginPath();

        const spikes = 4;
        const outer = size;
        const inner = size * 0.45;

        for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outer : inner;
            const a = rot + i * Math.PI / spikes;

            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.stroke();
    }

    function draw() {
        ctx.clearRect(0, 0, bg.width, bg.height);

        const centerX = bg.width / 2;
        const centerY = bg.height / 2;

        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#fff";

        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        const orbit = 220;
        const size = 120;

        for (let i = 0; i < 3; i++) {
            const phase = t + i * (Math.PI * 2 / 3);

            const x = centerX + Math.cos(phase) * orbit;
            const y = centerY + Math.sin(phase) * orbit;

            ctx.strokeStyle = rgb(i, t * 1.2);
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 25;

            star(x, y, size, t * 0.8);
        }

        t += 0.01;
        requestAnimationFrame(draw);
    }

    draw();
}

const taskCanvas = document.getElementById("taskbarWindowsCanvas");

if (taskCanvas) {
    const ctx = taskCanvas.getContext("2d");

    let angle = 0;

    function drawStar(x, y, size, rot) {
        ctx.beginPath();

        const spikes = 4;
        const outer = size;
        const inner = size * 0.45;

        for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outer : inner;
            const a = rot + (i * Math.PI) / spikes;

            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.stroke();
    }

    function rgb(t, i) {
        return `rgb(
            ${(Math.sin(t + i) * 127 + 128) | 0},
            ${(Math.sin(t + i + 2) * 127 + 128) | 0},
            ${(Math.sin(t + i + 4) * 127 + 128) | 0}
        )`;
    }

    function animate() {
        ctx.clearRect(0, 0, 26, 26);

        const cx = 13;
        const cy = 13;
        const orbit = 6;

        angle += 0.02;

        for (let i = 0; i < 3; i++) {
            const phase = angle + (i * Math.PI * 2) / 3;

            const x = cx + Math.cos(phase) * orbit;
            const y = cy + Math.sin(phase) * orbit;

            ctx.strokeStyle = rgb(angle * 1.5, i);
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 6;

            drawStar(x, y, 3.5, angle * 1.2);
        }

        requestAnimationFrame(animate);
    }

    animate();
}

const ws = new WebSocket(
  window.location.protocol === "https:"
    ? "wss://" + window.location.host
    : "ws://localhost:3001"
);

ws.onopen = () => {
    console.log("WS CONNECTED ✅");
};

ws.onmessage = (event) => {
    console.log("RAW MESSAGE:", event.data);

    let data;
    try {
        data = JSON.parse(event.data);
    } catch (e) {
        console.log("BAD JSON:", event.data);
        return;
    }

    console.log("PARSED:", data);

    const sender = data.handle || data.displayName || "unknown";
    const content = data.content || "";

    const nameHTML = `<span style="color:${data.color || "#fff"}">${sender}</span>`;
addMsg(`${nameHTML}: ${content}`, false);
};

ws.onerror = (e) => console.log("WS ERROR:", e);
ws.onclose = () => console.log("WS CLOSED ❌");