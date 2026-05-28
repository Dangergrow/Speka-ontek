import os
import sys
import json
import base64
import threading
import urllib.request
import webview
from tkinter import Tk, filedialog

# ==================== НАСТРОЙКИ ====================
APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "3.7.0"
UPDATE_URL = "https://raw.githubusercontent.com/yourname/ontek-orders/main/version.json"  # Замените на свой URL
CHECK_UPDATES = True  # Автоматически проверять обновления

# ==================== ТРЕЙ ====================
try:
    import pystray
    from PIL import Image, ImageDraw
    TRAY_AVAILABLE = True
except ImportError:
    TRAY_AVAILABLE = False
    print("⚠ pystray или Pillow не установлены. Сворачивание в трей отключено.")
    print("  Установите: pip install pystray Pillow")

# ==================== ФУНКЦИИ ====================

def get_html():
    """Получить HTML содержимое"""
    if getattr(sys, 'frozen', False):
        base = sys._MEIPASS
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    
    html_path = os.path.join(base, 'index.html')
    if not os.path.exists(html_path):
        raise FileNotFoundError(f'Файл не найден: {html_path}')
    
    with open(html_path, 'r', encoding='utf-8') as f:
        return f.read()


def create_tray_icon(window):
    """Создать иконку в трее"""
    if not TRAY_AVAILABLE:
        return None
    
    # Создаём иконку 64x64 — буква O на синем фоне
    img = Image.new('RGB', (64, 64), color=(30, 64, 175))
    draw = ImageDraw.Draw(img)
    # Белая буква O
    draw.ellipse([12, 12, 52, 52], fill=(30, 64, 175), outline=(255, 255, 255), width=4)
    draw.text((20, 12), "O", fill=(255, 255, 255))
    
    def on_show(icon, item):
        """Показать окно"""
        window.show()
        window.restore()
    
    def on_hide(icon, item):
        """Скрыть окно"""
        window.hide()
    
    def on_quit(icon, item):
        """Выход"""
        icon.stop()
        window.destroy()
    
    menu = pystray.Menu(
        pystray.MenuItem("📊 Показать", on_show, default=True),
        pystray.MenuItem("🙈 Скрыть", on_hide),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("❌ Выход", on_quit)
    )
    
    icon = pystray.Icon(
        "ontek_orders",
        img,
        APP_NAME,
        menu
    )
    
    return icon


def check_for_updates():
    """Проверить обновления на GitHub"""
    if not CHECK_UPDATES:
        return None
    
    try:
        req = urllib.request.Request(UPDATE_URL, headers={'User-Agent': 'ONTEK-Updater'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            latest_version = data.get('version', '0.0.0')
            
            if latest_version > APP_VERSION:
                return {
                    'version': latest_version,
                    'url': data.get('url', ''),
                    'notes': data.get('notes', '')
                }
    except Exception as e:
        print(f"⚠ Не удалось проверить обновления: {e}")
    
    return None


def show_update_dialog(window, update_info):
    """Показать диалог обновления"""
    if not update_info:
        return
    
    import tkinter.messagebox as mb
    root = Tk()
    root.withdraw()
    
    msg = f"Доступна новая версия!\n\n"
    msg += f"Текущая: {APP_VERSION}\n"
    msg += f"Новая: {update_info['version']}\n\n"
    if update_info.get('notes'):
        msg += f"Изменения:\n{update_info['notes']}\n\n"
    msg += "Скачать обновление?"
    
    result = mb.askyesno("Обновление ONTEK", msg)
    root.destroy()
    
    if result and update_info.get('url'):
        import webbrowser
        webbrowser.open(update_info['url'])


class Api:
    """API для взаимодействия с JavaScript"""
    
    def __init__(self):
        self._window = None
    
    def set_window(self, window):
        self._window = window
    
    def save_file(self, data_b64, default_name):
        """Сохранить файл через диалог"""
        try:
            file_data = base64.b64decode(data_b64)
            
            root = Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            
            file_path = filedialog.asksaveasfilename(
                defaultextension=".xlsx",
                initialfile=default_name,
                filetypes=[("Excel файлы", "*.xlsx"), ("Все файлы", "*.*")],
                title="Сохранить таблицу как..."
            )
            
            root.destroy()
            
            if file_path:
                with open(file_path, 'wb') as f:
                    f.write(file_data)
                return json.dumps({"success": True, "path": file_path})
            else:
                return json.dumps({"success": False, "message": "Отменено пользователем"})
                
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def load_file(self):
        """Загрузить файл через диалог"""
        try:
            root = Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            
            file_path = filedialog.askopenfilename(
                filetypes=[("Excel файлы", "*.xlsx;*.xls"), ("Все файлы", "*.*")],
                title="Открыть таблицу"
            )
            
            root.destroy()
            
            if file_path:
                with open(file_path, 'rb') as f:
                    file_data = base64.b64encode(f.read()).decode('utf-8')
                return json.dumps({
                    "success": True, 
                    "name": os.path.basename(file_path),
                    "data": file_data
                })
            else:
                return json.dumps({"success": False, "message": "Отменено"})
                
        except Exception as e:
            return json.dumps({"success": False, "message": str(e)})
    
    def get_version(self):
        """Вернуть версию приложения"""
        return APP_VERSION
    
    def minimize_to_tray(self):
        """Свернуть в трей"""
        if self._window and TRAY_AVAILABLE:
            self._window.hide()
            return "ok"
        return "tray_unavailable"


def main():
    api = Api()
    html_content = get_html()
    
    # Создаём окно
    window = webview.create_window(
        title=APP_NAME,
        html=html_content,
        js_api=api,
        width=1400,
        height=900,
        resizable=True,
        min_size=(900, 600)
    )
    
    api.set_window(window)
    
    # Иконка в трее
    tray_icon = None
    if TRAY_AVAILABLE:
        tray_icon = create_tray_icon(window)
        if tray_icon:
            threading.Thread(target=tray_icon.run, daemon=True).start()
    
    # Проверка обновлений (в фоне)
    def check_updates_bg():
        import time
        time.sleep(2)  # Ждём загрузки окна
        update_info = check_for_updates()
        if update_info:
            window.evaluate_js(f'''
                (function() {{
                    var toast = document.createElement('div');
                    toast.className = 'toast toast-success';
                    toast.textContent = '🆕 Доступна версия {update_info["version"]}! Нажмите Ctrl+U для скачивания';
                    document.body.appendChild(toast);
                    setTimeout(function() {{ toast.remove(); }}, 8000);
                }})();
            ''')
    
    if CHECK_UPDATES:
        threading.Thread(target=check_updates_bg, daemon=True).start()
    
    # Запуск
    webview.start(debug=False)
    
    # Остановка трея при закрытии
    if tray_icon:
        tray_icon.stop()


if __name__ == '__main__':
    main()