import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Quill from 'quill';

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link'],
  ['clean'],
];

const C = {
  bg:    '#bec8d8',
  white: '#ffffff',
  blue:  '#3d5a8a',
  blue2: '#5b8fd4',
  navy:  '#1a2030',
  dark:  '#0f1520',
  muted: 'rgba(26,32,48,0.42)',
  line:  'rgba(26,32,48,0.09)',
};

const TOAST_CSS = `
  @keyframes toastIn  { from { opacity:0; transform:translateY(16px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-8px) scale(0.96); } }
  .toast-enter { animation: toastIn  0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .toast-exit  { animation: toastOut 0.24s ease-in both; }
`;

const S = {
  wrap: { height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden' },
  navbar: {
    background: `linear-gradient(135deg, #0f1520 0%, #1a2540 100%)`,
    padding: '0 28px', height: 54,
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexShrink: 0, gap: 16,
    borderBottom: '1px solid rgba(91,143,212,0.15)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 18, minWidth: 0 },
  logo: { fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: '#fff', flexShrink: 0 },
  logoDot: { display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: C.blue2, verticalAlign: 'super', marginLeft: 2, boxShadow: `0 0 6px ${C.blue2}` },
  titleInput: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(91,143,212,0.2)',
    borderRadius: 6, color: '#fff', fontFamily: "'Sora', sans-serif",
    fontSize: 14, fontWeight: 300, outline: 'none', padding: '5px 12px',
    minWidth: 160, maxWidth: 300, transition: 'border-color 0.2s',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  saveBtn: {
    background: `linear-gradient(135deg, ${C.blue2}, ${C.blue})`,
    border: 'none', borderRadius: 6, padding: '7px 18px', color: '#fff',
    fontFamily: "'Sora', sans-serif", fontSize: 10,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    cursor: 'pointer', fontWeight: 500,
    boxShadow: '0 2px 8px rgba(91,143,212,0.35)', transition: 'all 0.2s',
  },
  homeBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 6, padding: '7px 14px', color: 'rgba(255,255,255,0.5)',
    fontFamily: "'Sora', sans-serif", fontSize: 10,
    letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
  },
  userStrip: {
    background: '#151e2e', borderBottom: '1px solid rgba(91,143,212,0.10)',
    padding: '0 28px', height: 36,
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
  },
  stripLabel: { fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginRight: 4 },
  userPill: { display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px 3px 6px', borderRadius: 100, fontSize: 12 },
  userDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  docIdWrap: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7,
    background: 'rgba(91,143,212,0.12)', border: '1px solid rgba(91,143,212,0.22)',
    borderRadius: 5, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.2s',
  },
  docIdText: { fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' },
  docIdIcon: { fontSize: 11, color: C.blue2 },
  editorWrap: {
    flex: 1, overflow: 'hidden', display: 'flex',
    justifyContent: 'center', padding: '36px 24px',
    background: `linear-gradient(145deg, #b0bccf 0%, #bec8d8 60%, #c8d2e0 100%)`,
  },
  paper: {
    width: '100%', maxWidth: 760, background: C.white,
    boxShadow: '0 8px 48px rgba(26,32,48,0.18)',
    borderRadius: 8, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', minHeight: 0, border: `1px solid ${C.line}`,
  },
  statusBar: {
    background: `linear-gradient(135deg, #0f1520 0%, #1a2540 100%)`,
    padding: '5px 28px', fontSize: 10, letterSpacing: '0.16em',
    color: 'rgba(255,255,255,0.28)', display: 'flex', gap: 24, flexShrink: 0,
    borderTop: '1px solid rgba(91,143,212,0.12)',
  },
  toastWrap: {
    position: 'fixed', bottom: 40, left: '50%',
    transform: 'translateX(-50%)', zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    background: `linear-gradient(135deg, #1a2540, #1e2d50)`,
    border: '1px solid rgba(91,143,212,0.35)',
    borderRadius: 8, padding: '12px 20px',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    minWidth: 200,
  },
  toastIcon: { fontSize: 16 },
  toastText: { fontFamily: "'Sora', sans-serif", fontSize: 13, color: '#fff', fontWeight: 400 },
  toastTime: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 'auto', letterSpacing: '0.08em' },
};

export default function Editor({ docId, username, onHome }) {
  const editorRef = useRef(null);
  const quillRef  = useRef(null);
  const socketRef = useRef(null);
  const skipRef   = useRef(false);

  const [title, setTitle]         = useState('Untitled Document');
  const [users, setUsers]         = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [toast, setToast]         = useState(null); // { msg, time, exiting }

  // Inject toast CSS
  useEffect(() => {
    if (!document.getElementById('draft-toast-css')) {
      const s = document.createElement('style');
      s.id = 'draft-toast-css';
      s.textContent = TOAST_CSS;
      document.head.appendChild(s);
    }
  }, []);

  function showToast(msg, icon = '✓') {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setToast({ msg, icon, time, exiting: false });
    setTimeout(() => setToast(t => t ? { ...t, exiting: true } : null), 2400);
    setTimeout(() => setToast(null), 2700);
  }

  useEffect(() => {
    if (quillRef.current) return;
    const q = new Quill(editorRef.current, {
      theme: 'snow', modules: { toolbar: TOOLBAR }, placeholder: 'Begin writing…',
    });
    quillRef.current = q;
    q.on('text-change', (d, o, source) => {
      if (source !== 'user') return;
      updateCounts(q.getText());
      if (skipRef.current) return;
      socketRef.current?.emit('doc_change', { docId, content: q.root.innerHTML, delta: d });
    });
    q.on('selection-change', range => {
      if (range) socketRef.current?.emit('cursor_move', { docId, cursor: range });
    });
  }, [docId]);

  function updateCounts(text) {
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    setCharCount(text.replace(/\n/g, '').length);
  }

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => { setConnected(true); socket.emit('join_doc', { docId, username }); });
    socket.on('disconnect', () => setConnected(false));

    socket.on('doc_loaded', ({ title: t, content: c }) => {
      setTitle(t || 'Untitled Document');
      if (quillRef.current && c) {
        skipRef.current = true;
        quillRef.current.root.innerHTML = c;
        updateCounts(quillRef.current.getText());
        skipRef.current = false;
      }
    });

    socket.on('doc_change', ({ content }) => {
      if (!quillRef.current) return;
      const sel = quillRef.current.getSelection();
      skipRef.current = true;
      quillRef.current.root.innerHTML = content;
      skipRef.current = false;
      if (sel) { try { quillRef.current.setSelection(sel.index, sel.length, 'silent'); } catch {} }
    });

    socket.on('title_change', ({ title: t }) => setTitle(t));
    socket.on('users_update', u => setUsers(u));
    socket.on('doc_saved', () => showToast('Document saved', '✓'));
    socket.on('save_error', ({ message }) => showToast('Save failed: ' + message, '✕'));

    return () => socket.disconnect();
  }, [docId, username]);

  function handleTitleChange(e) {
    setTitle(e.target.value);
    socketRef.current?.emit('title_change', { docId, title: e.target.value });
  }

  function saveDoc() {
    const content = quillRef.current?.root.innerHTML || '';
    socketRef.current?.emit('save_doc', { docId, title, content, owner: username });
  }

  function copyDocId() {
    navigator.clipboard.writeText(docId);
    showToast('Document ID copied!', '⎘');
  }

  useEffect(() => {
    const t = setInterval(saveDoc, 30000);
    return () => clearInterval(t);
  }, [title]);

  return (
    <div style={S.wrap}>
      {/* Navbar */}
      <div style={S.navbar}>
        <div style={S.navLeft}>
          <div style={S.logo}>Draft<span style={S.logoDot} /></div>
          <input style={S.titleInput} value={title} onChange={handleTitleChange} onBlur={saveDoc} />
        </div>
        <div style={S.navRight}>
          <button style={S.saveBtn} onClick={saveDoc}>Save</button>
          <button style={S.homeBtn} onClick={onHome}>← Home</button>
        </div>
      </div>

      {/* User strip */}
      <div style={S.userStrip}>
        <span style={S.stripLabel}>Editing</span>
        {users.map(u => (
          <div key={u.id} style={{ ...S.userPill, background: u.color + '28', color: u.color }}>
            <div style={{ ...S.userDot, background: u.color }} />
            {u.name}{u.name === username ? ' (you)' : ''}
          </div>
        ))}
        <div style={S.docIdWrap} onClick={copyDocId} title="Click to copy & share with collaborators">
          <span style={S.docIdText}>ID: {docId.slice(0, 13)}…</span>
          <span style={S.docIdIcon}>⎘</span>
        </div>
      </div>

      {/* Editor */}
      <div style={S.editorWrap}>
        <div style={S.paper}>
          <div ref={editorRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} />
        </div>
      </div>

      {/* Status bar */}
      <div style={S.statusBar}>
        <span style={{ color: connected ? C.blue2 : '#e06c75' }}>
          {connected ? '● Connected' : '○ Disconnected'}
        </span>
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
        <span>{users.length} {users.length === 1 ? 'editor' : 'editors'}</span>
      </div>

      {/* Toast */}
      {toast && (
        <div style={S.toastWrap}>
          <div style={S.toast} className={toast.exiting ? 'toast-exit' : 'toast-enter'}>
            <span style={S.toastIcon}>{toast.icon}</span>
            <span style={S.toastText}>{toast.msg}</span>
            <span style={S.toastTime}>{toast.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}