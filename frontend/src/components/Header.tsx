import { useState, useEffect } from 'react';

interface HeaderProps {
  ollamaConnected: boolean;
}

export function Header({ ollamaConnected }: HeaderProps) {
  const [statusText, setStatusText] = useState('Checking...');

  useEffect(() => {
    if (ollamaConnected) {
      setStatusText('IA Connected');
    } else {
      setStatusText('IA Disconnected');
    }
  }, [ollamaConnected]);

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">CV Editor</h1>
      </div>
      <div className="header-right">
        <div className={`status-badge ${ollamaConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {statusText}
        </div>
      </div>
    </header>
  );
}
