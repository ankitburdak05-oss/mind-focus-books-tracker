import webview
import os
import sys
import json

app_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(app_dir, "index.html")
books_data_path = os.path.join(app_dir, "books-data.js")

class AppApi:
    def save_books(self, json_string):
        try:
            data = json.loads(json_string)
            content = "const DEFAULT_BOOKS = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
            with open(books_data_path, "w", encoding="utf-8") as f:
                f.write(content)
            return True
        except Exception as e:
            print("Error saving books:", e)
            return False

if __name__ == "__main__":
    api = AppApi()
    window = webview.create_window(
        title="Mind & Focus Books Tracker",
        url=html_path,
        width=1320,
        height=860,
        resizable=True,
        min_size=(900, 600),
        js_api=api
    )
    webview.start()
