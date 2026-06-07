import zipfile
import xml.etree.ElementTree as ET

def get_paragraphs(filepath):
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
                    paragraphs.append(p_text)
            return paragraphs
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

# Load paragraphs
p_proj = get_paragraphs("recursos/PROYECTO DE ALFABETIZACIÓN.docx")
p_pei = get_paragraphs("recursos/PEI 2022.docx")

print("\n--- PROYECTO DE ALFABETIZACIÓN (P.180 to P.225) ---")
for idx in range(min(180, len(p_proj)), min(225, len(p_proj))):
    if p_proj[idx]:
        print(f"{idx}: {p_proj[idx]}")

print("\n--- PEI 2022 INSTITUTIONAL INFO (P.0 to P.25) ---")
for idx in range(min(0, len(p_pei)), min(25, len(p_pei))):
    if p_pei[idx]:
        print(f"{idx}: {p_pei[idx]}")

print("\n--- PEI 2022 PFC STUDY PLAN (P.1365 to P.1435) ---")
for idx in range(min(1365, len(p_pei)), min(1435, len(p_pei))):
    if p_pei[idx]:
        print(f"{idx}: {p_pei[idx]}")
