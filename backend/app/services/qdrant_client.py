from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from typing import Optional

class QdrantConnector:
    """
    Обёртка для подключения к Qdrant и работы с коллекциями.
    """
    def __init__(self, url: str = "http://localhost:6333"):
        self.client = QdrantClient(url=url)

    def create_collection(self, name: str, vector_size: int, distance: str = "Cosine"):
        distance_enum = Distance.COSINE if distance.lower() == "cosine" else Distance.EUCLIDEAN
        self.client.recreate_collection(
            collection_name=name,
            vectors_config=VectorParams(size=vector_size, distance=distance_enum)
        )
        print(f"Коллекция '{name}' создана с размерностью вектора {vector_size} и расстоянием {distance_enum}.")
    
    def delete_collection(self, name: str):
        if self.collection_exists(name):
            self.client.delete_collection(name)
            print(f"Коллекция '{name}' удалена.")
        else:
            print(f"Коллекция '{name}' не существует.")

    def get_client(self) -> QdrantClient:
        return self.client

    def collection_exists(self, name: str) -> bool:
        collections = self.client.get_collections().collections
        return any(c.name == name for c in collections)

if __name__ == "__main__":
    connector = QdrantConnector()

    if not connector.collection_exists("book_chunks"):
        connector.create_collection("book_chunks", vector_size=384, distance="Cosine")

    if not connector.collection_exists("books_summary"):
        connector.create_collection("books_summary", vector_size=384, distance="Cosine")

    client = connector.get_client()
    print(client)
