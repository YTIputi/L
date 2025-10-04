import boto3
from botocore.client import Config
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='/Users/glebovcharov/Desktop/S3_test/env/pyvenv.cfg')

class S3Client:
    def __init__(self, bucket_name=None):
        self.bucket_name = bucket_name or os.getenv('BUCKET_NAME', 'book')
        self.s3 = boto3.client(
            's3',
            endpoint_url=os.getenv("MINIO_URL"),
            aws_access_key_id=os.getenv('MINIO_ROOT_USER'),
            aws_secret_access_key=os.getenv('MINIO_ROOT_PASSWORD'),
            config=Config(signature_version='s3v4'),
            region_name='us-east-1',
        )
        self.create_bucket()

    def create_bucket(self):
        try:
            existing_buckets = [b['Name'] for b in self.s3.list_buckets().get('Buckets', [])]
            if self.bucket_name in existing_buckets:
                print(f"Bucket '{self.bucket_name}' already exists.")
            else:
                self.s3.create_bucket(Bucket=self.bucket_name)
                print(f"Bucket '{self.bucket_name}' created.")
        except Exception as e:
            self.s3.create_bucket(Bucket=self.bucket_name)
            print(f"Bucket '{self.bucket_name}' could not be created: {e}")
    
    def upload_file(self, file_path, object_name=None):
        if object_name is None:
            object_name = os.path.basename(file_path)
        try:
            self.s3.upload_file(file_path, self.bucket_name, object_name)
            print(f"File '{file_path}' uploaded as '{object_name}'.")
        except Exception as e:
            print(f"Failed to upload '{file_path}': {e}")
    
    def download_file(self, object_name, file_path):
        try:
            self.s3.download_file(self.bucket_name, object_name, file_path)
            print(f"File '{object_name}' downloaded to '{file_path}'.")
        except Exception as e:
            print(f"Failed to download '{object_name}': {e}")