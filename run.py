import os
import sys
import json
import base64
import threading
import webview
from tkinter import Tk, filedialog

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "3.7.0"
UPDATE_URL = "https://raw.githubusercontent.com/Dangergrow/Speka-ontek/main/version.json"

try:
    import pystray
    from PIL import Image, ImageDraw
    TRAY_AVAILABLE = True
except ImportError:
    TRAY_AVAILABLE = False

def get_file_content(filename):
    """Получить содержимое файла (из EXE или из папки)"""
    if getattr(sys, 'frozen', False):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    
    path = os.path.join(base, filename)
    if not os.path.exists(path):
        return None
    
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def get_html():
    """Собрать HTML со встроенными библиотеками"""
    html = get_file_content('index.html')
    if not html:
        raise FileNotFoundError('index.html не найден')
    
    # Вшиваем ExcelJS
    exceljs = get_file_content('exceljs.min.js')
    if exceljs:
        html = html.replace(
            '<script src="exceljs.min.js"></script>',
            '<script>' + exceljs + '</script>'
        )
    
    # Вшиваем XLSX
    xlsx = get_file_content('xlsx.full.min.js')
    if xlsx:
        html = html.replace(
            '<script src="xlsx.full.min.js"></script>',
            '<script>' + xlsx + '</script>'
        )
    
    return html

def create_tray_icon(window):
    if not TRAY_AVAILABLE:
        return None
    img = Image.new('RGB', (64, 64), color=(30, 64, 175))
    draw = ImageDraw.Draw(img)
    draw.ellipse([12, 12, 52, 52], fill=(30, 64, 175), outline=(255, 255, 255), width=4)
    draw.text((22, 14), "O", fill=(255, 255, 255))
    menu = pystray.Menu(
        pystray.MenuItem("📊 Показать", lambda: (window.show(), window.restore()), default=True),
        pystray.MenuItem("🙈 Скрыть", lambda: window.hide()),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("❌ Выход", lambda: (icon.stop(), window.destroy()))
    )
    return pystray.Icon("ontek_orders", img, APP_NAME, menu)

class Api:
    def __init__(self):
        self._window = None
    def set_window(self, w):
        self._window = w
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
    def get_version(self):
        return APP_VERSION

def main():
    api = Api()
    html = get_html()
    
    window = webview.create_window(
        title=APP_NAME,
        html=html,
        js_api=api,
        width=1400,
        height=900,
        resizable=True,
        min_size=(900, 600)
    )
    
    api.set_window(window)
    
    if TRAY_AVAILABLE:
        tray = create_tray_icon(window)
        if tray:
            threading.Thread(target=tray.run, daemon=True).start()
    
    webview.start(debug=False)
    
    if TRAY_AVAILABLE:
        try: tray.stop()
        except: pass

if __name__ == '__main__':
    main()
