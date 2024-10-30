"""
@file loadEvaluation.py
This file is responsible for chunking the course evaluation for on the fly course evaluations

@Author: Sanjit Verma
"""
import os
import pandas as pd
import pdfplumber
from io import BytesIO
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from tqdm import tqdm

class LoadEvaluation:
    def __init__(self, chunk_size=1048, chunk_overlap=100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)

    def load_from_stream(self, file_stream, file_type, encoding='utf-8'):
        if file_type == 'pdf':
            return self.extract_text_from_pdf(file_stream)
        elif file_type == 'csv':
            return self.load_csv(file_stream, encoding=encoding)
        elif file_type == 'xlsx':
            return self.load_xlsx(file_stream)
        else:
            tqdm.write(f"Unsupported file format: {file_type}")
            return []

    def extract_text_from_pdf(self, file_stream):
        documents = []
        with pdfplumber.open(file_stream) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = self.extract_text_from_page(page)
                doc = Document(page_content=text, metadata={"page_number": page_num + 1, "source": "uploaded.pdf"})
                docs = self.text_splitter.split_documents([doc])
                documents.extend(docs)
        return documents

    @staticmethod
    def extract_text_from_page(page):
        text = page.extract_text() or ""
        tables = page.extract_tables() or []
        table_texts = ['\n'.join(['\t'.join(str(cell) if cell is not None else '' for cell in row) for row in table]) for table in tables]
        return text + '\n\n' + '\n\n'.join(table_texts)

    def load_csv(self, file_stream, encoding='utf-8'):
        try:
            df = pd.read_csv(file_stream, encoding=encoding)
        except UnicodeDecodeError as e:
            tqdm.write(f"UnicodeDecodeError: {e}")
            raise e
        return self._chunk_dataframe(df, "uploaded.csv")

    def load_xlsx(self, file_stream):
        df = pd.read_excel(file_stream, engine='openpyxl')
        return self._chunk_dataframe(df, "uploaded.xlsx")

    def _chunk_dataframe(self, df, source_name):
        text = df.to_string(header=True, index=False)
        doc = Document(page_content=text, metadata={"source": source_name})
        return self.text_splitter.split_documents([doc])