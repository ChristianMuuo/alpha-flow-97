import os
import json
import re
import hashlib
from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont

BOOKS_DIR = Path("public/books")
COVERS_DIR = BOOKS_DIR / "covers"
COVERS_DIR.mkdir(parents=True, exist_ok=True)

JSON_FILES = [
    BOOKS_DIR / "smc_books.json",
    BOOKS_DIR / "forex_books.json",
    BOOKS_DIR / "telegram_books.json",
]

def sanitize_filename(name: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)
    return cleaned[:60].strip('_')

def get_cover_filename(pdf_rel_path: str) -> str:
    base_name = Path(pdf_rel_path).stem
    clean = sanitize_filename(base_name)
    hash_suffix = hashlib.md5(pdf_rel_path.encode('utf-8')).hexdigest()[:6]
    return f"{clean}_{hash_suffix}.webp"

def create_fallback_cover(title: str, author: str, out_path: Path):
    width, height = 400, 600
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Deep slate
    draw = ImageDraw.Draw(img)
    
    # Gradient accent bar
    draw.rectangle([0, 0, width, 12], fill=(16, 185, 129)) # Emerald accent
    
    # Decorative box
    draw.rectangle([24, 36, width - 24, height - 36], outline=(51, 65, 85), width=2)
    
    # Title & author text
    words = title.split()
    lines = []
    current_line = []
    for word in words:
        if len(" ".join(current_line + [word])) > 22:
            lines.append(" ".join(current_line))
            current_line = [word]
        else:
            current_line.append(word)
    if current_line:
        lines.append(" ".join(current_line))
    
    # Draw simple text
    y = 120
    for line in lines[:6]:
        draw.text((40, y), line, fill=(241, 245, 249))
        y += 28
        
    draw.text((40, height - 80), f"By {author or 'Author'}", fill=(148, 163, 184))
    draw.text((40, height - 55), "ALPHA FLOW TRADING", fill=(16, 185, 129))
    
    img.save(out_path, "WEBP", quality=85)

def render_pdf_cover(pdf_path: Path, out_path: Path, title: str, author: str) -> bool:
    try:
        pdf = pdfium.PdfDocument(pdf_path)
        if len(pdf) == 0:
            raise ValueError("Empty PDF")
        page = pdf[0]
        # Render at 1.5x scale (approx 450x600 - 600x800)
        image = page.render(scale=1.5).to_pil()
        # Resize/crop to thumbnail standard aspect ratio if needed or keep aspect ratio max 500x750
        image.thumbnail((500, 750), Image.Resampling.LANCZOS)
        # Convert RGBA to RGB for clean webp/jpeg
        if image.mode in ("RGBA", "P"):
            bg = Image.new("RGB", image.size, (255, 255, 255))
            bg.paste(image, mask=image.split()[-1] if image.mode == "RGBA" else None)
            image = bg
        image.save(out_path, "WEBP", quality=85)
        return True
    except Exception as e:
        print(f"Warning: Could not render PDF {pdf_path.name}: {e}. Creating fallback cover.")
        create_fallback_cover(title, author, out_path)
        return False

def main():
    total_processed = 0
    pdf_rendered = 0
    fallback_rendered = 0

    for json_file in JSON_FILES:
        if not json_file.exists():
            print(f"Skipping missing {json_file}")
            continue

        with open(json_file, 'r', encoding='utf-8-sig') as f:
            books = json.load(f)

        updated_count = 0
        for book in books:
            total_processed += 1
            file_url = book.get("file_url", "")
            title = book.get("title", "Untitled Book")
            author = book.get("author", "Unknown")

            if not file_url:
                continue

            # Resolve actual local path
            # file_url is like "/books/forex-book-1.pdf" or "/books/foo.pdf"
            rel_name = file_url.lstrip("/").replace("books/", "", 1)
            pdf_path = BOOKS_DIR / rel_name

            cover_name = get_cover_filename(rel_name)
            cover_path = COVERS_DIR / cover_name
            cover_url = f"/books/covers/{cover_name}"

            if not cover_path.exists():
                if pdf_path.exists():
                    success = render_pdf_cover(pdf_path, cover_path, title, author)
                    if success:
                        pdf_rendered += 1
                    else:
                        fallback_rendered += 1
                else:
                    print(f"PDF not found at {pdf_path}, creating fallback.")
                    create_fallback_cover(title, author, cover_path)
                    fallback_rendered += 1

            if book.get("cover_url") != cover_url:
                book["cover_url"] = cover_url
                updated_count += 1

        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(books, f, indent=4, ensure_ascii=False)

        print(f"Updated {json_file.name}: {len(books)} books ({updated_count} covers updated)")

    print(f"\nDone! Processed: {total_processed} books. PDF covers: {pdf_rendered}, Fallbacks: {fallback_rendered}")

if __name__ == "__main__":
    main()
