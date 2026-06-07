import zipfile
import xml.etree.ElementTree as ET
import re

def search_in_docx(filepath, keywords):
    print(f"\n=================== SEARCHING IN: {filepath} ===================")
    try:
        with zipfile.ZipFile(filepath, 'r') as docx:
            # Read document.xml
            doc_xml = docx.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            
            # Find all text paragraphs
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
            
            # Print paragraphs matching keywords
            matches = 0
            for i, p in enumerate(paragraphs):
                # Check for keywords (case insensitive)
                for kw in keywords:
                    if re.search(r'\b' + re.escape(kw) + r'\b', p, re.IGNORECASE):
                        print(f"[Match for '{kw}' at p.{i}]: {p[:400]}")
                        # Also print neighboring paragraphs for context
                        start = max(0, i - 1)
                        end = min(len(paragraphs), i + 3)
                        print("--- CONTEXT ---")
                        for idx in range(start, end):
                            prefix = ">>> " if idx == i else "    "
                            print(f"{prefix}{idx}: {paragraphs[idx]}")
                        print("----------------\n")
                        matches += 1
                        break # Only print once per paragraph
            print(f"Total matches found: {matches}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

# Keywords to search
keywords = ["PFC", "Complementaria", "Matrícula", "Matricularse", "Contacto", "Matricular", "Sede", "Escenario", "Inscripción", "Teléfono", "Email"]
search_in_docx("recursos/PEI 2022.docx", keywords)
search_in_docx("recursos/PROYECTO DE ALFABETIZACIÓN.docx", keywords)
