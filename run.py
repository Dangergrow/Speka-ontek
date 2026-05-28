import os, sys, json, base64, threading, time, urllib.request, shutil, tempfile
import webview
from http.server import HTTPServer, SimpleHTTPRequestHandler
from tkinter import Tk, filedialog, messagebox

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "3.9.0"
VERSION_URL = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/version.json"
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

def create_shortcut():
    """Создать ярлык на рабочем столе (Windows)"""
    try:
        import pythoncom
        from win32com.client import Dispatch
        
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{APP_NAME}.lnk")
        exe_path = sys.executable
        
        if os.path.exists(shortcut_path):
            return  # Ярлык уже есть
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(shortcut_path)
        shortcut.Targetpath = exe_path
        shortcut.WorkingDirectory = get_app_dir()
        shortcut.IconLocation = exe_path
        shortcut.save()
        print(f"Ярлык создан: {shortcut_path}")
    except Exception as e:
        print(f"Не удалось создать ярлык: {e}")

def first_run_setup():
    """Первоначальная настройка при первом запуске"""
    app_dir = get_app_dir()
    
    # Копируем файлы из MEIPASS в папку с EXE (только при первом запуске)
    if getattr(sys, 'frozen', False):
        base = sys._MEIPASS
        files_to_copy = ['index.html', 'exceljs.min.js', 'xlsx.full.min.js']
        
        for f in files_to_copy:
            src = os.path.join(base, f)
            dst = os.path.join(app_dir, f)
            if os.path.exists(src) and not os.path.exists(dst):
                shutil.copy2(src, dst)
                print(f"Установлен: {f}")
    
    # Создаём ярлык
    create_shortcut()
    
    # Создаём файл версии
    version_file = os.path.join(app_dir, 'version.txt')
    if not os.path.exists(version_file):
        with open(version_file, 'w') as f:
            f.write(APP_VERSION)

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
        """Вернуть путь к папке программы"""
        return get_app_dir()
    
    def apply_update(self):
        """Скачать и применить обновление"""
        try:
            app_dir = get_app_dir()
            
            # Скачиваем новый index.html
            index_url = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/index.html"
            index_path = os.path.join(app_dir, 'index.html')
            
            # Скачиваем во временный файл
            tmp = os.path.join(tempfile.gettempdir(), 'ontek_index_update.html')
            urllib.request.urlretrieve(index_url, tmp)
            
            # Заменяем файл
            if os.path.exists(index_path):
                os.remove(index_path)
            shutil.move(tmp, index_path)
            
            # Обновляем файл версии
            version_file = os.path.join(app_dir, 'version.txt')
            with open(version_file, 'w') as f:
                f.write(APP_VERSION)
            
            return json.dumps({"success": True, "message": "Обновление применено!"})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def download_full_installer(self):
        """Скачать полный установщик (для старых версий)"""
        try:
            url = "https://github.com/Dangergrow/Speka-ontek/releases/latest/download/ONTEK_Orders.exe"
            tmp = os.path.join(tempfile.gettempdir(), "ONTEK_Setup.exe")
            urllib.request.urlretrieve(url, tmp)
            
            # Запускаем установщик
            os.startfile(tmp)
            
            return json.dumps({"success": True})
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})

def start_server(port, serve_dir):
    os.chdir(serve_dir)
    HTTPServer(('127.0.0.1', port), SimpleHTTPRequestHandler).serve_forever()

def main():
    # Первый запуск — настройка
    first_run_setup()
    
    # Определяем откуда сервер будет раздавать файлы
    app_dir = get_app_dir()
    base_dir = get_base_dir()
    
    # Если index.html есть в папке с EXE — используем его
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
