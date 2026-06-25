const { Client, GatewayIntentBits, Partials } = require("discord.js");
const WebSocket = require("ws");
const express = require("express");
const path = require("path");
const crypto = require("crypto");

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

    // ignore system bots EXCEPT webhooks (tupperbox)
    if (msg.author.bot && !msg.webhookId) return;

    let handle = null;
    let displayName = null;
    let color = "#ffffff";

    /* =====================================================
       1. MATCH REGISTERED USERS (discord ID mapping)
    ===================================================== */

    let rpUser = null;

    for (const key in USERS) {
        if (USERS[key]?.discord?.id === msg.author.id) {
            rpUser = USERS[key];
            break;
        }
    }

    if (rpUser) {
        handle = rpUser.display.handle;
        displayName = rpUser.display.nickname;
        color = rpUser.display.color;
    }

    /* =====================================================
       2. WEBHOOK / TUPPERBOX SUPPORT
    ===================================================== */

    if (msg.webhookId || !handle) {

        // Tupperbox usually sets:
        // msg.author.username = OC name
        handle = msg.author.username;
        displayName = msg.author.username;
    }

    /* =====================================================
       3. FALLBACK SAFETY
    ===================================================== */

    if (!handle) handle = "unknown";
    if (!displayName) displayName = handle;

    const payload = {
        id: crypto.randomUUID(),
        type: "message",
        room: msg.channel.id,
        handle,
        displayName,
        color,
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