'''
This file is used to load documents from the file system into the Vector generation script

@Author: Sanjit Verma
@Author: Dinesh Kannan (dkannan)
'''
import os
import fitz
import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from tqdm import tqdm

def extract_text_and_table_from_page(page):
    # Extract tables and their bounding boxes
    tables, table_boxes = extract_tables_from_page(page)

    # Extract text from blocks not overlapping with table bounding boxes
    text_blocks = []
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        box = fitz.Rect(b['bbox'])
        if not any(box.intersects(tb) for tb in table_boxes) and 'text' in b:
            text_blocks.append(b["text"])
    
    text = "\n".join(text_blocks)  # Combine text blocks into a single string

    table_texts = []
    for table in tables:
        table_text = table.to_string(index=False, header=False)
        table_texts.append(table_text)

    return text + "\n\n" + "\n\n".join(table_texts)

def extract_tables_from_page(page):
    """
    Extract tables from a PDF page using PyMuPDF.
    """
    tables = []
    table_boxes = []
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" in b:
            table = []
            for l in b["lines"]:
                span_texts = [span["text"] for span in l["spans"]]
                table.append(span_texts)
            if table:
                df = pd.DataFrame(table)
                tables.append(df)
                table_boxes.append(fitz.Rect(b['bbox']))
    return tables, table_boxes

def load_pdfs(directory):
    """
    Load all PDFs from a directory, split them into chunks, and return the chunks.
    Args:
    - directory: Path to the directory containing PDF files.
    Returns:
    - List of document chunks.

    """
    documents = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1048, chunk_overlap=100)
    unique_contents = set()  # To track unique document content

    # List all PDF files in the directory, filter out non-PDF files
    pdf_files = [f for f in os.listdir(directory) if f.endswith('.pdf')]
    
    #loop over all the PDF files in the directory, tqdm is a progress bar
    for filename in tqdm(pdf_files, desc="Processing PDFs", unit="file"):
        pdf_path = os.path.join(directory, filename)
        
        try:
            pdf_document= fitz.open(pdf_path)
            for page_num in range(len(pdf_document)):
                page=pdf_document.load_page(page_num)
                text = extract_text_and_table_from_page(page)
                if text.strip() and text not in unique_contents:  # Only proceed if there is text content
                    unique_contents.add(text)
                    doc = Document(page_content=text, metadata={"page_number": page_num, "source": filename})
                    docs = text_splitter.split_documents([doc])
                    documents.extend(docs)
                else:
                    tqdm.write(f"No text or duplicate text extracted from page {page_num} of {filename}.")
            pdf_document.close()
            tqdm.write(f"Loaded and processed {len(docs)} chunks from {filename}.")
        except Exception as e:
            tqdm.write(f"Failed to process {filename}: {e}")
            
    return documents