import os, sys, json, base64, threading, time, urllib.request, tempfile, shutil
import webview
from http.server import HTTPServer, SimpleHTTPRequestHandler
from tkinter import Tk, filedialog

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "3.8.3"
VERSION_URL = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/version.json"
HTML_URL = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/index.html"

def get_base_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.dirname(os.path.abspath(__file__))

class Api:
    def __init__(self):
        self._window = None
    
    def set_window(self, w):
        self._window = w
    
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
    
    def get_version(self):
        return APP_VERSION
    
    def apply_update(self):
        """Применить обновление: скачать новый index.html и перезагрузить страницу"""
        try:
            # Куда сохранять
            if getattr(sys, 'frozen', False):
                # В EXE нельзя писать — сохраняем рядом с EXE
                exe_dir = os.path.dirname(sys.executable)
                html_path = os.path.join(exe_dir, 'index.html')
            else:
                html_path = os.path.join(get_base_dir(), 'index.html')
            
            # Скачиваем новый index.html
            urllib.request.urlretrieve(HTML_URL, html_path)
            
            return json.dumps({"success": True, "message": "Обновление применено! Перезагрузка..."})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def start_server(port, base_dir):
    # Сервер смотрит в папку с index.html
    if getattr(sys, 'frozen', False):
        serve_dir = os.path.dirname(sys.executable)
        # Если index.html нет рядом с EXE — используем встроенный
        if not os.path.exists(os.path.join(serve_dir, 'index.html')):
            serve_dir = base_dir
    else:
        serve_dir = base_dir
    
    os.chdir(serve_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    base_dir = get_base_dir()
    
    # Если EXE — копируем index.html из MEIPASS в папку с EXE (для возможности обновления)
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
        html_dest = os.path.join(exe_dir, 'index.html')
        if not os.path.exists(html_dest):
            html_src = os.path.join(base_dir, 'index.html')
            shutil.copy2(html_src, html_dest)
        # Копируем библиотеки
        for lib in ['exceljs.min.js', 'xlsx.full.min.js']:
            lib_dest = os.path.join(exe_dir, lib)
            if not os.path.exists(lib_dest):
                lib_src = os.path.join(base_dir, lib)
                if os.path.exists(lib_src):
                    shutil.copy2(lib_src, lib_dest)
    
    port = 8765
    threading.Thread(target=start_server, args=(port, base_dir), daemon=True).start()
    time.sleep(0.5)
    
    api = Api()
    window = webview.create_window(
        title=APP_NAME,
        url=f'http://127.0.0.1:{port}/index.html',
        js_api=api,
        width=1400,
        height=900,
        resizable=True,
        min_size=(900, 600)
    )
    api.set_window(window)
    webview.start(debug=False)

if __name__ == '__main__':
    main()
