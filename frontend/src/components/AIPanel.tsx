import { useState } from 'react';
import type { CVVersion } from '../types';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGetRecommendations: () => Promise<{ recommendations: string; improved_yaml: string } | null>;
  onGetCapabilities: (capabilities: string) => Promise<{ suggestions: string; additional_yaml: string } | null>;
  onGenerateVersions: () => Promise<CVVersion[]>;
  onTailor: (jd: string) => Promise<boolean>;
  onAtsScan: () => Promise<{ score: number; tips: string[] } | null>;
  onCoverLetter: (jd: string) => Promise<string | null>;
  onOptimizeAchievement: (text: string) => Promise<string | null>;
  onApplyYaml: (yaml: string) => void;
  loading: boolean;
}

export function AIPanel({
  isOpen,
  onClose,
  onGetRecommendations,
  onGetCapabilities,
  onGenerateVersions,
  onTailor,
  onAtsScan,
  onCoverLetter,
  onOptimizeAchievement,
  onApplyYaml,
  loading,
}: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<'recommend' | 'capabilities' | 'versions' | 'tailor' | 'ats' | 'letter' | 'achievements'>('recommend');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [jdInput, setJdInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [improvedYaml, setImprovedYaml] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [additionalYaml, setAdditionalYaml] = useState<string | null>(null);
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [atsResult, setAtsResult] = useState<{ score: number; tips: string[] } | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [optimizedAchievement, setOptimizedAchievement] = useState<string | null>(null);
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

  const handleTailor = async () => {
    if (!jdInput.trim()) return;
    setProcessing(true);
    const success = await onTailor(jdInput);
    if (success) {
      alert('CV adaptado correctamente.');
    }
    setProcessing(false);
  };

  const handleAtsScan = async () => {
    setProcessing(true);
    const result = await onAtsScan();
    setAtsResult(result);
    setProcessing(false);
  };

  const handleCoverLetter = async () => {
    if (!jdInput.trim()) return;
    setProcessing(true);
    const letter = await onCoverLetter(jdInput);
    setCoverLetter(letter);
    setProcessing(false);
  };

  const handleOptimizeAchievement = async () => {
    if (!achievementInput.trim()) return;
    setProcessing(true);
    const optimized = await onOptimizeAchievement(achievementInput);
    setOptimizedAchievement(optimized);
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
        <h3>Herramientas de IA</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === 'recommend' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommend')}
        >
          Mejorar
        </button>
        <button
          className={`ai-tab ${activeTab === 'tailor' ? 'active' : ''}`}
          onClick={() => setActiveTab('tailor')}
        >
          Adaptar
        </button>
        <button
          className={`ai-tab ${activeTab === 'ats' ? 'active' : ''}`}
          onClick={() => setActiveTab('ats')}
        >
          ATS
        </button>
        <button
          className={`ai-tab ${activeTab === 'letter' ? 'active' : ''}`}
          onClick={() => setActiveTab('letter')}
        >
          Carta
        </button>
        <button
          className={`ai-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Logros
        </button>
        <button
          className={`ai-tab ${activeTab === 'capabilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('capabilities')}
        >
          Sugerir
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
            <p className="ai-help">La IA analizará tu CV y te dará recomendaciones para mejorarlo.</p>
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
                <div className="result-text">{recommendations}</div>
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

        {activeTab === 'tailor' && (
          <div className="ai-section">
            <p className="ai-help">Adapta tu CV a una oferta de trabajo específica.</p>
            <textarea
              className="ai-textarea"
              placeholder="Pega aquí la descripción del puesto..."
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
            />
            <button
              className="ai-action-btn"
              onClick={handleTailor}
              disabled={processing || loading || !jdInput.trim()}
            >
              {processing ? 'Adaptando...' : 'Adaptar CV'}
            </button>
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="ai-section">
            <p className="ai-help">Evalúa la compatibilidad de tu CV con sistemas automáticos de reclutamiento.</p>
            <button
              className="ai-action-btn"
              onClick={handleAtsScan}
              disabled={processing || loading}
            >
              {processing ? 'Analizando...' : 'Escanear CV'}
            </button>
            {atsResult && (
              <div className="ai-result">
                <div className="ats-score-container">
                  <span className="score-label">Puntuación:</span>
                  <span className={`score-value ${atsResult.score > 70 ? 'high' : 'low'}`}>
                    {atsResult.score}/100
                  </span>
                </div>
                <ul className="ats-tips">
                  {atsResult.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'letter' && (
          <div className="ai-section">
            <p className="ai-help">Genera una carta de presentación para una oferta.</p>
            <textarea
              className="ai-textarea"
              placeholder="Pega aquí la descripción del puesto..."
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
            />
            <button
              className="ai-action-btn"
              onClick={handleCoverLetter}
              disabled={processing || loading || !jdInput.trim()}
            >
              {processing ? 'Generando...' : 'Generar Carta'}
            </button>
            {coverLetter && (
              <div className="ai-result">
                <h4>Carta generada:</h4>
                <pre className="result-text">{coverLetter}</pre>
                <button className="apply-btn" onClick={() => navigator.clipboard.writeText(coverLetter)}>
                  Copiar carta
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="ai-section">
            <p className="ai-help">Convierte una tarea simple en un logro profesional impactante.</p>
            <textarea
              className="ai-textarea"
              placeholder="Ej: Encargado de ventas..."
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
            />
            <button
              className="ai-action-btn"
              onClick={handleOptimizeAchievement}
              disabled={processing || loading || !achievementInput.trim()}
            >
              {processing ? 'Optimizando...' : 'Optimizar Logro'}
            </button>
            {optimizedAchievement && (
              <div className="ai-result">
                <h4>Logro sugerido:</h4>
                <div className="result-text">{optimizedAchievement}</div>
                <button className="apply-btn" onClick={() => navigator.clipboard.writeText(optimizedAchievement)}>
                  Copiar logro
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="ai-section">
            <p className="ai-help">Describe habilidades que tienes y la IA te sugerirá cómo añadirlas.</p>
            <textarea
              className="ai-textarea"
              placeholder="Ej: Sé programar en Python, lidero equipos..."
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
                <h4>Sugerencias:</h4>
                <div className="result-text">{suggestions}</div>
              </div>
            )}
            
            {additionalYaml && (
              <div className="ai-result">
                <h4>YAML adicional sugerido:</h4>
                <pre className="result-text">{additionalYaml}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="ai-section">
            <p className="ai-help">Genera versiones optimizadas para diferentes propósitos.</p>
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
