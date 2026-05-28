import os, sys, shutil, json, threading, tempfile
from tkinter import Tk, Frame, Label, Entry, Button, Checkbutton, BooleanVar, StringVar, messagebox, filedialog
from tkinter.ttk import Progressbar

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.4.0"
APP_FOLDER = "Ontek_Speka"
DEFAULT_PATH = os.path.join(os.environ.get('ProgramFiles', 'C:\\Program Files'), APP_FOLDER)

def get_source_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.dirname(os.path.abspath(__file__))

def install_files(source_dir, target_dir, progress_callback=None):
    files = ['index.html', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']
    total = len(files)
    
    for i, f in enumerate(files):
        src = os.path.join(source_dir, f)
        dst = os.path.join(target_dir, f)
        if os.path.exists(src):
            shutil.copy2(src, dst)
        if progress_callback:
            progress_callback(int((i + 1) / (total + 1) * 100))
    
    exe_src = os.path.join(source_dir, 'ONTEK_Orders.exe')
    exe_dst = os.path.join(target_dir, 'ONTEK_Orders.exe')
    if os.path.exists(exe_src):
        shutil.copy2(exe_src, exe_dst)
    if progress_callback:
        progress_callback(100)

def create_shortcut(target_dir):
    try:
        import pythoncom
        from win32com.client import Dispatch
        
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{APP_NAME}.lnk")
        exe_path = os.path.join(target_dir, 'ONTEK_Orders.exe')
        icon_path = os.path.join(target_dir, 'icon.ico')
        
        if not os.path.exists(exe_path):
            return False
        
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
        print(f"Ярлык не создан: {e}")
        return False

def write_config(target_dir):
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
        
        self.root.update_idletasks()
        w = 540
        h = 460
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')
        
        self.install_path = StringVar(value=DEFAULT_PATH)
        self.run_after = BooleanVar(value=True)
        self.create_desktop = BooleanVar(value=True)
        
        self.setup_ui()
    
    def setup_ui(self):
        header = Frame(self.root, bg='#1e40af', height=90)
        header.pack(fill='x')
        Label(header, text=f"Установка {APP_NAME}", font=('Segoe UI', 20, 'bold'), fg='white', bg='#1e40af').pack(pady=(20, 5))
        Label(header, text=f"Версия {APP_VERSION}", font=('Segoe UI', 11), fg='#93c5fd', bg='#1e40af').pack()
        
        body = Frame(self.root, bg='#f8fafc', padx=25, pady=20)
        body.pack(fill='both', expand=True)
        
        Label(body, text="Папка установки:", font=('Segoe UI', 11, 'bold'), bg='#f8fafc', anchor='w').pack(fill='x')
        path_frame = Frame(body, bg='#f8fafc')
        path_frame.pack(fill='x', pady=(5, 15))
        self.path_entry = Entry(path_frame, textvariable=self.install_path, font=('Segoe UI', 10), width=42, bd=1, relief='solid')
        self.path_entry.pack(side='left', ipady=5)
        Button(path_frame, text="Обзор", command=self.browse, font=('Segoe UI', 10), bg='#e2e8f0', bd=0, padx=12, cursor='hand2').pack(side='left', padx=6)
        
        Checkbutton(body, text="Создать ярлык на рабочем столе", variable=self.create_desktop, font=('Segoe UI', 11), bg='#f8fafc', activebackground='#f8fafc', cursor='hand2').pack(anchor='w', pady=4)
        Checkbutton(body, text="Запустить программу после установки", variable=self.run_after, font=('Segoe UI', 11), bg='#f8fafc', activebackground='#f8fafc', cursor='hand2').pack(anchor='w', pady=4)
        
        Frame(body, bg='#e2e8f0', height=1).pack(fill='x', pady=15)
        
        self.progress = Progressbar(body, mode='determinate', length=490)
        self.status_label = Label(body, text="", font=('Segoe UI', 9), bg='#f8fafc', fg='#64748b')
        
        self.install_btn = Button(body, text="Установить", command=self.start_install, font=('Segoe UI', 13, 'bold'), bg='#1e40af', fg='white', bd=0, padx=40, pady=10, cursor='hand2')
        self.install_btn.pack(pady=10)
    
    def browse(self):
        path = filedialog.askdirectory(title="Выберите папку для установки", initialdir=self.install_path.get())
        if path:
            full_path = os.path.join(path, APP_FOLDER)
            self.install_path.set(full_path)
    
    def start_install(self):
        target = self.install_path.get()
        if not target:
            messagebox.showerror("Ошибка", "Укажите папку установки!")
            return
        
        try:
            os.makedirs(target, exist_ok=True)
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось создать папку:\n{e}")
            return
        
        self.install_btn.pack_forget()
        self.progress.pack(fill='x', pady=(10, 5))
        self.status_label.pack()
        
        def install_thread():
            try:
                source_dir = get_source_dir()
                self.root.after(0, lambda: self.status_label.config(text="Копирование файлов..."))
                install_files(source_dir, target, lambda p: self.root.after(0, self.update_progress, p))
                self.root.after(0, lambda: self.status_label.config(text="Создание ярлыка..."))
                shortcut_ok = False
                if self.create_desktop.get():
                    shortcut_ok = create_shortcut(target)
                self.root.after(0, lambda: self.status_label.config(text="Сохранение конфигурации..."))
                write_config(target)
                self.root.after(0, lambda: self.install_done(shortcut_ok))
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Ошибка", str(e)))
        
        threading.Thread(target=install_thread, daemon=True).start()
    
    def update_progress(self, value):
        self.progress['value'] = value
    
    def install_done(self, shortcut_ok=False):
        self.progress.pack_forget()
        self.status_label.pack_forget()
        
        done_frame = Frame(self.root, bg='#f8fafc')
        done_frame.pack(pady=15)
        
        Label(done_frame, text="✅ Установка завершена!", font=('Segoe UI', 14, 'bold'), bg='#f8fafc', fg='#10b981').pack(pady=5)
        Label(done_frame, text=f"Папка:\n{self.install_path.get()}", font=('Segoe UI', 10), bg='#f8fafc', fg='#64748b', justify='center').pack(pady=5)
        if shortcut_ok:
            Label(done_frame, text="Ярлык создан на рабочем столе", font=('Segoe UI', 10), bg='#f8fafc', fg='#10b981').pack()
        
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
