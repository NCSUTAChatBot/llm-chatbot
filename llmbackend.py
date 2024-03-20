import os
import pickle as pkl
# Some old apis are used here, need to change it later. The log from the terminal shows it need to change to 
# langchain_community.vectorstores import FAISS langchain_community, and langchain_openai, ...
# Please follow the log from the terminal if it is need refactor.

# TODO: It seems that langchain_comunity.llms OPENAI will be deprecated

from langchain_openai import OpenAIEmbeddings               # import this to support creating the vector database from the text
from langchain_community.vectorstores import FAISS          # Facebook AI Similarity Search (Faiss) provides an implemenation of the vector database.
from langchain_community.llms import OpenAI                 # OpenAI is an open-source library for natural language understanding.
from langchain.chains import ConversationalRetrievalChain   # The one popular chain from langchain, which concatenates the previous model's output to the new model's input.

def get_text_chunks(filename: str) -> list: # Flask doesn't really matter the backend.
    '''
    Get  the text chunks from the preprocessed pickle file.

    Params:
    - filename(str): the filename of the preprocessed text chunks.

    Returns:
    - l(list): the list of all text chunks from the pickle file.
    ''' 
    # read the preprocessed text chunks from the pickle file
    with open(filename, "rb") as f:
        l = pkl.load(f)
    return l

def make_vector_database(chunks_list: list) -> FAISS:
    '''
    Make the vector database from the text chunks.

    Params:
    - chunks_list(list): the list of all text chunks.
    
    Returns:
    - db(FAISS): the vector database from the text chunks.
    '''
    # Get embedding model
    embeddings = OpenAIEmbeddings()

    # Create vector database from the text chunks, using the embedding model
    # TODO: make it only excute once.
    db = FAISS.from_documents(chunks_list, embeddings)
    return db

def make_query(chat_history: list, question: str) -> str:
    '''
    Make the query with the question.

    Params:
    - chat_history(list): the chat history.
    - question(str): the question to make query to openai.

    Returns:
    - result['answer']: the answer from openai api.
    '''
    # set openai api key
    # Here you need to set up your own openai api key in your $path, or you can try to add your api key in this session by running the line below.
    # os.environ["OPENAI_API_KEY"] = <your key>

    # get text chunks
    db = make_vector_database(chunks_list=get_text_chunks("textbook.pkl"))

    # db.as_retriever has the question and the chunks, send them to openai api and wait for the response, and store the related infomation by setting verbose as True.
    # If we can set a limit of db.as_retriever(), to reduce the cost 
    qa = ConversationalRetrievalChain.from_llm(OpenAI(temperature=0.1), db.as_retriever(search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.6}), verbose=True) #return_generated_question=True, return_source_documents=True)

    result = qa({"chat_history": chat_history, "question": question})
    chat_history.append((question, result['answer']))
    return result
