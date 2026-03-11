from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
import base64
import io
import pdfplumber
from typing import Optional

from parser import CVParser
from generator import CVGenerator
from ollama_client import OllamaClient
import os
import yaml

app = FastAPI(title="CV Editor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

parser = CVParser()
generator = CVGenerator()
ollama = OllamaClient()

# Get the current directory of main.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CV_STORAGE_DIR = os.path.join(BASE_DIR, "storage")
os.makedirs(CV_STORAGE_DIR, exist_ok=True)


@app.get("/api/health")
async def health_check():
    connected = ollama.is_connected()
    return {
        "ollama_connected": connected,
        "model": ollama.model if connected else None
    }


@app.post("/api/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        
        # New parser returns (basic_info_dict, raw_text)
        basic_info, raw_text = parser.parse_pdf(content)
        
        # Default to basic info in case AI fails
        yaml_str = parser.to_yaml_string(basic_info)
        
        if ollama.is_connected():
            prompt = f"""Extrae INTEGRAMENTE toda la información del siguiente texto de un CV y preséntala en formato YAML.
No resumas. No omitas ninguna sección. Si el texto es largo, procésalo completamente.

Estructura requerida:
nombre: ""
email: ""
telefono: ""
ubicacion: ""
perfil:
  texto: ""
experiencia:
  - empresa: ""
    puesto: ""
    fecha: ""
    descripcion: ""
proyectos_ingenieria:
  - nombre: ""
    tecnologias: []
    fecha: ""
    descripcion: ""
formacion:
  - titulo: ""
    centro: ""
    fecha: ""
certificados:
  - nombre: ""
    emisor: ""
    fecha: ""
    descripcion: ""
voluntariado:
  - organizacion: ""
    puesto: ""
    fecha: ""
    descripcion: ""
habilidades:
  tecnicas: []
  competencias: []
  idiomas: []

IMPORTANTE: Responde ÚNICAMENTE con el código YAML. Mantén todos los detalles de las descripciones.

Texto del CV:
{raw_text}

YAML:"""

            try:
                print(f"Enviando a Ollama ({len(raw_text)} chars)...")
                response = ollama.generate(prompt, temperature=0.1)
                ai_yaml = response.strip()
                
                # Cleanup robusto de code blocks
                if "```" in ai_yaml:
                    # Intentar extraer lo que hay entre triple backticks
                    parts = ai_yaml.split("```")
                    for part in parts:
                        if ":" in part and ("nombre:" in part or "experiencia:" in part):
                            ai_yaml = part.replace("yaml", "").strip()
                            break
                
                if ":" in ai_yaml:
                    yaml_str = ai_yaml
                    print("Parseo por IA exitoso")
            except Exception as e:
                print(f"Error en Ollama: {e}")
        
        return {
            "yaml": yaml_str,
            "foto": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parseando PDF: {str(e)}")


@app.post("/api/generate-preview")
async def generate_preview(request: dict):
    try:
        yaml_content = request.get("yaml", "")
        foto_base64 = request.get("foto")
        lang = request.get("lang")
        
        pdf_bytes = generator.generate_pdf(yaml_content, foto_base64, lang)
        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
        
        return {"pdf": pdf_base64}
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {str(e)}")


@app.post("/api/ai/recommend")
async def ai_recommend(request: dict):
    try:
        yaml_content = request.get("yaml", "")
        
        if not ollama.is_connected():
            raise HTTPException(status_code=503, detail="Ollama no está conectado")
        
        recommendations, improved_yaml = ollama.get_recommendations(yaml_content)
        
        return {
            "recommendations": recommendations,
            "improved_yaml": improved_yaml
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error con IA: {str(e)}")


@app.post("/api/ai/capabilities")
async def ai_capabilities(request: dict):
    try:
        yaml_content = request.get("yaml", "")
        capabilities = request.get("capabilities", "")
        
        if not ollama.is_connected():
            raise HTTPException(status_code=503, detail="Ollama no está conectado")
        
        suggestions, additional_yaml = ollama.get_capability_suggestions(yaml_content, capabilities)
        
        return {
            "suggestions": suggestions,
            "additional_yaml": additional_yaml
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error con IA: {str(e)}")


@app.post("/api/ai/versions")
async def ai_versions(request: dict):
    try:
        yaml_content = request.get("yaml", "")
        
        if not ollama.is_connected():
            raise HTTPException(status_code=503, detail="Ollama no está conectado")
        
        versions = ollama.generate_versions(yaml_content)
        
        return {"versions": versions}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error con IA: {str(e)}")


@app.post("/api/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    try:
        content = await file.read()
        foto_base64 = f"data:{file.content_type};base64,{base64.b64encode(content).decode('utf-8')}"
        
        return {"base64": foto_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")


@app.post("/api/ai/format")
async def ai_format(request: dict):
    try:
        raw_text = request.get("raw_text", "")
        
        if not ollama.is_connected():
            raise HTTPException(status_code=503, detail="Ollama no está conectado")
        
        prompt = f"""Convierte el siguiente texto de CV en un formato YAML estructurado correctamente. 
Identifica: nombre, email, teléfono, ubicación, perfil profesional, experiencia laboral (empresa, puesto, fecha, descripción), 
formación académica (título, centro, fecha), habilidades técnicas e idiomas.

Usa este formato exacto:
```yaml
nombre: "Nombre completo"
email: "email@ejemplo.com"
telefono: "+34 XXX XXX XXX"
ubicacion: "Ciudad, País"
perfil:
  texto: "Resumen profesional..."
experiencia:
  - empresa: "Empresa"
    puesto: "Puesto"
    fecha: "Fecha"
    descripcion: "Descripción"
proyectos_ingenieria:
  - nombre: "Proyecto"
    tecnologias: ["Tech 1"]
    fecha: "2023"
    descripcion: "Descripción del proyecto"
formacion:
  - titulo: "Título"
    centro: "Centro"
    fecha: "Fecha"
certificados:
  - nombre: "Nombre"
    emisor: "Emisor"
    fecha: "Fecha"
habilidades:
  tecnicas: ["Skill 1", "Skill 2"]
  competencias: ["Competencia 1"]
  idiomas: ["Español nativo"]

```

Texto del CV:
{raw_text}

Responde SOLO con el YAML, sin texto adicional antes o después:"""

        response = ollama.generate(prompt, temperature=0.3)
        
        yaml_str = response.strip()
        yaml_str = yaml_str.replace('"', '"').replace('"', '"').replace(''', "'").replace(''', "'")
        if yaml_str.startswith("```yaml"):
            yaml_str = yaml_str[7:]
        if yaml_str.endswith("```"):
            yaml_str = yaml_str[:-3]
        yaml_str = yaml_str.strip()
        
        return {"yaml": yaml_str}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error con IA: {str(e)}")


@app.post("/api/save-cv")
async def save_cv(request: dict):
    try:
        name = request.get("name", "cv_default")
        yaml_content = request.get("yaml", "")
        
        if not name.endswith(".yaml"):
            name += ".yaml"
            
        file_path = os.path.join(CV_STORAGE_DIR, name)
        with open(file_path, "w") as f:
            f.write(yaml_content)
            
        return {"message": f"CV guardado como {name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando CV: {str(e)}")


@app.get("/api/cvs")
async def list_cvs():
    try:
        files = [f for f in os.listdir(CV_STORAGE_DIR) if f.endswith(".yaml")]
        # Try to include the main example file if it's in root
        root_cv = os.path.join(BASE_DIR, "cv_joan_esp.yaml")
        if os.path.exists(root_cv):
            files.append("cv_joan_esp.yaml (Root)")
            
        return {"cvs": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listando CVs: {str(e)}")


@app.get("/api/cv/{name}")
async def get_cv(name: str):
    try:
        if name == "cv_joan_esp.yaml (Root)":
            file_path = os.path.join(BASE_DIR, "cv_joan_esp.yaml")
        else:
            file_path = os.path.join(CV_STORAGE_DIR, name)
            
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="CV no encontrado")
            
        with open(file_path, "r") as f:
            content = f.read()
            
        return {"yaml": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cargando CV: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
