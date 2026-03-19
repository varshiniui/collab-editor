const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

const pool = new Pool({
  host:     process.env.PG_HOST     || "localhost",
  port:     process.env.PG_PORT     || 5432,
  database: process.env.PG_DB       || "collab_editor",
  user:     process.env.PG_USER     || "postgres",
  password: process.env.PG_PASSWORD || "postgre123",
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL DEFAULT 'Untitled Document',
      content    TEXT NOT NULL DEFAULT '',
      owner      TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  // Add owner column if it doesn't exist (for existing installs)
  await pool.query(`
    ALTER TABLE documents ADD COLUMN IF NOT EXISTS owner TEXT NOT NULL DEFAULT '';
  `);
  console.log("✅ Database ready");
}

const docUsers = new Map();
const USER_COLORS = ["#e06c75","#61afef","#98c379","#e5c07b","#c678dd","#56b6c2","#d19a66","#be5046"];

function getUsersInDoc(docId) {
  return [...(docUsers.get(docId)?.values() || [])];
}

io.on("connection", (socket) => {
  let currentDoc = null;
  let currentUser = null;

  socket.on("join_doc", async ({ docId, username }) => {
    if (currentDoc) {
      socket.leave(currentDoc);
      docUsers.get(currentDoc)?.delete(socket.id);
      io.to(currentDoc).emit("users_update", getUsersInDoc(currentDoc));
    }

    currentDoc = docId;
    const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    currentUser = { id: socket.id, name: username, color, cursor: null };

    socket.join(docId);
    if (!docUsers.has(docId)) docUsers.set(docId, new Map());
    docUsers.get(docId).set(socket.id, currentUser);

    try {
      const result = await pool.query("SELECT * FROM documents WHERE id = $1", [docId]);
      socket.emit("doc_loaded", result.rows[0] || { id: docId, title: "Untitled Document", content: "" });
    } catch (err) {
      socket.emit("doc_loaded", { id: docId, title: "Untitled Document", content: "" });
    }

    io.to(docId).emit("users_update", getUsersInDoc(docId));
    socket.to(docId).emit("user_joined", { name: username, color });
  });

  socket.on("doc_change", ({ docId, content, delta }) => {
    socket.to(docId).emit("doc_change", { content, delta, userId: socket.id });
  });

  socket.on("title_change", ({ docId, title }) => {
    socket.to(docId).emit("title_change", { title });
  });

  socket.on("cursor_move", ({ docId, cursor }) => {
    if (currentUser && docUsers.get(docId)?.has(socket.id)) {
      currentUser.cursor = cursor;
      docUsers.get(docId).set(socket.id, currentUser);
      socket.to(docId).emit("cursor_update", { userId: socket.id, name: currentUser.name, color: currentUser.color, cursor });
    }
  });

  socket.on("save_doc", async ({ docId, title, content, owner }) => {
    try {
      await pool.query(
        `INSERT INTO documents (id, title, content, owner, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE
         SET title = $2, content = $3, updated_at = NOW()`,
        [docId, title, content, owner || ""]
      );
      io.to(docId).emit("doc_saved", { savedAt: new Date().toISOString() });
    } catch (err) {
      socket.emit("save_error", { message: err.message });
    }
  });

  socket.on("disconnect", () => {
    if (currentDoc && currentUser) {
      docUsers.get(currentDoc)?.delete(socket.id);
      io.to(currentDoc).emit("users_update", getUsersInDoc(currentDoc));
      socket.to(currentDoc).emit("user_left", { name: currentUser.name });
    }
  });
});

// List docs by owner
app.get("/api/docs", async (req, res) => {
  try {
    const { owner } = req.query;
    const result = owner
      ? await pool.query("SELECT id, title, owner, updated_at FROM documents WHERE owner = $1 ORDER BY updated_at DESC", [owner])
      : await pool.query("SELECT id, title, owner, updated_at FROM documents ORDER BY updated_at DESC");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/docs/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM documents WHERE id = $1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/docs", async (req, res) => {
  const id = uuidv4();
  const { title = "Untitled Document", owner = "" } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO documents (id, title, content, owner) VALUES ($1, $2, '', $3) RETURNING *",
      [id, title, owner]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/docs/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM documents WHERE id = $1", [req.params.id]);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/", (req, res) => res.json({ status: "ok", message: "Draft server running" }));

const PORT = process.env.PORT || 3001;
initDB().then(() => {
  server.listen(PORT, () => console.log(`\n🚀 Draft server running on http://localhost:${PORT}\n`));
}).catch(err => {
  console.error("DB init failed:", err.message);
  server.listen(PORT, () => console.log(`🚀 Server running (no DB) on http://localhost:${PORT}`));
});