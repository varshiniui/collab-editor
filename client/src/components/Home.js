import React, { useState, useEffect } from 'react';
import axios from 'axios';

const C = {
  bg:      '#bec8d8',
  surface: '#cdd5e0',
  white:   '#ffffff',
  blue:    '#3d5a8a',
  blue2:   '#5b8fd4',
  navy:    '#1a2030',
  muted:   'rgba(26,32,48,0.42)',
  line:    'rgba(26,32,48,0.09)',
  line2:   'rgba(26,32,48,0.18)',
};

const S = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(145deg, #b0bccf 0%, #bec8d8 50%, #c8d2e0 100%)`,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '64px 24px 100px',
  },
  header: { width: '100%', maxWidth: 680, marginBottom: 52 },
  logoRow: { display: 'flex', alignItems: 'baseline', gap: 10 },
  logo: {
    fontFamily: "'Sora', sans-serif", fontSize: 48,
    fontWeight: 600, letterSpacing: '-0.02em', color: C.navy, lineHeight: 1,
  },
  logoBadge: {
    fontSize: 10, fontWeight: 500, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: C.blue2,
    background: 'rgba(91,143,212,0.15)',
    border: '1px solid rgba(91,143,212,0.3)',
    padding: '3px 9px', borderRadius: 100,
  },
  rule: { width: 36, height: 2, background: `linear-gradient(90deg, ${C.blue2}, ${C.blue})`, margin: '14px 0 12px', border: 'none', borderRadius: 2 },
  tagline: { fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.muted, fontWeight: 400 },
  card: {
    width: '100%', maxWidth: 680,
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(8px)',
    border: `1px solid rgba(255,255,255,0.6)`,
    borderRadius: 12, padding: '36px 40px',
    marginBottom: 18,
    boxShadow: '0 4px 32px rgba(26,32,48,0.12)',
  },
  label: {
    fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
    color: C.blue, fontWeight: 600, marginBottom: 14, display: 'block',
  },
  row: { display: 'flex', gap: 10, marginBottom: 8 },
  input: {
    flex: 1, background: 'rgba(190,200,216,0.3)',
    border: `1px solid ${C.line2}`, borderRadius: 7,
    padding: '12px 16px', fontFamily: "'Sora', sans-serif",
    fontSize: 15, fontWeight: 300, color: C.navy,
    outline: 'none', transition: 'border-color 0.2s',
  },
  btn: {
    background: C.navy, border: 'none', borderRadius: 7,
    padding: '12px 22px', color: '#fff',
    fontFamily: "'Sora', sans-serif", fontSize: 11,
    letterSpacing: '0.18em', textTransform: 'uppercase',
    cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
    transition: 'all 0.2s', flexShrink: 0,
  },
  btnBlue: { background: `linear-gradient(135deg, ${C.blue2}, ${C.blue})`, boxShadow: '0 2px 10px rgba(91,143,212,0.35)' },
  divider: { height: 1, background: `linear-gradient(90deg, transparent, ${C.line2}, transparent)`, margin: '28px 0' },
  docItem: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0', borderBottom: `1px solid ${C.line}`,
    cursor: 'pointer', gap: 12,
  },
  docTitle: { fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 400, color: C.navy, letterSpacing: '0.01em' },
  docMeta: { fontSize: 11, color: C.muted, marginTop: 3, letterSpacing: '0.06em' },
  delBtn: {
    background: 'none', border: `1px solid ${C.line2}`,
    borderRadius: 6, padding: '5px 12px', fontSize: 10,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: C.muted, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
  },
  empty: { textAlign: 'center', padding: '32px 0', fontFamily: "'Lora', serif", fontSize: 16, fontStyle: 'italic', color: C.muted },
};

export default function Home({ onOpen }) {
  const [docs, setDocs]             = useState([]);
  const [username, setUsername]     = useState('');
  const [newTitle, setNewTitle]     = useState('');
  const [docIdInput, setDocIdInput] = useState('');
  const [loading, setLoading]       = useState(false);

  // Fetch docs whenever username changes
  useEffect(() => {
    if (username.trim()) fetchDocs(username.trim());
    else setDocs([]);
  }, [username]);

  async function fetchDocs(owner) {
    setLoading(true);
    try {
      const r = await axios.get(`/api/docs?owner=${encodeURIComponent(owner)}`);
      setDocs(r.data);
    } catch { setDocs([]); }
    setLoading(false);
  }

  async function createDoc() {
    if (!username.trim()) return alert('Enter your name first.');
    try {
      const r = await axios.post('/api/docs', {
        title: newTitle.trim() || 'Untitled Document',
        owner: username.trim(),
      });
      setNewTitle('');
      onOpen(r.data.id, username.trim());
    } catch { alert('Could not create document. Is the server running?'); }
  }

  function joinDoc() {
    if (!username.trim()) return alert('Enter your name first.');
    if (!docIdInput.trim()) return alert('Enter a document ID.');
    onOpen(docIdInput.trim(), username.trim());
  }

  async function deleteDoc(e, id) {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    await axios.delete(`/api/docs/${id}`);
    fetchDocs(username.trim());
  }

  function fmt(ts) {
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.logoRow}>
          <div style={S.logo}>Draft</div>
          <span style={S.logoBadge}>Beta</span>
        </div>
        <hr style={S.rule} />
        <div style={S.tagline}>Real-time collaborative writing</div>
      </div>

      <div style={S.card}>
        <span style={S.label}>Your Name</span>
        <div style={S.row}>
          <input style={S.input} placeholder="Who's writing today?"
            value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('title-input')?.focus()} />
        </div>

        <div style={S.divider} />
        <span style={S.label}>New Document</span>
        <div style={S.row}>
          <input id="title-input" style={S.input} placeholder="Document title…"
            value={newTitle} onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createDoc()} />
          <button style={{ ...S.btn, ...S.btnBlue }} onClick={createDoc}>Create</button>
        </div>

        <div style={S.divider} />
        <span style={S.label}>Join by ID</span>
        <div style={S.row}>
          <input style={{ ...S.input, fontFamily: 'monospace', fontSize: 13 }}
            placeholder="Paste document ID to collaborate…"
            value={docIdInput} onChange={e => setDocIdInput(e.target.value)} />
          <button style={S.btn} onClick={joinDoc}>Join</button>
        </div>
      </div>

      <div style={S.card}>
        <span style={S.label}>
          {username.trim() ? `${username}'s Documents` : 'Your Documents'}
        </span>
        {!username.trim()
          ? <div style={S.empty}>Enter your name above to see your documents.</div>
          : loading
            ? <div style={S.empty}>Loading…</div>
            : docs.length === 0
              ? <div style={S.empty}>No documents yet — create one above.</div>
              : docs.map(doc => (
                <div key={doc.id} style={S.docItem} onClick={() => onOpen(doc.id, username.trim())}>
                  <div>
                    <div style={S.docTitle}>{doc.title}</div>
                    <div style={S.docMeta}>Updated {fmt(doc.updated_at)} · {doc.id.slice(0, 8)}…</div>
                  </div>
                  <button style={S.delBtn} onClick={e => deleteDoc(e, doc.id)}>Delete</button>
                </div>
              ))
        }
      </div>
    </div>
  );
}