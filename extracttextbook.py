# Step 1: Convert PDF to text
import textract
# Need to change the following import to the newer version.

# The following commented line is also deprecated, need to change (the extracttextbook.py explicitly use this)
# from transformers import GPT2TokenizerFast

# TODO: refactor the GPT2TokenizerFast to tokenization_gpt2_fast

from transformers.models.gpt2 import tokenization_gpt2_fast
from langchain.text_splitter import RecursiveCharacterTextSplitter
import pickle as pkl
# doc = textract.process("./textbook.pdf")

# Step 2: Save to .txt and reopen (helps prevent issues)
# with open('textbook.txt', 'w') as f:
    # f.write(doc.decode('utf-8'))

with open('textbook.txt', 'r') as f:
    text = f.read()

# Step 3: Create function to count tokens
tokenizer = tokenization_gpt2_fast()

def count_tokens(text: str) -> int:
    return len(tokenizer.encode(text))

# Step 4: Split text into chunks
text_splitter = RecursiveCharacterTextSplitter(
    # Set a really small chunk size, just to show.
    chunk_size = 512,
    chunk_overlap  = 24,
    length_function = count_tokens,
)

chunks = text_splitter.create_documents([text])
print(len(chunks))
print(type(chunks))

with open('textbook.pkl', 'wb') as f :
    pkl.dump(chunks, f)
