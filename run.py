import os, sys, json, base64, threading, time, urllib.request, shutil, tempfile
import webview
from http.server import HTTPServer, SimpleHTTPRequestHandler
from tkinter import Tk, filedialog

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.5.0"
GITHUB_RAW = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main"

def get_app_dir():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

def get_base_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.dirname(os.path.abspath(__file__))

class Api:
    def __init__(self): self._window = None
    def set_window(self, w): self._window = w
    
    def save_file(self, data_b64, name):
        try:
            data = base64.b64decode(data_b64)
            root = Tk(); root.withdraw(); root.attributes('-topmost', True)
            path = filedialog.asksaveasfilename(defaultextension=".xlsx", initialfile=name, filetypes=[("Excel", "*.xlsx")], title="Сохранить")
            root.destroy()
            if path:
                with open(path, 'wb') as f: f.write(data)
                return json.dumps({"success": True, "path": path})
            return json.dumps({"success": False})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def load_file(self):
        try:
            root = Tk(); root.withdraw(); root.attributes('-topmost', True)
            path = filedialog.askopenfilename(filetypes=[("Excel", "*.xlsx;*.xls")], title="Открыть")
            root.destroy()
            if path:
                with open(path, 'rb') as f:
                    return json.dumps({"success": True, "name": os.path.basename(path), "data": base64.b64encode(f.read()).decode('utf-8')})
            return json.dumps({"success": False})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def save_settings(self, settings_json):
        """Сохранение настроек в файл"""
        try:
            settings_path = os.path.join(get_app_dir(), 'settings.json')
            with open(settings_path, 'w', encoding='utf-8') as f:
                f.write(settings_json)
            return json.dumps({"success": True})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def load_settings(self):
        """Загрузка настроек из файла"""
        try:
            settings_path = os.path.join(get_app_dir(), 'settings.json')
            if os.path.exists(settings_path):
                with open(settings_path, 'r', encoding='utf-8') as f:
                    return f.read()
            return "{}"
        except:
            return "{}"
    
    def apply_update(self):
        try:
            app_dir = get_app_dir()
            files = ['index.html','css/themes.css','css/style.css','js/app.js','js/init.js']
            updated = 0
            for f in files:
                url = f"{GITHUB_RAW}/{f}"
                local_path = os.path.join(app_dir, f)
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                req = urllib.request.Request(url, headers={'User-Agent':'ONTEK-Updater/1.0','Accept':'text/plain'})
                try:
                    with urllib.request.urlopen(req, timeout=10) as r:
                        content = r.read()
                        text = content.decode('utf-8', errors='ignore')
                        if text.strip().startswith('<!DOCTYPE') or text.strip().startswith('<html'): continue
                        if os.path.exists(local_path): os.remove(local_path)
                        with open(local_path, 'wb') as out: out.write(content)
                        updated += 1
                except: continue
            if updated > 0:
                return json.dumps({"success": True, "message": f"Обновлено файлов: {updated}"})
            return json.dumps({"success": False, "message": "Не удалось скачать обновления"})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def download_full_installer(self):
        try:
            url = "https://github.com/Dangergrow/Speka-ontek/releases/latest/download/ONTEK_Setup.exe"
            tmp = os.path.join(tempfile.gettempdir(), "ONTEK_Setup.exe")
            urllib.request.urlretrieve(url, tmp)
            os.startfile(tmp)
            return json.dumps({"success": True})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def setup_files():
    if not getattr(sys, 'frozen', False): return
    base = sys._MEIPASS
    app = get_app_dir()
    for f in ['index.html','exceljs.min.js','xlsx.full.min.js','icon.ico']:
        src = os.path.join(base, f)
        dst = os.path.join(app, f)
        if os.path.exists(src) and not os.path.exists(dst): shutil.copy2(src, dst)
    for folder in ['css','js']:
        src_folder = os.path.join(base, folder)
        dst_folder = os.path.join(app, folder)
        if os.path.exists(src_folder):
            os.makedirs(dst_folder, exist_ok=True)
            for f in os.listdir(src_folder):
                src_f = os.path.join(src_folder, f)
                dst_f = os.path.join(dst_folder, f)
                if os.path.isfile(src_f) and not os.path.exists(dst_f): shutil.copy2(src_f, dst_f)

def start_server(port, serve_dir):
    os.chdir(serve_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    setup_files()
    serve_dir = get_app_dir()
    port = 8765
    threading.Thread(target=start_server, args=(port, serve_dir), daemon=True).start()
    time.sleep(0.5)
    api = Api()
    window = webview.create_window(
        title=APP_NAME,
        url=f'http://127.0.0.1:{port}/index.html',
        js_api=api,
        maximized=True,
        resizable=True,
        min_size=(900, 600)
    )
    api.set_window(window)
    webview.start(debug=False)

if __name__ == '__main__':
    main()
