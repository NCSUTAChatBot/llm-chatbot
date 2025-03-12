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
        """Handle different file types with better error handling"""
        try:
            if file_type == 'pdf':
                return self.extract_text_from_pdf(file_stream)
            elif file_type == 'csv':
                return self.load_csv(file_stream, encoding=encoding)
            elif file_type in ['xlsx', 'xls']:
                return self.load_excel(file_stream, file_type)
            else:
                raise ValueError(f"Unsupported file format: {file_type}")
        except Exception as e:
            print(f"Error loading file: {str(e)}")
            raise

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
        """Load and process CSV files"""
        try:
            # Reset stream position
            file_stream.seek(0)
            df = pd.read_csv(file_stream, encoding=encoding)
            if df.empty:
                raise ValueError("The CSV file appears to be empty")
            return self._chunk_dataframe(df, "uploaded.csv")
        except UnicodeDecodeError:
            # Try with different encodings if the specified one fails
            try:
                file_stream.seek(0)
                df = pd.read_csv(file_stream, encoding='latin1')
                return self._chunk_dataframe(df, "uploaded.csv")
            except Exception as e:
                raise ValueError(f"Could not read CSV file with any encoding: {str(e)}")
        except Exception as e:
            raise ValueError(f"Error reading CSV file: {str(e)}")

    def load_excel(self, file_stream, file_type):
        """Load and process Excel files (both .xls and .xlsx)"""
        try:
            # Reset stream position
            file_stream.seek(0)
            
            # Try different engines based on file type
            if file_type == 'xlsx':
                try:
                    df = pd.read_excel(file_stream, engine='openpyxl')
                except Exception as e:
                    print(f"openpyxl failed: {str(e)}")
                    file_stream.seek(0)
                    df = pd.read_excel(file_stream, engine='odf')
            else:  # xls
                try:
                    df = pd.read_excel(file_stream, engine='xlrd')
                except Exception as e:
                    print(f"xlrd failed: {str(e)}")
                    file_stream.seek(0)
                    # Try openpyxl as fallback
                    df = pd.read_excel(file_stream, engine='openpyxl')

            if df.empty:
                raise ValueError("The Excel file appears to be empty")

            return self._chunk_dataframe(df, f"uploaded.{file_type}")

        except Exception as e:
            raise ValueError(f"Could not read Excel file: {str(e)}")

    def _chunk_dataframe(self, df, source_name):
        text = df.to_string(header=True, index=False)
        doc = Document(page_content=text, metadata={"source": source_name})
        return self.text_splitter.split_documents([doc])