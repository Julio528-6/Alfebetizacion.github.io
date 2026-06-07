import zipfile
import xml.etree.ElementTree as ET
import re

def search_details(filepath):
    print(f"\n=================== ANALYZING: {filepath} ===================")
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
            
            # Let's search for "PFC" and "Formación Complementaria" paragraphs
            print("\n--- PFC / FORMACIÓN COMPLEMENTARIA SECTIONS ---")
            for i, p in enumerate(paragraphs):
                if any(k in p.lower() for k in ["pfc", "formación complementaria", "formacion complementaria"]):
                    print(f"P.{i}: {p}")
            
            # Search for numbers resembling phones, emails, or matriculas
            print("\n--- CONTACT / MATRICULA / SEDE SECTIONS ---")
            for i, p in enumerate(paragraphs):
                if any(k in p.lower() for k in ["contacto", "teléfono", "telefono", "correo", "email", "matrícula", "matricula", "sede", "lugar", "dirección", "direccion", "marquetalia", "inscripción", "inscripcion"]):
                    # Show it
                    print(f"P.{i}: {p[:300]}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

# Run it
search_details("recursos/PROYECTO DE ALFABETIZACIÓN.docx")
