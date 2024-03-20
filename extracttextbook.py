# Step 1: Convert PDF to text
import textract
from transformers.models.gpt2.tokenization_gpt2 import GPT2Tokenizer
from langchain.text_splitter import RecursiveCharacterTextSplitter
import pickle as pkl

tokenizer = GPT2Tokenizer.from_pretrained("gpt2-large")

def convert_pdf_to_text(filename: str) -> str:
    doc = textract.process("./textbook.pdf")
    return doc

# Step 2: Save to .txt and reopen (helps prevent issues)
def save_to_txt(filename: str, doc) :
    with open(filename, 'w') as f:
        f.write(doc.decode('utf-8'))

def open_txt(filename: str) :
    with open(filename, 'r') as f:
        text = f.read()
    return text


def count_tokens(text: str) -> int:
    return len(tokenizer.encode(text))

# Step 4: Split text into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 512,
    chunk_overlap  = 24,
    length_function = count_tokens,
)


text_list = []
text_list.append(open_txt("textbook.txt"))
text_list.append(open_txt("syllabus.txt"))

# print(type(text))
chunks = text_splitter.create_documents(text_list)
print(len(chunks))
# print(type(chunks))

print(chunks[843:])

# Step 5: Save to pickle file
with open('textbook.pkl', 'wb') as f :
    pkl.dump(chunks, f)
