const { Client, GatewayIntentBits, Partials } = require("discord.js");
const WebSocket = require("ws");
const express = require("express");
const path = require("path");

const TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3001;

const USERS = require("./users.json");

/* =========================================================
   EXPRESS APP (STATIC FRONTEND)
========================================================= */

const app = express();

// IMPORTANT: serve /public correctly
app.use(express.static(path.join(__dirname, "public")));

// Force homepage to load index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, () => {
    console.log("HTTP server running on port", PORT);
});

/* =========================================================
   WEBSOCKET SERVER
========================================================= */

const wss = new WebSocket.Server({ server });

function broadcast(payload) {
    const data = JSON.stringify(payload);

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(data);
        }
    });
}

wss.on("listening", () => {
    console.log("WebSocket ready");
});

wss.on("error", (err) => {
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

client.on("messageCreate", (msg) => {

    let rpUser = null;

    for (const key in USERS) {
        if (USERS[key]?.discord?.id === msg.author.id) {
            rpUser = USERS[key];
            break;
        }
    }

    const payload = {
        type: "message",
        from: rpUser ? rpUser.display.handle : msg.author.username,
        displayName: rpUser ? rpUser.display.nickname : msg.author.username,
        color: rpUser ? rpUser.display.color : "#ffffff",
        content: msg.content,
        timestamp: msg.createdTimestamp,
        isWebhook: !!msg.webhookId,
        channelId: msg.channel.id,
        messageId: msg.id,
        attachments: [...msg.attachments.values()].map(a => a.url)
    };

    broadcast(payload);
});

client.on("error", err => {
    console.error("Discord client error:", err);
});

process.on("unhandledRejection", err => {
    console.error("Unhandled rejection:", err);
});

client.login(TOKEN);