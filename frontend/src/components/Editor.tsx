interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  return (
    <div className="editor-panel">
      <div className="panel-header">
        <h2>Editor YAML</h2>
      </div>
      <textarea
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Edita tu CV aquí en formato YAML..."
        spellCheck={false}
      />
    </div>
  );
}
