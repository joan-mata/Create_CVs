import { useState, useCallback } from 'react';

const DEFAULT_YAML = `nombre: "Tu Nombre"
email: "email@ejemplo.com"
telefono: ""
ubicacion: ""

perfil:
  texto: "Profesional con experiencia en..."

experiencia:
  - empresa: "Empresa"
    puesto: "Puesto"
    fecha: "2020 - Presente"
    descripcion: "- Descripción del puesto"

formacion:
  - titulo: "Título"
    centro: "Centro"
    fecha: "2015 - 2019"

habilidades:
  tecnicas: ["Skill 1", "Skill 2"]
  idiomas: ["Español nativo"]
`;

export function useCV() {
  const [yaml, setYaml] = useState(DEFAULT_YAML);
  const [foto, setFoto] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsePdf = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al parsear PDF');
      }
      
      const data = await response.json();
      setYaml(data.yaml);
      if (data.foto) {
        setFoto(data.foto);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePreview = useCallback(async (manualLang?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml, foto, lang: manualLang }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar preview');
      }
      
      const data = await response.json();
      setPdfBase64(data.pdf);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [yaml, foto]);

  const uploadPhoto = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al subir foto');
      }
      
      const data = await response.json();
      setFoto(data.base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAiRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml }),
      });
      
      if (!response.ok) {
        throw new Error('Error con IA');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [yaml]);

  const getCapabilitySuggestions = useCallback(async (capabilities: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/capabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml, capabilities }),
      });
      
      if (!response.ok) {
        throw new Error('Error con IA');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [yaml]);

  const generateVersions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml }),
      });
      
      if (!response.ok) {
        throw new Error('Error con IA');
      }
      
      const data = await response.json();
      return data.versions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    } finally {
      setLoading(false);
    }
  }, [yaml]);

  const formatWithAI = useCallback(async (rawText: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText }),
      });
      
      if (!response.ok) {
        throw new Error('Error formateando con IA');
      }
      
      const data = await response.json();
      setYaml(data.yaml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportPdf = useCallback(async () => {
    if (!pdfBase64) {
      await generatePreview();
    }
    
    if (pdfBase64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = 'cv.pdf';
      link.click();
    }
  }, [pdfBase64, generatePreview]);

  const saveCv = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/save-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, yaml }),
      });
      if (!response.ok) throw new Error('Error al guardar CV');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [yaml]);

  const fetchCvs = useCallback(async () => {
    try {
      const response = await fetch('/api/cvs');
      if (!response.ok) throw new Error('Error al listar CVs');
      const data = await response.json();
      return data.cvs;
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const loadCv = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cv/${encodeURIComponent(name)}`);
      if (!response.ok) throw new Error('Error al cargar CV');
      const data = await response.json();
      setYaml(data.yaml);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    yaml,
    setYaml,
    foto,
    setFoto,
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
    formatWithAI,
    saveCv,
    fetchCvs,
    loadCv,
  };
}
