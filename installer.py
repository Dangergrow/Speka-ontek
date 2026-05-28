import os, sys, shutil, json, threading, urllib.request, tempfile
from tkinter import Tk, Frame, Label, Entry, Button, Checkbutton, BooleanVar, StringVar, messagebox, filedialog
from tkinter.ttk import Progressbar

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.0.0"
DEFAULT_PATH = os.path.join(os.environ.get('ProgramFiles', 'C:\\Program Files'), 'ONTEK')

def install_files(source_dir, target_dir, progress_callback=None):
    """Копирует файлы в папку установки"""
    files = ['index.html', 'run.py', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']
    total = len(files)
    
    # Если запущены из EXE — source_dir = sys._MEIPASS
    if not os.path.exists(os.path.join(source_dir, 'index.html')):
        source_dir = sys._MEIPASS
    
    for i, f in enumerate(files):
        src = os.path.join(source_dir, f)
        dst = os.path.join(target_dir, f)
        if os.path.exists(src):
            shutil.copy2(src, dst)
        if progress_callback:
            progress_callback(int((i + 1) / total * 100))

def create_shortcut(target_dir):
    """Создать ярлык на рабочем столе с иконкой"""
    try:
        import pythoncom
        from win32com.client import Dispatch
        
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{APP_NAME}.lnk")
        exe_path = sys.executable  # Путь к запущенному EXE
        icon_path = os.path.join(target_dir, 'icon.ico')
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(shortcut_path)
        shortcut.Targetpath = exe_path
        shortcut.WorkingDirectory = target_dir
        shortcut.Description = APP_NAME
        if os.path.exists(icon_path):
            shortcut.IconLocation = icon_path
        shortcut.save()
        return True
    except Exception as e:
        print(f"Не удалось создать ярлык: {e}")
        return False

def write_config(target_dir):
    """Записать конфиг установки"""
    config = {
        'version': APP_VERSION,
        'install_path': target_dir
    }
    with open(os.path.join(target_dir, 'config.json'), 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

class Installer:
    def __init__(self):
        self.root = Tk()
        self.root.title(f"Установка {APP_NAME}")
        self.root.geometry("540x460")
        self.root.resizable(False, False)
        self.root.configure(bg='#f8fafc')
        
        # Центрирование
        self.root.update_idletasks()
        w = 540; h = 460
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')
        
        # Переменные
        self.install_path = StringVar(value=DEFAULT_PATH)
        self.run_after = BooleanVar(value=True)
        self.create_desktop = BooleanVar(value=True)
        self.install_done_flag = False
        
        self.setup_ui()
    
    def setup_ui(self):
        # Заголовок
        header = Frame(self.root, bg='#1e40af', height=90)
        header.pack(fill='x')
        Label(header, text=f"Установка {APP_NAME}", font=('Segoe UI', 20, 'bold'), fg='white', bg='#1e40af').pack(pady=(20, 5))
        Label(header, text=f"Версия {APP_VERSION}", font=('Segoe UI', 11), fg='#93c5fd', bg='#1e40af').pack()
        
        # Тело
        body = Frame(self.root, bg='#f8fafc', padx=25, pady=20)
        body.pack(fill='both', expand=True)
        
        # Папка установки
        Label(body, text="Папка установки:", font=('Segoe UI', 11, 'bold'), bg='#f8fafc', anchor='w').pack(fill='x')
        path_frame = Frame(body, bg='#f8fafc')
        path_frame.pack(fill='x', pady=(5, 15))
        self.path_entry = Entry(path_frame, textvariable=self.install_path, font=('Segoe UI', 10), width=42, bd=1, relief='solid')
        self.path_entry.pack(side='left', ipady=5)
        Button(path_frame, text="Обзор", command=self.browse, font=('Segoe UI', 10), bg='#e2e8f0', bd=0, padx=12, cursor='hand2').pack(side='left', padx=6)
        
        # Галочки
        Checkbutton(body, text="Создать ярлык на рабочем столе", variable=self.create_desktop, font=('Segoe UI', 11), bg='#f8fafc', activebackground='#f8fafc', cursor='hand2').pack(anchor='w', pady=4)
        Checkbutton(body, text="Запустить программу после установки", variable=self.run_after, font=('Segoe UI', 11), bg='#f8fafc', activebackground='#f8fafc', cursor='hand2').pack(anchor='w', pady=4)
        
        # Разделитель
        Frame(body, bg='#e2e8f0', height=1).pack(fill='x', pady=15)
        
        # Прогресс
        self.progress_frame = Frame(body, bg='#f8fafc')
        self.progress = Progressbar(body, mode='determinate', length=490)
        self.status_label = Label(body, text="", font=('Segoe UI', 9), bg='#f8fafc', fg='#64748b')
        
        # Кнопка установки
        self.install_btn = Button(body, text="Установить", command=self.start_install, font=('Segoe UI', 13, 'bold'), bg='#1e40af', fg='white', bd=0, padx=40, pady=10, cursor='hand2')
        self.install_btn.pack(pady=10)
    
    def browse(self):
        path = filedialog.askdirectory(title="Выберите папку для установки", initialdir=self.install_path.get())
        if path:
            self.install_path.set(path)
    
    def start_install(self):
        target = self.install_path.get()
        if not target:
            messagebox.showerror("Ошибка", "Укажите папку установки!")
            return
        
        # Создаём папку
        try:
            os.makedirs(target, exist_ok=True)
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось создать папку:\n{e}")
            return
        
        # Прячем кнопку, показываем прогресс
        self.install_btn.pack_forget()
        self.progress.pack(fill='x', pady=(10, 5))
        self.status_label.pack()
        
        # Запуск в потоке
        def install_thread():
            try:
                source_dir = os.path.dirname(os.path.abspath(__file__))
                
                self.root.after(0, lambda: self.status_label.config(text="Копирование файлов..."))
                install_files(source_dir, target, lambda p: self.root.after(0, self.update_progress, p))
                
                self.root.after(0, lambda: self.status_label.config(text="Создание ярлыка..."))
                if self.create_desktop.get():
                    create_shortcut(target)
                
                self.root.after(0, lambda: self.status_label.config(text="Сохранение конфигурации..."))
                write_config(target)
                
                # Копируем сам EXE в папку установки (чтобы ярлык вёл на него)
                exe_src = sys.executable
                exe_dst = os.path.join(target, 'ONTEK_Orders.exe')
                if os.path.abspath(exe_src) != os.path.abspath(exe_dst):
                    shutil.copy2(exe_src, exe_dst)
                
                self.root.after(0, self.install_done)
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Ошибка", str(e)))
        
        threading.Thread(target=install_thread, daemon=True).start()
    
    def update_progress(self, value):
        self.progress['value'] = value
    
    def install_done(self):
        self.install_done_flag = True
        self.progress.pack_forget()
        self.status_label.pack_forget()
        
        # Успех
        done_frame = Frame(self.root, bg='#f8fafc')
        done_frame.pack(pady=15)
        
        Label(done_frame, text="✅ Установка успешно завершена!", font=('Segoe UI', 14, 'bold'), bg='#f8fafc', fg='#10b981').pack(pady=5)
        Label(done_frame, text=f"Программа установлена в:\n{self.install_path.get()}", font=('Segoe UI', 10), bg='#f8fafc', fg='#64748b', justify='center').pack(pady=5)
        
        btn_frame = Frame(done_frame, bg='#f8fafc')
        btn_frame.pack(pady=10)
        
        if self.run_after.get():
            Button(btn_frame, text="🚀 Запустить ONTEK", command=self.launch_and_close, font=('Segoe UI', 12, 'bold'), bg='#10b981', fg='white', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
        
        Button(btn_frame, text="Закрыть", command=self.root.destroy, font=('Segoe UI', 12), bg='#e2e8f0', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
    
    def launch_and_close(self):
        exe = os.path.join(self.install_path.get(), 'ONTEK_Orders.exe')
        if os.path.exists(exe):
            os.startfile(exe)
        self.root.destroy()
    
    def run(self):
        self.root.mainloop()

if __name__ == '__main__':
    Installer().run()
