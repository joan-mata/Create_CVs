interface PreviewProps {
  pdfBase64: string | null;
}

export function Preview({ pdfBase64 }: PreviewProps) {
  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h2>Preview</h2>
      </div>
      <div className="preview-container">
        {pdfBase64 ? (
          <iframe
            src={`data:application/pdf;base64,${pdfBase64}`}
            className="preview-iframe"
            title="CV Preview"
          />
        ) : (
          <div className="preview-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>Sube un PDF o edita el CV para ver el preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
