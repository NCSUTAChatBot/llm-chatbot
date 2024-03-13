import os
import pickle as pkl



# Some old apis are used here, need to change it later. The log from the terminal shows it need to change to 
# langchain_community.vectorstores import FAISS langchain_community, and langchain_openai, ...
# Please follow the log from the terminal if it is need refactor.

# TODO: Change the langchain to langchain_community

# langchain 
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.chains import ConversationalRetrievalChain

def get_text_chunks(filename) : # Flask doesn't really matter the backend. 
    # read the preprocessed text chunks from the pickle file
    with open(filename, "rb") as f:
        l = pkl.load(f)
    return l

def process_question(question) :
    # set openai api key
    os.environ["OPENAI_API_KEY"] = "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"

    # get text chunks
    chunks = get_text_chunks("textbook.pkl") 
    # Get embedding model
    embeddings = OpenAIEmbeddings()

    # Create vector database from the text chunks, using the embedding model
    db = FAISS.from_documents(chunks, embeddings)
    chat_history = []

    # Create chain for QA session
    chain = load_qa_chain(OpenAI(temperature=0), chain_type="stuff")

    query = question

    # perform similarity search for the question and the vector db to get the related chunks
    docs = db.similarity_search(query)

    # db.as_retriever has the question and the chunks, send them to openai api and wait for the response, and store the related infomation by setting verbose as True.
    qa = ConversationalRetrievalChain.from_llm(OpenAI(temperature=0.1), db.as_retriever(), verbose=True)
    
    result = qa({"question": query, "chat_history": chat_history})
    chat_history.append((query, result['answer']))

    # chat_history
    return result['answer']


# if __name__ == "__main__" :
#     os.environ["OPENAI_API_KEY"] = "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"
#     execute_chunks()
