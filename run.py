import os, sys, json, base64, threading, time, urllib.request, shutil, tempfile, subprocess
import webview
from http.server import HTTPServer, SimpleHTTPRequestHandler
from tkinter import Tk, filedialog

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.6.0"
GITHUB_RAW = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main"

def get_app_dir():
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
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
        try:
            with open(os.path.join(get_app_dir(), 'settings.json'), 'w', encoding='utf-8') as f: f.write(settings_json)
            return json.dumps({"success": True})
        except: return json.dumps({"success": False})
    
    def load_settings(self):
        try:
            path = os.path.join(get_app_dir(), 'settings.json')
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                return content if content.strip() else "{}"
            return "{}"
        except: return "{}"
    
    def apply_update(self):
        try:
            app_dir = get_app_dir()
            files_updated = 0
            
            for f in ['index.html', 'css/themes.css', 'css/style.css', 'js/app.js', 'js/init.js']:
                url = f"{GITHUB_RAW}/{f}?v={APP_VERSION}"
                local = os.path.join(app_dir, f)
                os.makedirs(os.path.dirname(local), exist_ok=True)
                
                req = urllib.request.Request(url, headers={'User-Agent':'ONTEK-Updater/1.0'})
                try:
                    with urllib.request.urlopen(req, timeout=15) as r:
                        data = r.read()
                        if len(data) > 500:
                            with open(local, 'wb') as out: out.write(data)
                            files_updated += 1
                except: continue
            
            if files_updated >= 2:
                exe = os.path.join(app_dir, 'ONTEK_Orders.exe')
                if os.path.exists(exe): subprocess.Popen([exe], shell=True)
                os._exit(0)
                return json.dumps({"success": True})
            return json.dumps({"success": False, "message": f"Обновлено только {files_updated} файлов"})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def start_server(port, serve_dir):
    os.chdir(serve_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    app_dir = get_app_dir()
    
    # Копируем из _MEIPASS только если index.html отсутствует
    if getattr(sys, 'frozen', False) and not os.path.exists(os.path.join(app_dir, 'index.html')):
        base = sys._MEIPASS
        for f in ['index.html', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']:
            s, d = os.path.join(base, f), os.path.join(app_dir, f)
            if os.path.exists(s): shutil.copy2(s, d)
        for folder in ['css', 'js']:
            sf, df = os.path.join(base, folder), os.path.join(app_dir, folder)
            if os.path.exists(sf):
                os.makedirs(df, exist_ok=True)
                for f in os.listdir(sf):
                    s, d = os.path.join(sf, f), os.path.join(df, f)
                    if os.path.isfile(s): shutil.copy2(s, d)
    
    port = 8765
    threading.Thread(target=start_server, args=(port, app_dir), daemon=True).start()
    time.sleep(0.5)
    
    api = Api()
    window = webview.create_window(title=APP_NAME, url=f'http://127.0.0.1:{port}/index.html', js_api=api, maximized=True, resizable=True, min_size=(900,600))
    api.set_window(window)
    webview.start(debug=False)

if __name__ == '__main__':
    main()
