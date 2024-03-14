import os
import pickle as pkl



# Some old apis are used here, need to change it later. The log from the terminal shows it need to change to 
# langchain_community.vectorstores import FAISS langchain_community, and langchain_openai, ...
# Please follow the log from the terminal if it is need refactor.

# TODO: Change the langchain to langchain_community

# langchain 
# from langchain.embeddings import OpenAIEmbeddings
# from langchain_community.embeddings import OpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings
# from langchain.vectorstores import FAISS
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
# from langchain.llms import OpenAI
from langchain_community.llms import OpenAI
from langchain.chains import ConversationalRetrievalChain

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
    db = FAISS.from_documents(chunks_list, embeddings)
    return db

def make_query(chat_history: list, question: str) -> str:
    '''
    Make the query with the question.

    Params:
    - question(str): the question to make query to openai.

    Returns:
    - result['answer']: the answer from openai api.
    '''
    # set openai api key
    # Here you need to set up your own openai api key.
    # os.environ["OPENAI_API_KEY"] = 

    # get text chunks
    db = make_vector_database(chunks_list=get_text_chunks("textbook.pkl"))
    # chat_history = []

    # # Create chain for QA session
    # chain = load_qa_chain(OpenAI(temperature=0), chain_type="stuff")

    # # perform similarity search for the question and the vector db to get the related chunks
    # docs = db.similarity_search(question)

    # db.as_retriever has the question and the chunks, send them to openai api and wait for the response, and store the related infomation by setting verbose as True.
    qa = ConversationalRetrievalChain.from_llm(OpenAI(temperature=0.1), db.as_retriever(), verbose=True) #return_generated_question=True, return_source_documents=True)
    # print("CCCCC"+question)
    result = qa({"chat_history": chat_history, "question": question})
    chat_history.append((question, result['answer']))
    # print('comb '+str(result))
    # chat_history
    return result


# if __name__ == "__main__" :
#     os.environ["OPENAI_API_KEY"] = "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"
#     execute_chunks()
