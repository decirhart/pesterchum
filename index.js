const { Client, GatewayIntentBits, Partials } = require("discord.js");
const WebSocket = require("ws");
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const seenMessages = new Set();

const TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3001;

const USERS = require("./users.json");

/* =========================================================
   EXPRESS APP
========================================================= */

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on", PORT);
});

/* =========================================================
   WEBSOCKET SERVER
========================================================= */

const wss = new WebSocket.Server({ server });

function broadcast(payload) {
    const data = JSON.stringify(payload);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on("listening", () => {
    console.log("WebSocket ready");
});

wss.on("error", err => {
    console.error("WS ERROR:", err);
});

/* =========================================================
   DISCORD BOT
========================================================= */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User
    ]
});

client.once("ready", () => {

    console.log("Bot online as:", client.user.tag);

    broadcast({
        type: "system",
        event: "ready"
    });

});

/* =========================================================
   DISCORD -> STANDARD MESSAGE PIPELINE
========================================================= */

client.on("messageCreate", msg => {

    // 🔒 STOP duplicate processing of same Discord message
    if (seenMessages.has(msg.id)) return;
    seenMessages.add(msg.id);

    setTimeout(() => seenMessages.delete(msg.id), 60000);
let identity = {
    handle: msg.author.username,
    displayName: msg.author.username,
    color: "#ffffff"
};

/* =====================================================
   1. REGISTERED RP USER (HIGHEST PRIORITY)
===================================================== */

const rpUser = Object.values(USERS).find(
    u => u?.discord?.id === msg.author.id
);

if (rpUser) {
    handle = rpUser.display.handle;
    displayName = rpUser.display.nickname;
    color = rpUser.display.color;
}

/* =====================================================
   2. TUPPER / WEBHOOK OVERRIDE (ONLY IF NO RP USER)
===================================================== */

if (!rpUser && msg.webhookId) {

    handle = msg.author.username;        // OC name
    displayName = msg.author.username;   // OC name
}

/* =====================================================
   3. FINAL FALLBACK
===================================================== */

if (!handle) handle = msg.author.username;
if (!displayName) displayName = handle;

    const payload = {
    id: msg.id, // optional but good for debugging
    type: "message",
    room: msg.channel.id,

    handle: identity.handle,
    displayName: identity.displayName,
    color: identity.color,

    content: msg.content,
    timestamp: msg.createdTimestamp,
    attachments: [...msg.attachments.values()].map(a => a.url)
};

broadcast(payload);
});

/* =========================================================
   ERROR HANDLING
========================================================= */

client.on("error", err => {
    console.error("Discord client error:", err);
});

process.on("unhandledRejection", err => {
    console.error("Unhandled rejection:", err);
});

/* =========================================================
   LOGIN
========================================================= */

client.login(TOKEN);