import os, sys, shutil, json
from tkinter import Tk, Frame, Label, Entry, Button, Checkbutton, BooleanVar, messagebox, filedialog
from tkinter.ttk import Progressbar
import threading, urllib.request, tempfile

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.0.0"
DEFAULT_PATH = os.path.join(os.environ['ProgramFiles'], 'ONTEK')

def install_files(target_dir, progress_callback=None):
    """Копирует файлы в папку установки"""
    files = ['index.html', 'run.py', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']
    total = len(files)
    for i, f in enumerate(files):
        src = os.path.join(os.path.dirname(sys.executable), f)
        if not os.path.exists(src):
            src = os.path.join(sys._MEIPASS, f)
        dst = os.path.join(target_dir, f)
        if os.path.exists(src):
            shutil.copy2(src, dst)
        if progress_callback:
            progress_callback(int((i + 1) / total * 100))

def create_shortcut(target_dir):
    """Создать ярлык на рабочем столе"""
    try:
        import pythoncom
        from win32com.client import Dispatch
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{APP_NAME}.lnk")
        exe_path = os.path.join(target_dir, 'ONTEK_Orders.exe')
        icon_path = os.path.join(target_dir, 'icon.ico')
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(shortcut_path)
        shortcut.Targetpath = exe_path
        shortcut.WorkingDirectory = target_dir
        if os.path.exists(icon_path):
            shortcut.IconLocation = icon_path
        shortcut.save()
        return True
    except:
        return False

def write_config(target_dir):
    """Записать конфиг установки"""
    config = {
        'version': APP_VERSION,
        'install_path': target_dir
    }
    with open(os.path.join(target_dir, 'config.json'), 'w') as f:
        json.dump(config, f)

class Installer:
    def __init__(self):
        self.root = Tk()
        self.root.title(f"Установка {APP_NAME}")
        self.root.geometry("520x420")
        self.root.resizable(False, False)
        self.root.configure(bg='#f8fafc')
        
        # Центрирование окна
        self.root.update_idletasks()
        w = 520; h = 420
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')
        
        self.install_path = StringVar(value=DEFAULT_PATH)
        self.run_after = BooleanVar(value=True)
        self.create_desktop = BooleanVar(value=True)
        
        self.setup_ui()
    
    def setup_ui(self):
        # Заголовок
        header = Frame(self.root, bg='#1e40af', height=80)
        header.pack(fill='x')
        Label(header, text=f"Установка {APP_NAME}", font=('Segoe UI', 18, 'bold'), fg='white', bg='#1e40af').pack(pady=20)
        Label(header, text=f"Версия {APP_VERSION}", font=('Segoe UI', 10), fg='#93c5fd', bg='#1e40af').pack()
        
        # Тело
        body = Frame(self.root, bg='#f8fafc', padx=20, pady=20)
        body.pack(fill='both', expand=True)
        
        Label(body, text="Папка установки:", font=('Segoe UI', 11, 'bold'), bg='#f8fafc', anchor='w').pack(fill='x')
        path_frame = Frame(body, bg='#f8fafc')
        path_frame.pack(fill='x', pady=(5, 15))
        Entry(path_frame, textvariable=self.install_path, font=('Segoe UI', 10), width=40, bd=1, relief='solid').pack(side='left', ipady=4)
        Button(path_frame, text="Обзор", command=self.browse, font=('Segoe UI', 10), bg='#e2e8f0', bd=0, padx=10, cursor='hand2').pack(side='left', padx=5)
        
        Checkbutton(body, text="Создать ярлык на рабочем столе", variable=self.create_desktop, font=('Segoe UI', 10), bg='#f8fafc', activebackground='#f8fafc').pack(anchor='w', pady=3)
        Checkbutton(body, text="Запустить программу после установки", variable=self.run_after, font=('Segoe UI', 10), bg='#f8fafc', activebackground='#f8fafc').pack(anchor='w', pady=3)
        
        # Прогресс
        self.progress = Progressbar(body, mode='determinate', length=460)
        self.status_label = Label(body, text="", font=('Segoe UI', 9), bg='#f8fafc', fg='#64748b')
        
        # Кнопки
        btn_frame = Frame(self.root, bg='#f8fafc', pady=15)
        btn_frame.pack(fill='x')
        self.install_btn = Button(btn_frame, text="Установить", command=self.start_install, font=('Segoe UI', 12, 'bold'), bg='#1e40af', fg='white', bd=0, padx=30, pady=8, cursor='hand2')
        self.install_btn.pack()
    
    def browse(self):
        path = filedialog.askdirectory(title="Выберите папку установки")
        if path:
            self.install_path.set(path)
    
    def start_install(self):
        target = self.install_path.get()
        if not target:
            messagebox.showerror("Ошибка", "Выберите папку установки!")
            return
        
        # Создаём папку
        os.makedirs(target, exist_ok=True)
        
        # Показываем прогресс
        self.install_btn.pack_forget()
        self.progress.pack(fill='x', pady=10)
        self.status_label.pack()
        
        def install_thread():
            try:
                self.status_label.config(text="Копирование файлов...")
                install_files(target, lambda p: self.root.after(0, self.update_progress, p))
                
                self.status_label.config(text="Создание ярлыка...")
                if self.create_desktop.get():
                    create_shortcut(target)
                
                self.status_label.config(text="Сохранение конфигурации...")
                write_config(target)
                
                self.root.after(0, self.install_done)
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Ошибка", str(e)))
        
        threading.Thread(target=install_thread, daemon=True).start()
    
    def update_progress(self, value):
        self.progress['value'] = value
    
    def install_done(self):
        self.progress.pack_forget()
        self.status_label.pack_forget()
        
        Label(self.root, text="✅ Установка завершена!", font=('Segoe UI', 14, 'bold'), bg='#f8fafc', fg='#10b981').pack(pady=10)
        
        btn_frame = Frame(self.root, bg='#f8fafc')
        btn_frame.pack(pady=10)
        
        if self.run_after.get():
            Button(btn_frame, text="Запустить ONTEK", command=self.launch_and_close, font=('Segoe UI', 12, 'bold'), bg='#10b981', fg='white', bd=0, padx=25, pady=8, cursor='hand2').pack(side='left', padx=5)
        
        Button(btn_frame, text="Закрыть", command=self.root.destroy, font=('Segoe UI', 12), bg='#e2e8f0', bd=0, padx=25, pady=8, cursor='hand2').pack(side='left', padx=5)
    
    def launch_and_close(self):
        exe = os.path.join(self.install_path.get(), 'ONTEK_Orders.exe')
        if os.path.exists(exe):
            os.startfile(exe)
        self.root.destroy()
    
    def run(self):
        self.root.mainloop()

if __name__ == '__main__':
    Installer().run()