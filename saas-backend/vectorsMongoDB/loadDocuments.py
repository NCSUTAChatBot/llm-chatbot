'''
This file is used to load documents from the file system into the Vector generation script

@Author: Sanjit Verma
'''
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from tqdm import tqdm

def load_pdfs(directory):
    """
    Load all PDFs from a directory, split them into chunks, and return the chunks.
    """
    # Split PDF into chunks
    # need to reserach this further, chunk size refers to how many characters each document or text chunk will contain
    # chunk overlap refers to how many characters will be shared between each document or text chunk 
    # this is important because it will allow context retention if phrase or info is split akwardly between chunks
    # i belive 1048 is a good chunk size and 100 is a good overlap size for academic material for testing rn but need to study further

    # List to store all the documents/ text chunks extracted
    # RecursiveCharacterTextSplitter is a class that splits text into chunks based on character count

    documents = []
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1048, chunk_overlap=100)
    
    # List all PDF files in the directory, filter out non-PDF files
    pdf_files = [f for f in os.listdir(directory) if f.endswith('.pdf')]
    
    #loop over all the PDF files in the directory, tqdm is a progress bar
    for filename in tqdm(pdf_files, desc="Processing PDFs", unit="file"):
        # construct pdf path for ewach file
        pdf_path = os.path.join(directory, filename)
        # PyPDFLoader is a class that loads PDFs and splits them by page
        # https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.pdf.PyPDFLoader.html
        loader = PyPDFLoader(pdf_path) # Loader chunks by page and stores page numbers in metadata.
        try:
            # Load data into Document objects and then Split the data into chunks and store them in the documents list
            data = loader.load()
            docs = text_splitter.split_documents(data)
            documents.extend(docs)
            tqdm.write(f"Loaded and processed {len(docs)} chunks from {filename}.")
        except Exception as e:
            tqdm.write(f"Failed to process {filename}: {e}")

    return documents

