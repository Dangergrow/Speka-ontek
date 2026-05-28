import os, sys, json, base64, threading, time, urllib.request, shutil, tempfile
import webview
from http.server import HTTPServer, SimpleHTTPRequestHandler
from tkinter import Tk, filedialog

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.0.0"
VERSION_URL = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/version.json"
HTML_URL = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/index.html"
UPDATE_INFO_URL = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/update_info.json"

def get_app_dir():
    """Папка с программой (рядом с EXE или скриптом)"""
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

def get_base_dir():
    """Временная папка при запуске из EXE"""
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.dirname(os.path.abspath(__file__))

def load_config():
    """Загрузить конфиг установки"""
    config_path = os.path.join(get_app_dir(), 'config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'version': APP_VERSION, 'install_path': get_app_dir()}

def save_config(config):
    """Сохранить конфиг"""
    config_path = os.path.join(get_app_dir(), 'config.json')
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

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
    
    def get_app_dir_path(self):
        return get_app_dir()
    
    def apply_update(self):
        """Скачать и применить обновление index.html"""
        try:
            app_dir = get_app_dir()
            index_path = os.path.join(app_dir, 'index.html')
            
            # Скачиваем новый index.html
            tmp = os.path.join(tempfile.gettempdir(), 'ontek_index_update.html')
            urllib.request.urlretrieve(HTML_URL, tmp)
            
            # Заменяем файл
            if os.path.exists(index_path):
                os.remove(index_path)
            shutil.move(tmp, index_path)
            
            # Обновляем версию в конфиге
            config = load_config()
            config['version'] = APP_VERSION
            save_config(config)
            
            return json.dumps({"success": True, "message": "Обновление применено!"})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def download_full_installer(self):
        """Скачать полный установщик"""
        try:
            url = "https://github.com/Dangergrow/Speka-ontek/releases/latest/download/ONTEK_Setup.exe"
            tmp = os.path.join(tempfile.gettempdir(), "ONTEK_Setup.exe")
            urllib.request.urlretrieve(url, tmp)
            os.startfile(tmp)
            return json.dumps({"success": True})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def start_server(port, serve_dir):
    os.chdir(serve_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    app_dir = get_app_dir()
    base_dir = get_base_dir()
    
    # Копируем файлы из MEIPASS в папку с EXE (если нужно)
    if getattr(sys, 'frozen', False):
        files_to_copy = ['index.html', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']
        for f in files_to_copy:
            src = os.path.join(base_dir, f)
            dst = os.path.join(app_dir, f)
            if os.path.exists(src) and not os.path.exists(dst):
                shutil.copy2(src, dst)
    
    # Определяем откуда сервер будет раздавать файлы
    if os.path.exists(os.path.join(app_dir, 'index.html')):
        serve_dir = app_dir
    else:
        serve_dir = base_dir
    
    port = 8765
    threading.Thread(target=start_server, args=(port, serve_dir), daemon=True).start()
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
