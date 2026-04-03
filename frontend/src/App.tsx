import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { AIPanel } from './components/AIPanel';
import { Toast } from './components/Toast';
import { useCV } from './hooks/useCV';
import type { ToastMessage } from './types';
import './App.css';

function App() {
  const {
    yaml,
    setYaml,
    pdfBase64,
    loading,
    error,
    parsePdf,
    generatePreview,
    uploadPhoto,
    getAiRecommendations,
    getCapabilitySuggestions,
    generateVersions,
    exportPdf,
    saveCv,
    fetchCvs,
    loadCv,
    tailorCV,
    getAtsScan,
    generateCoverLetter,
    optimizeAchievement,
  } = useCV();

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [cvVersions, setCvVersions] = useState<string[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [lang, setLang] = useState<'es' | 'en'>('es');

  const refreshCvs = useCallback(async () => {
    const cvs = await fetchCvs();
    setCvVersions(cvs);
  }, [fetchCvs]);

  useEffect(() => {
    refreshCvs();
  }, [refreshCvs]);

  const handleSave = async () => {
    const name = prompt('Nombre para esta versión:', 'cv_v1');
    if (name) {
      const success = await saveCv(name);
      if (success) {
        addToast('success', 'CV guardado correctamente');
        refreshCvs();
      }
    }
  };

  const handleLoad = async (name: string) => {
    const success = await loadCv(name);
    if (success) {
      addToast('success', `CV ${name} cargado`);
      setTimeout(() => generatePreview(lang), 100);
    }
  };

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setOllamaConnected(data.ollama_connected);
      } catch {
        setOllamaConnected(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      addToast('error', error);
    }
  }, [error, addToast]);

  const handleApplyYaml = (newYaml: string) => {
    setYaml(newYaml);
    setAiPanelOpen(false);
    addToast('success', 'CV actualizado');
    setTimeout(() => generatePreview(lang), 100);
  };

  return (
    <div className="app">
      <Header ollamaConnected={ollamaConnected} />
      
      <Toolbar
        onUploadPdf={parsePdf}
        onUploadPhoto={uploadPhoto}
        onGeneratePreview={() => generatePreview(lang)}
        onExportPdf={exportPdf}
        onToggleAiPanel={() => setAiPanelOpen(!aiPanelOpen)}
        loading={loading}
      />

      <div className="versions-bar">
        <button className="btn-secondary" onClick={handleSave}>💾 Guardar Versión</button>
        <button className="btn-secondary" onClick={() => setShowVersions(!showVersions)}>
          {showVersions ? '📁 Ocultar Versiones' : '📁 Ver Versiones'}
        </button>

        <div className="lang-selector">
          <button 
            className={`btn-lang ${lang === 'es' ? 'active' : ''}`} 
            onClick={() => setLang('es')}
          >ES</button>
          <button 
            className={`btn-lang ${lang === 'en' ? 'active' : ''}`} 
            onClick={() => setLang('en')}
          >EN</button>
        </div>
        {showVersions && (
          <div className="cv-versions-list">
            {cvVersions.map(cv => (
              <button key={cv} className="btn-version" onClick={() => handleLoad(cv)}>
                {cv.replace('.yaml', '')}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="main-content">
        <Editor value={yaml} onChange={setYaml} />
        <Preview pdfBase64={pdfBase64} />
      </main>

      <AIPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        onGetRecommendations={getAiRecommendations}
        onGetCapabilities={getCapabilitySuggestions}
        onGenerateVersions={generateVersions}
        onTailor={tailorCV}
        onAtsScan={getAtsScan}
        onCoverLetter={generateCoverLetter}
        onOptimizeAchievement={optimizeAchievement}
        onApplyYaml={handleApplyYaml}
        loading={loading}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
