# Draft - Real-Time Collaborative Document Editor

*COMPANY* : CODTECH IT SOLUTIONS

*NAME* : SAHAYA VARSHINI M J

*INTERN ID* : CTIS7104

*DOMAIN* : FULL STAACK WEB DEVELOPMENT

*DURATION* : 6 WEEKS

*MENTOR* : NEELA SANTOSH


A real-time collaborative document editor built with **React.js**, **Node.js**, **Socket.io**, and **PostgreSQL** — CodTech Full Stack Internship Task 3.

---

##  Features

-  **Rich text editing** — bold, italic, headings, lists, code blocks, alignment and more (powered by Quill.js)
-  **Real-time collaboration** — multiple users edit the same document simultaneously via WebSocket
-  **Live user presence** — color-coded user pills show everyone currently editing
-  **Save & persist** — documents saved to PostgreSQL, auto-saves every 30 seconds
-  **Save toast notification** — animated confirmation appears every time a save succeeds
-  **Per-user document library** — each user only sees documents they created
-  **Share by ID** — copy the document ID and share it so others can join and co-edit
-  **Live word & character count** — always visible in the status bar
-  **Delete documents** — remove documents directly from the home screen

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Quill.js |
| Backend | Node.js, Express |
| Real-time | Socket.io (WebSocket) |
| Database | PostgreSQL |
| HTTP Client | Axios |

---

## Project Structure

```
task3/
├── .gitignore
├── README.md
├── server/
│   ├── server.js        # Express + Socket.io + PostgreSQL backend
│   ├── setup.sql        # Database setup script
│   └── package.json     # Server dependencies
└── client/
    ├── package.json     # React app dependencies
    ├── public/
    │   └── index.html   # App entry + Quill CSS
    └── src/
        ├── index.js     # React root
        ├── App.js       # Page routing (Home ↔ Editor)
        └── components/
            ├── Home.js  # Document list, create & join
            └── Editor.js # Collaborative rich text editor
```

---

## Getting Started

### Prerequisites
- Node.js v16 or higher
- PostgreSQL installed and running

### 1. Set up the database

Open a terminal and run:
```bash
psql -U postgres -f server/setup.sql
```
Enter your PostgreSQL password when prompted.

### 2. Configure your database password

Open `server/server.js` and update line ~14:
```js
password: process.env.PG_PASSWORD || "your_password_here",
```

### 3. Start the server

```bash
cd server
npm install
npm start
```
You should see:
```
Database ready
Draft server running on http://localhost:3001
```

### 4. Start the React client

Open a **new terminal**:
```bash
cd client
npm install
npm start
```
Opens automatically at `http://localhost:3000`

---

## How to Test

### Single user
1. Enter your name → create a document → start writing
2. Use the toolbar to format text (bold, headings, lists etc.)
3. Click **Save** — a toast notification confirms the save
4. Go **Home** → reopen the document → content is still there ✅

### Real-time collaboration
1. Copy the **document ID** (click the ID badge in the top right)
2. Open a second browser tab → `http://localhost:3000`
3. Enter a different name → paste the ID in **Join by ID** → click Join
4. Both users appear in the editing strip
5. Type in one tab — text appears instantly in the other 

### Per-user documents
- Documents only appear under the name that created them
- "varshini" sees varshini's docs, "ravi" sees ravi's docs

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_doc` | Client → Server | Join a document session |
| `doc_change` | Client → Server | Broadcast content change |
| `title_change` | Client → Server | Update document title |
| `cursor_move` | Client → Server | Send cursor position |
| `save_doc` | Client → Server | Save document to PostgreSQL |
| `doc_loaded` | Server → Client | Send document content on join |
| `doc_change` | Server → Client | Receive remote edits |
| `users_update` | Server → Client | Live user list update |
| `doc_saved` | Server → Client | Save confirmation |
| `user_typing` | Server → Client | Typing indicator broadcast |

---

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/docs?owner=name` | List documents by owner |
| GET | `/api/docs/:id` | Get a single document |
| POST | `/api/docs` | Create a new document |
| DELETE | `/api/docs/:id` | Delete a document |

---

## Author

Built for **CodTech Full Stack Internship — Task 3**

---

## License

MIT

#OUTPUT

<img width="1588" height="912" alt="Image" src="https://github.com/user-attachments/assets/822f9271-d55b-4c91-bcbe-1bd1d7b7c30d" />

<img width="1888" height="900" alt="Image" src="https://github.com/user-attachments/assets/e1ec1d0e-681a-47d9-b563-934a6ffbc31f" />

<img width="1905" height="879" alt="Image" src="https://github.com/user-attachments/assets/10cd857c-b805-43d6-a32e-a564f780286d" />

<img width="1898" height="881" alt="Image" src="https://github.com/user-attachments/assets/5c2fc76f-ee52-4d71-92d1-14e60b9d5ae3" />
