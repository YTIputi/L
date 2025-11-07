from services.q_client import QdrantConnector
from utils.epub_parser import extract_text_from_epub
from core import config
import os
from pathlib import Path
from typing import Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
import numpy as np


def chunk(path: Path) -> None:
    if not path.exists():
        return {'message': 'Error'}
    
    text = extract_text_from_epub(path)
    name = path.stem

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = text_splitter.split_text(text)
    connector = QdrantConnector(config.name_collention)
    connector.add_vector(chunks, {'name': name})


if __name__ == "__main__":
    files_path = Path('books')
    
    i = 0
    for path in files_path.iterdir():
        chunk(Path(path))

        if i == 10:
            break
        i += 1
