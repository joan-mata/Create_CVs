export interface CVData {
  nombre: string;
  email: string;
  telefono: string;
  ubicacion: string;
  foto?: string;
  perfil: {
    texto: string;
  };
  experiencia: Array<{
    empresa: string;
    puesto: string;
    fecha: string;
    descripcion: string;
  }>;
  formacion: Array<{
    titulo: string;
    centro: string;
    fecha: string;
  }>;
  habilidades: {
    tecnicas: string[];
    idiomas: string[];
  };
}

export interface CVVersion {
  name: string;
  yaml: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
