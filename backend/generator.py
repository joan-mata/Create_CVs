import yaml
import base64
import io
import tempfile
from fpdf import FPDF
from typing import Dict, Any, Optional


def safe_text(text: Any) -> str:
    if text is None:
        return ""
    # Standardize quotes and common unicode characters that break FPDF core fonts
    text = str(text)
    replacements = {
        '\u2013': '-', # en-dash
        '\u2014': '-', # em-dash
        '\u2018': "'", # left single quote
        '\u2019': "'", # right single quote
        '\u201c': '"', # left double quote
        '\u201d': '"', # right double quote
        '\u2022': '*', # bullet
        '\u2026': '...', # ellipsis
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    # FPDF2 core fonts use latin-1. We MUST ensure the text is encodable in latin-1
    # or it will raise a UnicodeEncodeError during pdf.output().
    # Using 'ignore' or 'replace' ensures stability.
    return text.encode('latin-1', 'replace').decode('latin-1')


class CVGenerator:
    def __init__(self):
        self.lang = 'es'
        self.explicit_lang = False
        self.titles = {
            'es': {
                'profile': 'PERFIL PROFESIONAL',
                'experience': 'EXPERIENCIA PROFESIONAL',
                'projects': 'PROYECTOS DE INGENIERÍA Y DESARROLLO INDEPENDIENTE',
                'education': 'FORMACIÓN ACADÉMICA',
                'skills': 'HABILIDADES',
                'certificates': 'CERTIFICADOS',
                'volunteering': 'VOLUNTARIADO',
                'tech_skills': 'Técnicas: ',
                'soft_skills': 'Competencias: ',
                'languages': 'Idiomas: ',
                'tech_label': 'Tecnologías: '
            },
            'en': {
                'profile': 'PROFESSIONAL PROFILE',
                'experience': 'PROFESSIONAL EXPERIENCE',
                'projects': 'ENGINEERING PROJECTS AND INDEPENDENT DEVELOPMENT',
                'education': 'ACADEMIC BACKGROUND',
                'skills': 'SKILLS',
                'certificates': 'CERTIFICATES',
                'volunteering': 'VOLUNTEERING',
                'tech_skills': 'Technical: ',
                'soft_skills': 'Soft Skills: ',
                'languages': 'Languages: ',
                'tech_label': 'Technologies: '
            }
        }

    def _get_val(self, data, es_key, en_key, default=None):
        if not isinstance(data, dict):
            return default
        if en_key in data:
            if not self.explicit_lang:
                self.lang = 'en'
            return data[en_key]
        return data.get(es_key, default)
    
    def generate_pdf(self, yaml_content: Any, foto_base64: Optional[str] = None, lang: Optional[str] = None) -> bytes:
        if lang == 'en' or lang == 'es':
            self.lang = str(lang)
            self.explicit_lang = True
        else:
            self.lang = 'es' # Default
            self.explicit_lang = False
        
        # If it's a string, we treat it as YAML. If it's already a dict, we use it directly.
        if isinstance(yaml_content, str):
            # Normalize smart quotes to standard ones
            yaml_content = yaml_content.replace('"', '"').replace('"', '"').replace("'", "'").replace("'", "'")
            try:
                cv_data = yaml.safe_load(yaml_content)
            except Exception as e:
                print(f"YAML load error: {e}")
                cv_data = self._get_default_cv()
        else:
            cv_data = yaml_content
            
        if not cv_data:
            cv_data = self._get_default_cv()
        
        cv_data = self._merge_with_defaults(cv_data)
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Header with Photo Support
        start_y = pdf.get_y()
        
        # Define areas
        info_width = 145
        photo_size = 35
        margin_right = 10
        photo_x = 210 - margin_right - photo_size
        
        # Center point for the line relative to the photo
        center_y = start_y + (photo_size / 2)
        
        # 1. Name (Above the line)
        pdf.set_font('helvetica', 'B', 24)
        pdf.set_text_color(30, 41, 59)
        nombre = safe_text(self._get_val(cv_data, 'nombre', 'name', 'Tu Nombre'))
        # Center horizontally relative to line length (photo_x - 5 - 10)
        line_len = photo_x - 5 - 10
        pdf.set_xy(10, center_y - 12) 
        pdf.cell(line_len, 10, nombre, ln=False, align='C')
        
        # 2. Blue Line (At center of photo)
        pdf.set_line_width(0.6)
        pdf.set_draw_color(37, 99, 235)
        pdf.line(10, center_y, photo_x - 5, center_y)
        
        # 3. Contact Info (Below the line)
        pdf.set_xy(10, center_y + 2)
        pdf.set_font('helvetica', '', 10)
        pdf.set_text_color(71, 85, 105)
        contact_lines = [
            self._get_val(cv_data, 'email', 'email', ''),
            self._get_val(cv_data, 'telefono', 'phone', ''),
            self._get_val(cv_data, 'ubicacion', 'location', ''),
            self._get_val(cv_data, 'website', 'url', '')
        ]
        contact_str = "  |  ".join([line for line in contact_lines if line])
        pdf.cell(line_len, 6, safe_text(contact_str), ln=False, align='C')
        
        # 4. Photo (Right side)
        if foto_base64:
            try:
                if "base64," in foto_base64:
                    foto_base64 = foto_base64.split("base64,")[1]
                
                img_data = base64.b64decode(foto_base64)
                img_file = io.BytesIO(img_data)
                pdf.image(img_file, x=photo_x, y=start_y, w=photo_size, h=photo_size)
            except Exception as e:
                print(f"Error processing image: {e}")
        
        # Set Y for the next section
        pdf.set_y(start_y + photo_size + 8)
        
        # Sections
        perfil = self._get_val(cv_data, 'perfil', 'profile', {})
        perfil_texto = self._get_val(perfil, 'texto', 'text')
        if perfil_texto:
            self._add_section_title(pdf, self.titles[self.lang]['profile'])
            pdf.set_font('helvetica', '', 10)
            pdf.set_text_color(51, 65, 85)
            pdf.multi_cell(0, 5, safe_text(perfil_texto))
            pdf.ln(5)
            
        experiencia = self._get_val(cv_data, 'experiencia', 'experience')
        if experiencia and isinstance(experiencia, list):
            self._add_section_title(pdf, self.titles[self.lang]['experience'])
            for exp in experiencia:
                if not isinstance(exp, dict): continue
                puesto = self._get_val(exp, 'puesto', 'position', '')
                empresa = self._get_val(exp, 'empresa', 'company', '')
                fecha = exp.get('fecha', exp.get('date', ''))
                descripcion = self._get_val(exp, 'descripcion', 'description', '')
                
                pdf.set_font('helvetica', 'B', 10)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(line_len, 5, safe_text(puesto))
                pdf.set_font('helvetica', '', 9)
                pdf.cell(0, 5, safe_text(fecha), ln=True, align='R')
                
                pdf.set_font('helvetica', 'I', 9)
                pdf.set_text_color(71, 85, 105)
                pdf.cell(0, 5, safe_text(empresa), ln=True)
                
                if descripcion:
                    self._render_description(pdf, descripcion)
                pdf.ln(3)

        proyectos = self._get_val(cv_data, 'proyectos_ingenieria', 'projects')
        if proyectos:
            if isinstance(proyectos, str):
                try:
                    proyectos = yaml.safe_load(proyectos)
                except:
                    proyectos = []
            
            if isinstance(proyectos, list) and len(proyectos) > 0:
                self._add_section_title(pdf, self.titles[self.lang]['projects'])
                for proj in proyectos:
                    if not isinstance(proj, dict): continue
                    nombre_proj = self._get_val(proj, 'nombre', 'name', '')
                    fecha_proj = proj.get('fecha', proj.get('date', ''))
                    techs = self._get_val(proj, 'tecnologias', 'technologies', [])
                    desc_proj = self._get_val(proj, 'descripcion', 'description', '')

                    pdf.set_font('helvetica', 'B', 10)
                    pdf.set_text_color(30, 41, 59)
                    
                    # Title and Date
                    line_len = 140
                    pdf.cell(line_len, 5, safe_text(nombre_proj))
                    pdf.set_font('helvetica', '', 9)
                    pdf.cell(0, 5, safe_text(fecha_proj), ln=True, align='R')
                    
                    if techs and isinstance(techs, list):
                        pdf.set_font('helvetica', 'I', 8)
                        pdf.set_text_color(71, 85, 105)
                        tech_str = self.titles[self.lang]['tech_label'] + ", ".join(techs)
                        pdf.multi_cell(0, 4, safe_text(tech_str))
                    
                    if desc_proj:
                        self._render_description(pdf, desc_proj)
                    pdf.ln(2)

        formacion = self._get_val(cv_data, 'formacion', 'education')
        if formacion and isinstance(formacion, list):
            self._add_section_title(pdf, self.titles[self.lang]['education'])
            for edu in formacion:
                if not isinstance(edu, dict): continue
                titulo_edu = self._get_val(edu, 'titulo', 'title', '')
                centro_edu = self._get_val(edu, 'centro', 'institution', '')
                fecha_edu = edu.get('fecha', edu.get('date', ''))
                
                pdf.set_font('helvetica', 'B', 10)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(line_len, 5, safe_text(titulo_edu))
                pdf.set_font('helvetica', '', 9)
                pdf.cell(0, 5, safe_text(fecha_edu), ln=True, align='R')
                
                pdf.set_font('helvetica', 'I', 9)
                pdf.set_text_color(71, 85, 105)
                pdf.cell(0, 5, safe_text(centro_edu), ln=True)
                pdf.ln(2)

        habilidades = self._get_val(cv_data, 'habilidades', 'skills')
        if habilidades and isinstance(habilidades, dict):
            self._add_section_title(pdf, self.titles[self.lang]['skills'])
            
            # 1. Técnicas
            tecnicas = self._get_val(habilidades, 'tecnicas', 'technical')
            if tecnicas and isinstance(tecnicas, list):
                pdf.set_font('helvetica', 'B', 9)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(35, 5, safe_text(self.titles[self.lang]['tech_skills']))
                pdf.set_font('helvetica', '', 9)
                pdf.set_text_color(51, 65, 85)
                content = "\n".join(tecnicas)
                pdf.multi_cell(0, 5, safe_text(content))
                pdf.ln(1)

            # 2. Competencias
            competencias = self._get_val(habilidades, 'competencias', 'soft_skills')
            if competencias and isinstance(competencias, list):
                pdf.set_font('helvetica', 'B', 9)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(35, 5, safe_text(self.titles[self.lang]['soft_skills']))
                pdf.set_font('helvetica', '', 9)
                pdf.set_text_color(51, 65, 85)
                content = "\n".join(competencias)
                pdf.multi_cell(0, 5, safe_text(content))
                pdf.ln(1)
                
            # 3. Idiomas
            idiomas = self._get_val(habilidades, 'idiomas', 'languages')
            if idiomas and isinstance(idiomas, list):
                pdf.set_font('helvetica', 'B', 9)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(35, 5, safe_text(self.titles[self.lang]['languages']))
                pdf.set_font('helvetica', '', 9)
                pdf.set_text_color(51, 65, 85)
                content = ", ".join(idiomas)
                pdf.multi_cell(0, 5, safe_text(content))
            pdf.ln(3)

        certificados = self._get_val(cv_data, 'certificados', 'certificates')
        if certificados and isinstance(certificados, list):
            self._add_section_title(pdf, self.titles[self.lang]['certificates'])
            for cert in certificados:
                if not isinstance(cert, dict): continue
                nombre_cert = self._get_val(cert, 'nombre', 'name', '')
                emisor_cert = self._get_val(cert, 'emisor', 'issuer', '')
                fecha_cert = cert.get('fecha', cert.get('date', ''))
                desc_cert = self._get_val(cert, 'descripcion', 'description', '')
                
                pdf.set_font('helvetica', 'B', 10)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(line_len, 5, safe_text(nombre_cert))
                pdf.set_font('helvetica', '', 9)
                pdf.cell(0, 5, safe_text(fecha_cert), ln=True, align='R')
                
                pdf.set_font('helvetica', 'I', 9)
                pdf.set_text_color(71, 85, 105)
                pdf.cell(0, 5, safe_text(emisor_cert), ln=True)
                
                if desc_cert:
                    self._render_description(pdf, desc_cert)
                pdf.ln(2)

        voluntariado = self._get_val(cv_data, 'voluntariado', 'volunteering')
        if voluntariado and isinstance(voluntariado, list):
            self._add_section_title(pdf, self.titles[self.lang]['volunteering'])
            for vol in voluntariado:
                if not isinstance(vol, dict): continue
                rol_vol = self._get_val(vol, 'puesto', 'role', '')
                org_vol = self._get_val(vol, 'organizacion', 'organization', '')
                fecha_vol = vol.get('fecha', vol.get('date', ''))
                desc_vol = self._get_val(vol, 'descripcion', 'description', '')
                
                pdf.set_font('helvetica', 'B', 10)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(line_len, 5, safe_text(rol_vol))
                pdf.set_font('helvetica', '', 9)
                pdf.cell(0, 5, safe_text(fecha_vol), ln=True, align='R')
                
                pdf.set_font('helvetica', 'I', 9)
                pdf.set_text_color(71, 85, 105)
                pdf.cell(0, 5, safe_text(org_vol), ln=True)
                
                if desc_vol:
                    self._render_description(pdf, desc_vol)
                pdf.ln(3)
        
        return pdf.output()

    def _add_section_title(self, pdf, title):
        # Add more space before the section title unless we are at the top of the content area
        if pdf.get_y() > 60:
            pdf.ln(6)
            
        pdf.set_font('helvetica', 'B', 11)
        pdf.set_text_color(37, 99, 235)
        pdf.cell(0, 6, title, ln=True)
        pdf.set_draw_color(226, 232, 240)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(4)

    def _render_description(self, pdf, data):
        """Renders description supporting nested bullet points based on indentation."""
        pdf.set_font('helvetica', '', 9)
        pdf.set_text_color(51, 65, 85)
        
        if isinstance(data, list):
            for item in data:
                pdf.set_x(15)
                pdf.cell(5, 4, safe_text("-"), ln=False)
                pdf.multi_cell(0, 4, safe_text(str(item)))
            return

        if not isinstance(data, str):
            pdf.multi_cell(0, 4, safe_text(str(data)))
            return

        lines = data.split('\n')
        # Check if the whole thing is just a plain block (no markers anywhere)
        has_markers = any(l.strip().startswith(('-', '*')) for l in lines if l.strip())
        
        if not has_markers:
            pdf.multi_cell(0, 4, safe_text(data))
            return

        for line in lines:
            if not line.strip():
                continue
            
            # Calculate indentation level (count leading spaces)
            stripped_line = line.lstrip()
            indent_size = len(line) - len(stripped_line)
            
            # Determine level (approx 2-4 spaces per level)
            level = indent_size // 2 
            
            content = stripped_line
            # Remove markers
            if content.startswith(('- ', '* ')):
                content = content[2:]
            elif content.startswith(('-', '*')):
                content = content[1:].strip()
            
            # Base X is 10. Margin for level 0 is 0. Level 1 is 5.
            # We use x=15 for level 0 bullets in this logic
            bullet_x = 15 + (level * 5)
            pdf.set_x(bullet_x)
            
            marker = "-" if level == 0 else "o" # Sub-bullet marker
            pdf.cell(4, 4, safe_text(marker), ln=False)
            
            # Text with indentation
            pdf.multi_cell(0, 4, safe_text(content))

    def _merge_with_defaults(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Bilingual-aware merge that doesn't overwrite English properties with Spanish defaults."""
        # Simple non-destructive merge
        if 'profile' not in cv_data and 'perfil' not in cv_data:
            cv_data['perfil'] = {"texto": ""}
        if 'experience' not in cv_data and 'experiencia' not in cv_data:
            cv_data['experiencia'] = []
        if 'projects' not in cv_data and 'proyectos_ingenieria' not in cv_data:
            cv_data['projects'] = []
        if 'skills' not in cv_data and 'habilidades' not in cv_data:
            cv_data['habilidades'] = {"tecnicas": [], "competencias": [], "idiomas": []}
        return cv_data

    def _get_default_cv(self) -> Dict[str, Any]:
        return {
            "nombre": "Tu Nombre",
            "email": "email@ejemplo.com",
            "telefono": "",
            "ubicacion": "",
            "perfil": {"texto": ""},
            "experiencia": [],
            "proyectos_ingenieria": [{"nombre": "", "fecha": "", "tecnologias": [], "descripcion": ""}],
            "voluntariado": [],
            "formacion": [],
            "certificados": [],
            "habilidades": {"tecnicas": [], "competencias": [], "idiomas": []}
        }

