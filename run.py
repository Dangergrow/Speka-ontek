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
            with open(settings_path, 'w', encoding='utf-8') as f:
                f.write(settings_json)
            return json.dumps({"success": True})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def load_settings(self):
        try:
            settings_path = os.path.join(get_app_dir(), 'settings.json')
            if os.path.exists(settings_path):
                with open(settings_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if content and content.strip():
                    return content
            return "{}"
        except:
            return "{}"
    
    def apply_update(self):
        """Скачать ВСЕ файлы обновления и перезапустить программу"""
        try:
            app_dir = get_app_dir()
            files = ['index.html', 'css/themes.css', 'css/style.css', 'js/app.js', 'js/init.js']
            updated = 0
            
            for f in files:
                url = f"{GITHUB_RAW}/{f}"
                local_path = os.path.join(app_dir, f)
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'ONTEK-Updater/1.0',
                    'Cache-Control': 'no-cache'
                })
                
                try:
                    with urllib.request.urlopen(req, timeout=15) as response:
                        content = response.read()
                        if len(content) > 500:
                            if os.path.exists(local_path):
                                os.remove(local_path)
                            with open(local_path, 'wb') as out:
                                out.write(content)
                            updated += 1
                except Exception as e:
                    print(f"Ошибка скачивания {f}: {e}")
                    continue
            
            if updated > 0:
                # Обновляем файл версии
                exe_path = os.path.join(app_dir, 'ONTEK_Orders.exe')
                # Запускаем новый экземпляр и закрываем текущий
                if os.path.exists(exe_path):
                    subprocess.Popen([exe_path], shell=True)
                else:
                    # Если запущены как скрипт
                    subprocess.Popen([sys.executable] + sys.argv, shell=True)
                os._exit(0)
                return json.dumps({"success": True, "message": "Обновлено!"})
            
            return json.dumps({"success": False, "message": "Не удалось скачать обновления"})
            
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def first_run_copy():
    """Копирует файлы из _MEIPASS в папку с EXE только при ПЕРВОМ запуске"""
    if not getattr(sys, 'frozen', False):
        return
    
    app_dir = get_app_dir()
    base_dir = sys._MEIPASS
    
    # Если index.html уже есть — не копируем (сохраняем обновления)
    if os.path.exists(os.path.join(app_dir, 'index.html')):
        return
    
    files = ['index.html', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']
    folders = ['css', 'js']
    
    for f in files:
        src = os.path.join(base_dir, f); dst = os.path.join(app_dir, f)
        if os.path.exists(src):
            try: shutil.copy2(src, dst)
            except: pass
    
    for folder in folders:
        src_folder = os.path.join(base_dir, folder); dst_folder = os.path.join(app_dir, folder)
        if os.path.exists(src_folder):
            os.makedirs(dst_folder, exist_ok=True)
            for f in os.listdir(src_folder):
                sf = os.path.join(src_folder, f); df = os.path.join(dst_folder, f)
                if os.path.isfile(sf):
                    try: shutil.copy2(sf, df)
                    except: pass

def start_server(port, serve_dir):
    os.chdir(serve_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    first_run_copy()
    
    # ВСЕГДА папка с EXE (там лежат обновлённые файлы)
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
