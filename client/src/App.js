import React, { useState } from 'react';
import Home from './components/Home';
import Editor from './components/Editor';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: 'red' }}>
          <h2>Something crashed:</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [page, setPage]         = useState('home');
  const [docId, setDocId]       = useState(null);
  const [username, setUsername] = useState('');

  function openDoc(id, name) {
    setDocId(id);
    setUsername(name);
    setPage('editor');
  }

  function goHome() {
    setPage('home');
    setDocId(null);
  }

  return (
    <ErrorBoundary>
      {page === 'editor' && docId
        ? <Editor docId={docId} username={username} onHome={goHome} />
        : <Home onOpen={openDoc} />
      }
    </ErrorBoundary>
  );
}