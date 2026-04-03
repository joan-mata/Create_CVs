# AI CV Editor

Este proyecto es un editor de CVs inteligente que utiliza IA para extraer datos de PDFs y generar previsualizaciones profesionales.

## Estructura del Proyecto

- `frontend/`: Aplicación React + Vite.
- `backend/`: Servidor FastAPI en Python.

## Cómo Ejecutar la Aplicación

### 🐳 Opción recomendada: Docker (Servidor Local)
Si tienes Docker instalado, puedes levantar todo el sistema (Frontend, Backend y Base de Datos) con un solo comando:

```bash
./setup-local.sh
```
*La aplicación estará disponible en `http://localhost:8082`*

---

### 💻 Opción: Ejecución Manual (Desarrollo)
Para lanzar los servicios localmente sin Docker:

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
# Puedes instalar y compilar desde la raíz del proyecto
npm install --prefix frontend
npm run build
```
*O ejecutarlos dentro de `frontend/`:*
```bash
cd frontend
npm install
npm run dev
```
*La aplicación estará accesible en `http://localhost:5173` o el puerto de build.*

## Requisitos

- Python 3.8+
- Node.js & npm
- Ollama (con el modelo `llama3` o similar configurado para la extracción)
