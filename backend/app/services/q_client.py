from qdrant_client.models import VectorParams, Distance, ScoredPoint
from typing import Optional, List
from qdrant_client import models, QdrantClient
from pathlib import Path
from sentence_transformers import SentenceTransformer
from core import config
import uuid

class QdrantConnector:
    def __init__(self, collection_name: str, url: str = "http://localhost:6333", embedding_model_name: str = 'all-MiniLM-L6-v2'):
        models_paths = Path('models')
        
        if (models_paths / embedding_model_name).exists():
            self.embedding_model = SentenceTransformer(str(models_paths / embedding_model_name))
        else:
            print(f'Модель {embedding_model_name} не загружена. Использую all-MiniLM-L6-v2')
            self.embedding_model = SentenceTransformer(str(models_paths / 'all-MiniLM-L6-v2'))

        self.client = QdrantClient(url=url)
        self.collection_name = collection_name

        self._create_collection(self.get_size())


    def _create_collection(self, vector_size: int, distance: str = "Cosine") -> None:
        distance_enum = Distance.COSINE if distance.lower() == "cosine" else Distance.EUCLIDEAN

        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=vector_size, distance=distance_enum)
            )
            print(f"Коллекция '{self.collection_name}' создана с размерностью вектора {vector_size} и расстоянием {distance_enum}.")
        else:
            print(f'Коллекция с именем {self.collection_name} уже создана')
        
    
    def delete_collection(self) -> None:
        if self.client.collection_exists(self.collection_name):
            self.client.delete_collection(self.collection_name)
            print(f"Коллекция '{self.collection_name}' удалена.")
        else:
            print(f"Коллекция '{self.collection_name}' не существует.")

    def get_size(self) -> int:
        return self.embedding_model.get_sentence_embedding_dimension()

    
    def add_vector(self, chunks: List[str], metadata: Optional[dict] = {}):
        self.client.upload_points(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=str(uuid.uuid4()), vector=self.embedding_model.encode(chunk), payload=metadata
                )
                for chunk in chunks
            ],
        )
    
    def query(self, text: str, limit: int = 3) -> List[ScoredPoint]:
        hits = self.client.query_points(
            collection_name=self.collection_name,
            query=self.embedding_model.encode(text).tolist(),
            limit=limit,
        ).points

        return hits


if __name__ == "__main__":
    connector = QdrantConnector('dsfsdfdsf')
    connector.add_vector(['Привет', 'ахахах'])
    print(connector.query('привет'))
    connector.delete_collection()

