# AI CV Editor

Este proyecto es un editor de CVs inteligente que utiliza IA para extraer datos de PDFs y generar previsualizaciones profesionales.

## Estructura del Proyecto

- `frontend/`: Aplicación React + Vite.
- `backend/`: Servidor FastAPI en Python.

## Cómo Ejecutar la Aplicación

Para lanzar ambos servicios simultáneamente, puedes usar el script de inicio:

```bash
./start.sh
```

### Ejecución Manual

Si prefieres lanzarlos por separado:

**1. Backend (Python):**
```bash
# Instalar dependencias
pip install -r backend/requirements.txt

# Ejecutar servidor
python3 backend/main.py
```
*El servidor correrá en `http://localhost:8000`*

**2. Frontend (React):**
```bash
cd frontend
npm install
npm run dev
```
*La aplicación estará accesible en `http://localhost:5173`*

## Requisitos

- Python 3.8+
- Node.js & npm
- Ollama (con el modelo `llama3` o similar configurado para la extracción)
