import { useRef } from 'react';

interface ToolbarProps {
  onUploadPdf: (file: File) => void;
  onUploadPhoto: (file: File) => void;
  onGeneratePreview: () => void;
  onExportPdf: () => void;
  onToggleAiPanel: () => void;
  loading: boolean;
}

export function Toolbar({
  onUploadPdf,
  onUploadPhoto,
  onGeneratePreview,
  onExportPdf,
  onToggleAiPanel,
  loading,
}: ToolbarProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPdf(file);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPhoto(file);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={() => pdfInputRef.current?.click()}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          Subir PDF
        </button>
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          onChange={handlePdfChange}
          style={{ display: 'none' }}
        />

        <button
          className="toolbar-btn"
          onClick={() => photoInputRef.current?.click()}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Subir Foto
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="toolbar-group">
        <button
          className="toolbar-btn primary"
          onClick={onGeneratePreview}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Actualizar Preview
        </button>
      </div>

      <div className="toolbar-group">
        <button
          className="toolbar-btn ai"
          onClick={onToggleAiPanel}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Herramientas IA
        </button>

        <button
          className="toolbar-btn export"
          onClick={onExportPdf}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Exportar PDF
        </button>
      </div>
    </div>
  );
}
