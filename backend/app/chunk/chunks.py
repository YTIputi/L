from services.q_client import QdrantConnector
from utils.epub_parser import extract_text_from_epub
from core import config
import os
from pathlib import Path
from typing import Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
import numpy as np



def embedding_model(text: str, name: str = 'all-MiniLM-L6-v2') -> config.Vector:
    p = Path('models') / name
    print(p)
    model = SentenceTransformer(str(p))
    embedding = model.encode(text)
    return embedding

def chunk(path: Path) -> None:
    if not path.exists():
        return {'message': 'Error'}
    
    text = extract_text_from_epub(path)
   
    name = path.stem

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = text_splitter.split_text(text)
    connector = QdrantConnector(config.name_collention)
    for chunk in chunks:
        chunk_embedding = embedding_model([chunk])
        # connector.add_vector(chunk_embedding, metadata={'name': name})


if __name__ == "__main__":
    files_path = Path('/Users/glebovcharov/Desktop/Librartory/src/library/book/100_The Complete Works of William Shakespeare.epub')

    # Блок итерации по files_path и вызов chunk для каждого файла

    chunk(files_path)