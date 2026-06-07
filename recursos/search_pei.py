import zipfile
import xml.etree.ElementTree as ET
import re

def search_pei(filepath):
    print(f"\n=================== ANALYZING PEI: {filepath} ===================")
    try:
        with zipfile.ZipFile(filepath, 'r') as docx:
            doc_xml = docx.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            
            paragraphs = []
            for elem in root.iter():
                if elem.tag.endswith('}p'):
                    texts = []
                    for child in elem.iter():
                        if child.tag.endswith('}t') and child.text:
                            texts.append(child.text)
                    p_text = "".join(texts).strip()
                    if p_text:
                        paragraphs.append(p_text)
            
            # Print paragraphs containing Formacion Complementaria or PFC
            print("\n--- PFC / FORMACIÓN COMPLEMENTARIA IN PEI ---")
            pfc_count = 0
            for i, p in enumerate(paragraphs):
                # Search for PFC as a whole word or Formación Complementaria
                if re.search(r'\b(pfc|formación complementaria|formacion complementaria)\b', p.lower()):
                    pfc_count += 1
                    if pfc_count <= 40: # Limit output to avoid context overflow
                        print(f"P.{i}: {p[:300]}")
            print(f"Total PFC paragraphs: {pfc_count}")
            
            # Search for Sedes, Inscripcion, Matricula
            print("\n--- SEDES / CAMPUSES / CONTACTS IN PEI ---")
            contact_count = 0
            for i, p in enumerate(paragraphs):
                if any(k in p.lower() for k in ["sede", "sedes", "dirección", "direccion", "teléfono", "telefono", "correo", "email", "contacto"]):
                    contact_count += 1
                    if contact_count <= 40:
                        print(f"P.{i}: {p[:300]}")
            print(f"Total Sede/Contact paragraphs: {contact_count}")
            
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

search_pei("recursos/PEI 2022.docx")
