import webview
import os
import sys
import json
import shutil
import datetime

app_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(app_dir, "index.html")
books_data_path = os.path.join(app_dir, "books-data.js")

# Backups folder: har save ka timestamped snapshot yaha jayega
BACKUPS_DIR = os.path.join(app_dir, "books-data-backups")
MAX_BACKUPS = 20  # maximum backup files rakhega (older auto-delete)


def _ensure_backups_dir():
    """Backups folder banaye agar exist nahi karta."""
    if not os.path.isdir(BACKUPS_DIR):
        try:
            os.makedirs(BACKUPS_DIR, exist_ok=True)
        except OSError as e:
            print("Warning: backups dir create nahi ho payi:", e)


def _create_backup():
    """
    books-data.js ka timestamped backup banata hai before overwrite.
    Agar koi bug/corruption ho save mein to rollback kar sakte hain.
    Returns True agar backup bana, False agar source file hi nahi mili.
    """
    if not os.path.isfile(books_data_path):
        return False
    _ensure_backups_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"books-data_{timestamp}.js.bak"
    backup_path = os.path.join(BACKUPS_DIR, backup_name)
    try:
        shutil.copy2(books_data_path, backup_path)
        _prune_old_backups()
        print(f"[Backup] {backup_name} (in {BACKUPS_DIR})")
        return True
    except OSError as e:
        print("Backup failed:", e)
        return False


def _prune_old_backups():
    """Sirf last MAX_BACKUPS files rakhta hai, baaki delete."""
    try:
        files = []
        for f in os.listdir(BACKUPS_DIR):
            if f.endswith(".js.bak"):
                full = os.path.join(BACKUPS_DIR, f)
                files.append((os.path.getmtime(full), full))
        files.sort(reverse=True)  # newest first
        for _, old in files[MAX_BACKUPS:]:
            try:
                os.remove(old)
                print(f"[Backup] Pruned old: {os.path.basename(old)}")
            except OSError:
                pass
    except OSError as e:
        print("Prune failed:", e)


class AppApi:
    def save_books(self, json_string):
        """
        JSON string accept karta hai (browser se) aur books-data.js overwrite karta hai.
        Save se pehle automatic backup banta hai.
        """
        try:
            data = json.loads(json_string)
        except (ValueError, TypeError) as e:
            print("Invalid JSON received:", e)
            return {"ok": False, "error": "invalid_json", "detail": str(e)}

        # 1) Pehle backup bana lo
        backup_ok = _create_backup()

        # 2) Phir naya data likho
        content = (
            "const DEFAULT_BOOKS = "
            + json.dumps(data, ensure_ascii=False, indent=2)
            + ";\n"
        )
        try:
            with open(books_data_path, "w", encoding="utf-8") as f:
                f.write(content)
        except OSError as e:
            print("Write failed:", e)
            return {"ok": False, "error": "write_failed", "detail": str(e)}

        return {
            "ok": True,
            "backup_created": backup_ok,
            "message": "Save successful. Auto-backup created before overwrite."
                       if backup_ok else
                       "Save successful. (No previous file to back up.)"
        }

    def list_backups(self):
        """JS se callable: existing backup files ki list return karta hai."""
        _ensure_backups_dir()
        try:
            files = sorted(
                [f for f in os.listdir(BACKUPS_DIR) if f.endswith(".js.bak")],
                reverse=True
            )
            return {"ok": True, "backups": files, "folder": BACKUPS_DIR}
        except OSError as e:
            return {"ok": False, "error": str(e), "backups": []}

    def restore_backup(self, backup_filename):
        """Specific backup se books-data.js restore karta hai."""
        # security: filename me koi path separator nahi hona chahiye
        if not backup_filename or "/" in backup_filename or "\\" in backup_filename:
            return {"ok": False, "error": "invalid_filename"}
        src = os.path.join(BACKUPS_DIR, backup_filename)
        if not os.path.isfile(src):
            return {"ok": False, "error": "backup_not_found"}
        # pehle current state ka backup le lo
        _create_backup()
        try:
            shutil.copy2(src, books_data_path)
            return {"ok": True, "message": f"Restored from {backup_filename}"}
        except OSError as e:
            return {"ok": False, "error": str(e)}


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
