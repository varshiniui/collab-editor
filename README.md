# Folio — Real-Time Collaborative Document Editor

A real-time collaborative document editor built with **React.js**, **Node.js**, **Socket.io**, and **PostgreSQL** — CodTech Full Stack Internship Task 3.

---

## ✨ Features

- 📝 **Rich text editing** — bold, italic, headings, lists, code blocks, and more (powered by Quill.js)
- ⚡ **Real-time collaboration** — multiple users edit the same document simultaneously
- 👥 **Live user presence** — see everyone currently editing with color-coded indicators
- 💾 **Save & persist** — documents saved to PostgreSQL, auto-saves every 30 seconds
- 📋 **Document library** — create, open, and delete documents from the home screen
- 🔗 **Share by ID** — share the document ID so anyone can join the same doc
- 📊 **Word & character count** — live stats in the status bar

---

## 🗂️ Project Structure

```
task3/
├── server/
│   ├── server.js        # Express + Socket.io + PostgreSQL backend
│   ├── setup.sql        # Database setup script
│   └── package.json
└── client/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   └── components/
    │       ├── Home.js    # Document list & entry screen
    │       └── Editor.js  # Collaborative editor
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- PostgreSQL installed and running

### 1. Set up the database

```bash
psql -U postgres -f server/setup.sql
```

### 2. Start the server

```bash
cd server
npm install
npm start
```

> Server runs at `http://localhost:3001`

Configure your PostgreSQL credentials in `server/server.js` or via environment variables:
```
PG_HOST=localhost
PG_PORT=5432
PG_DB=collab_editor
PG_USER=postgres
PG_PASSWORD=postgres
```

### 3. Start the React client

```bash
cd client
npm install
npm start
```

> Client runs at `http://localhost:3000`

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_doc` | Client → Server | Join a document room |
| `doc_change` | Client → Server | Send content change |
| `title_change` | Client → Server | Update document title |
| `cursor_move` | Client → Server | Send cursor position |
| `save_doc` | Client → Server | Save to PostgreSQL |
| `doc_loaded` | Server → Client | Initial document content |
| `doc_change` | Server → Client | Broadcast changes to others |
| `users_update` | Server → Client | Updated active user list |
| `doc_saved` | Server → Client | Save confirmation |
| `cursor_update` | Server → Client | Remote cursor positions |

---

## 🛠️ Technologies

- **Frontend**: React.js, Quill.js (rich text), Socket.io-client, Axios
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL (via `pg` driver)
- **Real-time**: WebSocket via Socket.io

---

## 👩‍💻 Author

Built for **CodTech Full Stack Internship — Task 3**

---

## 📄 License

MIT