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
            settings_path = os.path.join(get_app_dir(), 'settings.json')
            with open(settings_path, 'w', encoding='utf-8') as f: f.write(settings_json)
            return json.dumps({"success": True})
        except: return json.dumps({"success": False})
    
    def load_settings(self):
        try:
            settings_path = os.path.join(get_app_dir(), 'settings.json')
            if os.path.exists(settings_path):
                with open(settings_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if content and content.strip(): return content
            return "{}"
        except: return "{}"
    
    def apply_update(self):
        try:
            app_dir = get_app_dir()
            # Загружаем index.html напрямую и проверяем версию
            url = f"{GITHUB_RAW}/index.html?t={int(time.time())}"
            req = urllib.request.Request(url, headers={'User-Agent':'ONTEK/1.0'})
            
            with urllib.request.urlopen(req, timeout=15) as r:
                content = r.read().decode('utf-8', errors='ignore')
            
            # Проверяем что контент содержит ONTEK (не страница GitHub)
            if 'ONTEK' not in content[:500]:
                return json.dumps({"success": False, "message": "Не удалось скачать обновление"})
            
            # Сохраняем index.html
            with open(os.path.join(app_dir, 'index.html'), 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Скачиваем остальные файлы
            files = ['css/themes.css', 'css/style.css', 'js/app.js', 'js/init.js']
            for f in files:
                try:
                    file_url = f"{GITHUB_RAW}/{f}?t={int(time.time())}"
                    file_req = urllib.request.Request(file_url, headers={'User-Agent':'ONTEK/1.0'})
                    with urllib.request.urlopen(file_req, timeout=15) as fr:
                        file_content = fr.read()
                        if len(file_content) > 200:
                            local_path = os.path.join(app_dir, f)
                            os.makedirs(os.path.dirname(local_path), exist_ok=True)
                            with open(local_path, 'wb') as fout:
                                fout.write(file_content)
                except: continue
            
            # Перезапуск
            exe_path = os.path.join(app_dir, 'ONTEK_Orders.exe')
            if os.path.exists(exe_path):
                subprocess.Popen([exe_path], shell=True)
            os._exit(0)
            return json.dumps({"success": True})
            
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def start_server(port, serve_dir):
    os.chdir(serve_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    app_dir = get_app_dir()
    
    if getattr(sys, 'frozen', False):
        index_path = os.path.join(app_dir, 'index.html')
        if not os.path.exists(index_path):
            base_dir = sys._MEIPASS
            for f in ['index.html', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']:
                src = os.path.join(base_dir, f); dst = os.path.join(app_dir, f)
                if os.path.exists(src):
                    try: shutil.copy2(src, dst)
                    except: pass
            for folder in ['css', 'js']:
                src_folder = os.path.join(base_dir, folder); dst_folder = os.path.join(app_dir, folder)
                if os.path.exists(src_folder):
                    os.makedirs(dst_folder, exist_ok=True)
                    for f in os.listdir(src_folder):
                        sf = os.path.join(src_folder, f); df = os.path.join(dst_folder, f)
                        if os.path.isfile(sf):
                            try: shutil.copy2(sf, df)
                            except: pass
    
    serve_dir = app_dir
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
