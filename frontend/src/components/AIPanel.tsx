import { useState } from 'react';
import type { CVVersion } from '../types';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGetRecommendations: () => Promise<{ recommendations: string; improved_yaml: string } | null>;
  onGetCapabilities: (capabilities: string) => Promise<{ suggestions: string; additional_yaml: string } | null>;
  onGenerateVersions: () => Promise<CVVersion[]>;
  onApplyYaml: (yaml: string) => void;
  loading: boolean;
}

export function AIPanel({
  isOpen,
  onClose,
  onGetRecommendations,
  onGetCapabilities,
  onGenerateVersions,
  onApplyYaml,
  loading,
}: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<'recommend' | 'capabilities' | 'versions'>('recommend');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [improvedYaml, setImprovedYaml] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [additionalYaml, setAdditionalYaml] = useState<string | null>(null);
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleRecommend = async () => {
    setProcessing(true);
    const result = await onGetRecommendations();
    if (result) {
      setRecommendations(result.recommendations);
      setImprovedYaml(result.improved_yaml);
    }
    setProcessing(false);
  };

  const handleCapabilities = async () => {
    if (!capabilitiesInput.trim()) return;
    setProcessing(true);
    const result = await onGetCapabilities(capabilitiesInput);
    if (result) {
      setSuggestions(result.suggestions);
      setAdditionalYaml(result.additional_yaml);
    }
    setProcessing(false);
  };

  const handleVersions = async () => {
    setProcessing(true);
    const result = await onGenerateVersions();
    setVersions(result);
    setProcessing(false);
  };

  const handleApplyImproved = () => {
    if (improvedYaml) {
      onApplyYaml(improvedYaml);
    }
  };

  const handleSelectVersion = (yaml: string) => {
    onApplyYaml(yaml);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h3>Opciones de IA</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === 'recommend' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          Recomendaciones
        </button>
        <button
          className={`ai-tab ${activeTab === 'capabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('capabilities')}
        >
          Capacidades
        </button>
        <button
          className={`ai-tab ${activeTab === 'versions' ? 'active' : ''}`}
          onClick={() => setActiveTab('versions')}
        >
          Versiones
        </button>
      </div>

      <div className="ai-panel-content">
        {activeTab === 'recommend' && (
          <div className="ai-section">
            <p>La IA analizará tu CV y te dará recomendaciones para mejorarlo.</p>
            <button
              className="ai-action-btn"
              onClick={handleRecommend}
              disabled={processing || loading}
            >
              {processing ? 'Analizando...' : 'Obtener Recomendaciones'}
            </button>
            
            {recommendations && (
              <div className="ai-result">
                <h4>Recomendaciones:</h4>
                <pre>{recommendations}</pre>
              </div>
            )}
            
            {improvedYaml && (
              <div className="ai-result">
                <h4>CV Mejorado:</h4>
                <button className="apply-btn" onClick={handleApplyImproved}>
                  Aplicar cambios
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="ai-section">
            <p>Describe habilidades o capacidades que tienes y la IA te sugerirá cómo añadirlas al CV.</p>
            <textarea
              className="capabilities-input"
              placeholder="Ej: Sé programar en Python, tengo experiencia en liderazgo de equipos, certificaciones de AWS..."
              value={capabilitiesInput}
              onChange={(e) => setCapabilitiesInput(e.target.value)}
            />
            <button
              className="ai-action-btn"
              onClick={handleCapabilities}
              disabled={processing || loading || !capabilitiesInput.trim()}
            >
              {processing ? 'Analizando...' : 'Obtener Sugerencias'}
            </button>
            
            {suggestions && (
              <div className="ai-result">
                <h4>Cómo incorporarlas:</h4>
                <pre>{suggestions}</pre>
              </div>
            )}
            
            {additionalYaml && (
              <div className="ai-result">
                <h4>Texto sugerido para añadir:</h4>
                <pre>{additionalYaml}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="ai-section">
            <p>La IA generará múltiples versiones de tu CV optimizadas para diferentes propósitos.</p>
            <button
              className="ai-action-btn"
              onClick={handleVersions}
              disabled={processing || loading}
            >
              {processing ? 'Generando...' : 'Generar Versiones'}
            </button>
            
            {versions.length > 0 && (
              <div className="versions-list">
                {versions.map((version, index) => (
                  <div key={index} className="version-item">
                    <h4>{version.name}</h4>
                    <button
                      className="apply-btn"
                      onClick={() => handleSelectVersion(version.yaml)}
                    >
                      Usar esta versión
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
