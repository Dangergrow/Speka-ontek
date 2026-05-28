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
APP_VERSION = "3.7.0"

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
            path = filedialog.asksaveasfilename(
                defaultextension=".xlsx",
                initialfile=name,
                filetypes=[("Excel файлы", "*.xlsx")],
                title="Сохранить таблицу как..."
            )
            root.destroy()
            if path:
                with open(path, 'wb') as f:
                    f.write(data)
                return json.dumps({"success": True, "path": path})
            return json.dumps({"success": False})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def load_file(self):
        try:
            root = Tk(); root.withdraw(); root.attributes('-topmost', True)
            path = filedialog.askopenfilename(
                filetypes=[("Excel файлы", "*.xlsx;*.xls")],
                title="Открыть таблицу"
            )
            root.destroy()
            if path:
                with open(path, 'rb') as f:
                    return json.dumps({
                        "success": True,
                        "name": os.path.basename(path),
                        "data": base64.b64encode(f.read()).decode('utf-8')
                    })
            return json.dumps({"success": False})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def get_version(self):
        return APP_VERSION

def start_server(port, base_dir):
    """Запустить HTTP сервер в отдельном потоке"""
    os.chdir(base_dir)
    server = HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler)
    print(f"Сервер запущен: http://127.0.0.1:{port}/index.html")
    server.serve_forever()

def main():
    base_dir = get_base_dir()
    port = 8765
    
    # Проверяем что index.html существует
    index_path = os.path.join(base_dir, 'index.html')
    if not os.path.exists(index_path):
        print(f"ОШИБКА: index.html не найден в {base_dir}")
        print("Файлы в папке:", os.listdir(base_dir))
        return
    
    # Запускаем HTTP сервер в фоне
    server_thread = threading.Thread(target=start_server, args=(port, base_dir), daemon=True)
    server_thread.start()
    time.sleep(0.5)  # Ждём запуска сервера
    
    # Создаём окно с URL вместо HTML
    api = Api()
    url = f'http://127.0.0.1:{port}/index.html'
    
    window = webview.create_window(
        title=APP_NAME,
        url=url,
        js_api=api,
        width=1400,
        height=900,
        resizable=True,
        min_size=(900, 600)
    )
    
    webview.start(debug=False)

if __name__ == '__main__':
    main()
