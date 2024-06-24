'''
This file is responsible for extracting text from a PDF file, splitting it into chunks, and saving the chunks to a pickle file.

@author: Haoze Du
@commented by: Sanjit Verma 
'''
import textract
from transformers.models.gpt2.tokenization_gpt2_fast import GPT2Tokenizer
from langchain.text_splitter import RecursiveCharacterTextSplitter
import pickle as pkl

# Step 1: Convert PDF to text using the textract library, which extracts text from various file formats including PDF.
doc = textract.process("./textbook.pdf")

# Step 2: Save the extracted text to a .txt file and then reopen it.
# This step ensures that any encoding issues are resolved before further processing.
with open('textbook.txt', 'w') as f:
    f.write(doc.decode('utf-8'))  # Decode the binary data to string before writing to a file.

with open('textbook.txt', 'r') as f:
    text = f.read()  # Read the entire content of the file into a string.

# Step 3: Create a function to count the number of tokens in a given text.
# This uses the GPT-2 tokenizer from the Hugging Face transformers library.
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
def count_tokens(text: str) -> int:
    # Encode the text using GPT-2 tokenizer and return the number of tokens.
    return len(tokenizer.encode(text))

# Step 4: Split the text into chunks that are manageable in size for processing.
# We use a custom text splitter from the langchain library.
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,           # Each chunk will have at most 512 tokens.
    chunk_overlap=24,         # Chunks will overlap by 24 tokens to ensure continuity in context.
    length_function=count_tokens,  # Use the count_tokens function to measure chunk size in tokens.
)

# Create documents (chunks) from the text and print the number of chunks and their type.
chunks = text_splitter.create_documents([text])
print(len(chunks))
print(type(chunks))

# Step 5: Save the resulting chunks to a pickle file for later use.
# Pickle is used for serializing and deserializing Python object structures.
with open('textbook.pkl', 'wb') as f:
    pkl.dump(chunks, f)
