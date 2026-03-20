import requests
import json
import os
from typing import Optional

class OllamaClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:1.5b")
    
    def is_connected(self) -> bool:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        if system_prompt:
            payload["system"] = system_prompt
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120
            )
            if response.status_code == 200:
                return response.json().get("response", "")
            else:
                raise Exception(f"Ollama error: {response.status_code}")
        except requests.exceptions.Timeout:
            raise Exception("Timeout al conectar con Ollama")
        except Exception as e:
            raise Exception(f"Error conectando con Ollama: {str(e)}")
    
    def get_recommendations(self, cv_yaml: str) -> tuple[str, str]:
        system_prompt = "Eres un experto en reclutamiento y optimización de CVs para sistemas ATS e IA."
        prompt = f"""Analiza el siguiente CV en formato YAML y proporciona:
1. Recomendaciones específicas para mejorar su impacto, claridad y optimización para ATS (Applicant Tracking Systems).
2. Una versión optimizada del CV en formato YAML, manteniendo la estructura original pero mejorando las descripciones.

IMPORTANTE: El YAML debe ser válido y usar el mismo esquema (incluyendo voluntariado si existe).

CV actual (YAML):
{cv_yaml}

Responde EXACTAMENTE en este formato:
---RECOMENDACIONES---
[Tus recomendaciones aquí en español]
---YAML_MEJORADO---
[El YAML mejorado aquí, solo el código YAML]
"""
        response = self.generate(prompt, system_prompt=system_prompt)
        
        parts = response.split("---YAML_MEJORADO---")
        recommendations = parts[0].replace("---RECOMENDACIONES---", "").strip() if len(parts) > 0 else "No se pudieron generar recomendaciones."
        improved_yaml = parts[1].strip() if len(parts) > 1 else cv_yaml
        
        # Clean up possible markdown code blocks from improved_yaml
        if "```yaml" in improved_yaml:
            improved_yaml = improved_yaml.split("```yaml")[1].split("```")[0].strip()
        elif "```" in improved_yaml:
            improved_yaml = improved_yaml.split("```")[1].split("```")[0].strip()
            
        return recommendations, improved_yaml
    
    def get_capability_suggestions(self, cv_yaml: str, capabilities: str) -> tuple[str, str]:
        prompt = f"""Dado el siguiente CV y las habilidades/logros que el usuario quiere añadir, sugiere cómo integrarlos.
Proporciona también el fragmento YAML correspondiente para añadir o modificar secciones.

CV actual:
{cv_yaml}

Nuevas capacidades:
{capabilities}

Responde en este formato:
---SUGERENCIAS---
[Tus sugerencias aquí]
---YAML_ADICIONAL---
[El YAML adicional para integrar]
"""
        response = self.generate(prompt)
        
        parts = response.split("---YAML_ADICIONAL---")
        suggestions = parts[0].replace("---SUGERENCIAS---", "").strip() if len(parts) > 0 else ""
        additional_yaml = parts[1].strip() if len(parts) > 1 else ""
        
        if "```yaml" in additional_yaml:
            additional_yaml = additional_yaml.split("```yaml")[1].split("```")[0].strip()
            
        return suggestions, additional_yaml
    
    def generate_versions(self, cv_yaml: str) -> list[dict]:
        prompt = f"""Genera 3 versiones estratégicas de este CV en formato YAML basándote en el original.
1. "Professional": Conservador, serio, ideal para grandes empresas.
2. "Moderno": Dinámico, destaca habilidades y impacto, ideal para startups/tech.
3. "Executive": Alto nivel, estratégico, resalta liderazgo y resultados directos.

Responde SOLO en formato JSON válido:
{{
  "versions": [
    {{"name": "Professional", "yaml": "YAML_CONTENT"}},
    {{"name": "Moderno", "yaml": "YAML_CONTENT"}},
    {{"name": "Executive", "yaml": "YAML_CONTENT"}}
  ]
}}

CV Original (YAML):
{cv_yaml}
"""
        response = self.generate(prompt, temperature=0.7)
        
        try:
            # Try to find JSON in response if LLM added extra text
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != 0:
                data = json.loads(response[start:end])
                return data.get("versions", [])
            return []
        except:
            return []
