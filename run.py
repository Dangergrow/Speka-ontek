import os
import sys
import json
import base64
import threading
import time
import webview
from http.server import HTTPServer, SimpleHTTPRequestHandler
from tkinter import Tk, filedialog

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "3.8.0"

def get_base_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.dirname(os.path.abspath(__file__))

class Api:
    def save_file(self, data_b64, name):
        try:
            data = base64.b64decode(data_b64)
            root = Tk(); root.withdraw(); root.attributes('-topmost', True)
            path = filedialog.asksaveasfilename(defaultextension=".xlsx", initialfile=name, filetypes=[("Excel файлы", "*.xlsx")], title="Сохранить")
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
            path = filedialog.askopenfilename(filetypes=[("Excel файлы", "*.xlsx;*.xls")], title="Открыть")
            root.destroy()
            if path:
                with open(path, 'rb') as f:
                    return json.dumps({"success": True, "name": os.path.basename(path), "data": base64.b64encode(f.read()).decode('utf-8')})
            return json.dumps({"success": False})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def start_server(port, base_dir):
    os.chdir(base_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    base_dir = get_base_dir()
    port = 8765
    
    # Запускаем сервер
    threading.Thread(target=start_server, args=(port, base_dir), daemon=True).start()
    time.sleep(0.5)
    
    api = Api()
    
    # Создаём окно
    window = webview.create_window(
        title=APP_NAME,
        url=f'http://127.0.0.1:{port}/index.html',
        js_api=api,
        width=1400,
        height=900,
        resizable=True,
        min_size=(900, 600)
    )
    
    webview.start(debug=False)

if __name__ == '__main__':
    main()
