interface PhotoUploaderProps {
  foto: string | null;
  onUpload: (file: File) => void;
}

export function PhotoUploader({ foto, onUpload }: PhotoUploaderProps) {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="photo-uploader" onClick={handleClick}>
      {foto ? (
        <img src={foto} alt="Foto de perfil" className="photo-preview" />
      ) : (
        <div className="photo-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <span>Subir foto</span>
        </div>
      )}
    </div>
  );
}
