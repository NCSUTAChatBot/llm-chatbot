# Step 1: Convert PDF to text
import textract
from transformers import GPT2TokenizerFast
from langchain.text_splitter import RecursiveCharacterTextSplitter
import pickle as pkl
# doc = textract.process("./textbook.pdf")

# Step 2: Save to .txt and reopen (helps prevent issues)
# with open('textbook.txt', 'w') as f:
    # f.write(doc.decode('utf-8'))

with open('textbook.txt', 'r') as f:
    text = f.read()

# Step 3: Create function to count tokens
tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

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
