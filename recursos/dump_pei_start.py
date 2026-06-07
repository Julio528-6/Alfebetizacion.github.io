import zipfile
import xml.etree.ElementTree as ET

def dump_start(filepath):
    try:
        with zipfile.ZipFile(filepath, 'r') as docx:
            doc_xml = docx.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            
            p_idx = 0
            for elem in root.iter():
                if elem.tag.endswith('}p'):
                    texts = []
                    for child in elem.iter():
                        if child.tag.endswith('}t') and child.text:
                            texts.append(child.text)
                    p_text = "".join(texts).strip()
                    if p_text:
                        print(f"P.{p_idx}: {p_text}")
                    p_idx += 1
    except Exception as e:
        print(f"Error: {e}")

dump_start("recursos/PEI 2022.docx")
