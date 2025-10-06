from ebooklib import epub
from bs4 import BeautifulSoup
import re

def clean_gutenberg_text(text: str) -> str:
    """
    Убирает служебные вставки Project Gutenberg и всё до первой главы/сценария.
    """
    start_match = re.search(r'(?:\*\*\* START OF.*?\*\*\*|THE SONNETS|[1-9]+\s)', text, flags=re.I)
    if start_match:
        text = text[start_match.end():]
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)

def extract_text_from_epub(file_path: str) -> str:
    """
    Извлекает текст из EPUB и убирает служебные вставки вроде Project Gutenberg.
    """
    book = epub.read_epub(file_path)
    text = []

    for item in book.get_items():
        if hasattr(item, "media_type") and "html" in item.media_type:
            try:
                content = item.get_body_content()
                soup = BeautifulSoup(content, "html.parser")
                extracted = soup.get_text(separator=" ", strip=True)
                extracted = re.sub(r'\*{3}.*PROJECT GUTENBERG.*\*{3}', '', extracted, flags=re.I)
                extracted = re.sub(r'This eBook.*?License.*?www.gutenberg.org', '', extracted, flags=re.I|re.S)
                extracted = re.sub(r'Release Date:.*', '', extracted)
                extracted = re.sub(r'Most recently updated:.*', '', extracted)
                extracted = re.sub(r'Language:.*', '', extracted)
                extracted = re.sub(r'Title:.*', '', extracted)
                extracted = re.sub(r'Author:.*', '', extracted)

                if extracted.strip():
                    text.append(extracted.strip())

            except Exception as e:
                print(f"Ошибка при обработке {getattr(item, 'file_name', 'unknown')}: {e}")

    combined_text = "\n".join(text)
    cleaned_text = clean_gutenberg_text(combined_text)
    return cleaned_text


if __name__ == "__main__":
    epub_path = "/Users/glebovcharov/Desktop/Librartory/src/library/book/100_The Complete Works of William Shakespeare.epub"
    extracted_text = extract_text_from_epub(epub_path)
    print(extracted_text[5000:7000])