import urllib.request
import os

urls = {
    'cover_musafir_cafe.jpg': 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1470592109i/31367693.jpg',
    'cover_october_junction.jpg': 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1545068866i/43255476.jpg',
    'cover_deewar_mein_khidki.jpg': 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1767780083i/13451113.jpg',
    'cover_yaar_papa.jpg': 'http://akshardhara.com/cdn/shop/files/YaarPapaF.jpg?v=1777533781',
    'cover_ret_ki_machhli.jpg': 'https://akshardhara.com/cdn/shop/files/RetKiMachaliF.jpg?v=1777190763',
    'cover_gunahon_ka_devta.jpg': 'https://cdn.exoticindia.com/images/products/original/books-2019/has801.jpg'
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for filename, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(filename, 'wb') as f:
                f.write(data)
            print(f'{filename}: SUCCESS ({len(data)} bytes)')
    except Exception as e:
        print(f'{filename}: FAILED - {e}')
