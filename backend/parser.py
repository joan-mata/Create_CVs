import pdfplumber
import yaml
import re
import io
from typing import Dict, Any, List


class CVParser:
    def __init__(self):
        pass
    
    def parse_pdf(self, pdf_content: bytes) -> Dict[str, Any]:
        pdf_file = io.BytesIO(pdf_content)
        text = ""
        try:
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
        
        # We return the raw text cleaned up for the AI to handle
        return self.get_basic_info(text), text
    
    def get_basic_info(self, text: str) -> Dict[str, Any]:
        """Extract only the most reliable info via regex as a starting point."""
        data = {
            "nombre": "",
            "email": "",
            "telefono": "",
            "ubicacion": "",
            "website": ""
        }
        
        email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
        if email_match:
            data["email"] = email_match.group()
        
        phone_match = re.search(r'\+?\d{1,3}[\s.-]?\d{3,4}[\s.-]?\d{3,4}', text)
        if phone_match:
            data["telefono"] = phone_match.group()
            
        # Basic website regex
        website_match = re.search(r'(https?://)?(www\.)?[\w-]+\.[\w.-]{2,}(\/[\w./?%&=-]*)?', text)
        if website_match:
            data["website"] = website_match.group()
            
        # Try to find the name in the first few lines
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in lines[:5]:
            if len(line) > 5 and len(line) < 50 and '@' not in line and not re.search(r'\d{3,}', line):
                data["nombre"] = line
                break
                
        return data

    def to_yaml_string(self, cv_data: Dict[str, Any]) -> str:
        return yaml.dump(cv_data, allow_unicode=True, default_flow_style=False, sort_keys=False)
