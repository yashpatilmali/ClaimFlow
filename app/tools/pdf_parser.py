import os
from typing import List, Dict, Any, Optional
import fitz  # PyMuPDF


class PDFParser:
    """
    Extracts text, page metadata, and tables from PDF documents
    (specimen insurance policies, repair invoices, police reports).
    """

    def extract_text_with_pages(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts text page-by-page with page indices for citation references.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        pages_data = []
        doc = fitz.open(file_path)
        try:
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text("text")
                pages_data.append({
                    "page_number": page_num + 1,
                    "text": text.strip(),
                    "char_count": len(text)
                })
        finally:
            doc.close()

        return pages_data

    def extract_full_text(self, file_path: str) -> str:
        """
        Returns the entire document as a single text string.
        """
        pages = self.extract_text_with_pages(file_path)
        return "\n\n".join([f"--- Page {p['page_number']} ---\n{p['text']}" for p in pages])

    def parse_invoice_text(self, file_path: str) -> Dict[str, Any]:
        """
        Extracts structured lines and raw text from an invoice PDF.
        """
        pages = self.extract_text_with_pages(file_path)
        raw_text = "\n".join([p["text"] for p in pages])
        return {
            "file_path": file_path,
            "raw_text": raw_text,
            "pages": pages
        }


pdf_parser = PDFParser()
