import os
import pandas as pd
import pickle as pkl
import matplotlib.pyplot as plt
from transformers import GPT2TokenizerFast
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.chains import ConversationalRetrievalChain

def get_text_chunks(filename) :
    with open(filename, "rb") as f:
        l = pkl.load(f)
    return l

def example_query(db, question) :
    chat_history = []
    chain = load_qa_chain(OpenAI(temperature=0), chain_type="stuff")

    query = question
    docs = db.similarity_search(query)
    qa = ConversationalRetrievalChain.from_llm(OpenAI(temperature=0.1), db.as_retriever(), verbose=True)
    result = qa({"question": query, "chat_history": chat_history})
    chat_history.append((query, result['answer']))
    return chat_history[0][1]

def execute_chunks(question) :
    chunks = get_text_chunks("textbook.pkl")
    # Get embedding model
    embeddings = OpenAIEmbeddings()

    # Create vector database
    db = FAISS.from_documents(chunks, embeddings)
    return example_query(db, question)

def process_question(question) :
    os.environ["OPENAI_API_KEY"] = "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"
    return execute_chunks(question)

# if __name__ == "__main__" :
#     os.environ["OPENAI_API_KEY"] = "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"
#     execute_chunks()
