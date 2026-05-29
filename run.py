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
        """Скачать обновления с проверкой содержимого"""
        try:
            app_dir = get_app_dir()
            
            # Скачиваем index.html
            url = f"{GITHUB_RAW}/index.html"
            req = urllib.request.Request(url, headers={'User-Agent': 'ONTEK/1.0'})
            
            with urllib.request.urlopen(req, timeout=15) as r:
                content = r.read()
                text = content.decode('utf-8', errors='ignore')
                
                print(f"[UPDATE] Получено {len(content)} байт")
                print(f"[UPDATE] Начало: {text[:200]}")
                
                # Проверяем что это наш файл
                if '<div class="app"' in text and '</html>' in text:
                    local_path = os.path.join(app_dir, 'index.html')
                    with open(local_path, 'w', encoding='utf-8') as f:
                        f.write(text)
                    print(f"[UPDATE] index.html сохранён ({len(content)} байт)")
                    
                    # Скачиваем остальные файлы
                    for f in ['css/themes.css', 'css/style.css', 'js/app.js', 'js/init.js']:
                        try:
                            furl = f"{GITHUB_RAW}/{f}"
                            freq = urllib.request.Request(furl, headers={'User-Agent': 'ONTEK/1.0'})
                            with urllib.request.urlopen(freq, timeout=15) as fr:
                                fdata = fr.read()
                                if len(fdata) > 200:
                                    lpath = os.path.join(app_dir, f)
                                    os.makedirs(os.path.dirname(lpath), exist_ok=True)
                                    with open(lpath, 'wb') as fout:
                                        fout.write(fdata)
                                    print(f"[UPDATE] {f} сохранён ({len(fdata)} байт)")
                        except Exception as e:
                            print(f"[UPDATE] Ошибка {f}: {e}")
                    
                    # Перезапуск
                    exe = os.path.join(app_dir, 'ONTEK_Orders.exe')
                    if os.path.exists(exe):
                        subprocess.Popen([exe], shell=True)
                    os._exit(0)
                    return json.dumps({"success": True, "message": "Обновлено!"})
                else:
                    print(f"[UPDATE] Файл не является index.html (нет '<div class=\"app\"')")
                    return json.dumps({"success": False, "message": "Неверный формат файла"})
                    
        except Exception as e:
            print(f"[UPDATE] Ошибка: {e}")
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
