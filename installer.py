import os, sys, shutil, json, threading, tempfile, subprocess
from tkinter import Tk, Frame, Label, Entry, Button, Checkbutton, BooleanVar, StringVar, messagebox, filedialog
from tkinter.ttk import Progressbar

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.5.0"
APP_FOLDER = "Ontek_Speka"
DEFAULT_PATH = os.path.join(os.environ.get('LOCALAPPDATA', os.path.expanduser('~')), 'Programs', APP_FOLDER)

def get_source_dir():
    if getattr(sys, 'frozen', False): return sys._MEIPASS
    else: return os.path.dirname(os.path.abspath(__file__))

def install_files(source_dir, target_dir, progress_callback=None):
    files = ['index.html', 'exceljs.min.js', 'xlsx.full.min.js', 'icon.ico']
    folders = ['css', 'js']
    total = len(files) + len(folders) + 1
    done = 0
    for f in files:
        src = os.path.join(source_dir, f)
        dst = os.path.join(target_dir, f)
        if os.path.exists(src):
            try:
                if os.path.exists(dst): os.remove(dst)
                shutil.copy2(src, dst)
            except: pass
        done += 1
        if progress_callback: progress_callback(int(done / total * 100))
    for folder in folders:
        src_folder = os.path.join(source_dir, folder)
        dst_folder = os.path.join(target_dir, folder)
        if os.path.exists(src_folder):
            os.makedirs(dst_folder, exist_ok=True)
            for f in os.listdir(src_folder):
                sf = os.path.join(src_folder, f)
                df = os.path.join(dst_folder, f)
                if os.path.isfile(sf):
                    try:
                        if os.path.exists(df): os.remove(df)
                        shutil.copy2(sf, df)
                    except: pass
        done += 1
        if progress_callback: progress_callback(int(done / total * 100))
    exe_src = os.path.join(source_dir, 'ONTEK_Orders.exe')
    exe_dst = os.path.join(target_dir, 'ONTEK_Orders.exe')
    if os.path.exists(exe_src):
        try:
            if os.path.exists(exe_dst): os.remove(exe_dst)
            shutil.copy2(exe_src, exe_dst)
        except: pass
    if progress_callback: progress_callback(100)

def create_shortcut(target_dir):
    """Создать ярлык через PowerShell (работает на Windows 10/11)"""
    try:
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{APP_NAME}.lnk")
        exe_path = os.path.join(target_dir, 'ONTEK_Orders.exe')
        icon_path = os.path.join(target_dir, 'icon.ico')
        
        if not os.path.exists(exe_path):
            return False
        
        # Удаляем старый ярлык если есть
        if os.path.exists(shortcut_path):
            os.remove(shortcut_path)
        
        # PowerShell команда для создания ярлыка
        ps_script = f'''
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{exe_path}"
$Shortcut.WorkingDirectory = "{target_dir}"
$Shortcut.Description = "{APP_NAME}"
$Shortcut.IconLocation = "{icon_path}"
$Shortcut.Save()
'''
        result = subprocess.run(['powershell', '-Command', ps_script], capture_output=True, text=True, shell=True)
        return os.path.exists(shortcut_path)
    except Exception as e:
        print(f"Ярлык не создан: {e}")
        # Запасной способ через win32com
        try:
            import pythoncom
            from win32com.client import Dispatch
            pythoncom.CoInitialize()
            shell = Dispatch('WScript.Shell')
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.Targetpath = exe_path
            shortcut.WorkingDirectory = target_dir
            shortcut.Description = APP_NAME
            if os.path.exists(icon_path):
                shortcut.IconLocation = icon_path
            shortcut.Save()
            pythoncom.CoUninitialize()
            return os.path.exists(shortcut_path)
        except Exception as e2:
            print(f"Запасной способ не сработал: {e2}")
            return False

def write_config(target_dir):
    config = {'version': APP_VERSION, 'install_path': target_dir}
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
        w=540;h=460
        x=(self.root.winfo_screenwidth()//2)-(w//2)
        y=(self.root.winfo_screenheight()//2)-(h//2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')
        self.install_path = StringVar(value=DEFAULT_PATH)
        self.run_after = BooleanVar(value=True)
        self.create_desktop = BooleanVar(value=True)
        self.setup_ui()
    
    def setup_ui(self):
        header = Frame(self.root, bg='#1e40af', height=90)
        header.pack(fill='x')
        Label(header, text=f"Установка {APP_NAME}", font=('Segoe UI', 20, 'bold'), fg='white', bg='#1e40af').pack(pady=(20,5))
        Label(header, text=f"Версия {APP_VERSION}", font=('Segoe UI', 11), fg='#93c5fd', bg='#1e40af').pack()
        body = Frame(self.root, bg='#f8fafc', padx=25, pady=20)
        body.pack(fill='both', expand=True)
        Label(body, text="Папка установки:", font=('Segoe UI', 11, 'bold'), bg='#f8fafc', anchor='w').pack(fill='x')
        pf = Frame(body, bg='#f8fafc')
        pf.pack(fill='x', pady=(5,15))
        Entry(pf, textvariable=self.install_path, font=('Segoe UI', 10), width=42, bd=1, relief='solid').pack(side='left', ipady=5)
        Button(pf, text="Обзор", command=self.browse, font=('Segoe UI', 10), bg='#e2e8f0', bd=0, padx=12, cursor='hand2').pack(side='left', padx=6)
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
        if not target: messagebox.showerror("Ошибка", "Укажите папку установки!"); return
        try: os.makedirs(target, exist_ok=True)
        except Exception as e: messagebox.showerror("Ошибка", str(e)); return
        self.install_btn.pack_forget()
        self.progress.pack(fill='x', pady=(10,5))
        self.status_label.pack()
        def install_thread():
            try:
                sd = get_source_dir()
                self.root.after(0, lambda: self.status_label.config(text="Копирование файлов..."))
                install_files(sd, target, lambda p: self.root.after(0, self.update_progress, p))
                so = False
                if self.create_desktop.get():
                    self.root.after(0, lambda: self.status_label.config(text="Создание ярлыка..."))
                    so = create_shortcut(target)
                self.root.after(0, lambda: self.status_label.config(text="Сохранение конфигурации..."))
                write_config(target)
                self.root.after(0, lambda: self.install_done(so))
            except Exception as e: self.root.after(0, lambda: messagebox.showerror("Ошибка", str(e)))
        threading.Thread(target=install_thread, daemon=True).start()
    
    def update_progress(self, value): self.progress['value'] = value
    
    def install_done(self, so=False):
        self.progress.pack_forget(); self.status_label.pack_forget()
        df = Frame(self.root, bg='#f8fafc'); df.pack(pady=15)
        Label(df, text="✅ Установка завершена!", font=('Segoe UI', 14, 'bold'), bg='#f8fafc', fg='#10b981').pack(pady=5)
        Label(df, text=f"Папка:\n{self.install_path.get()}", font=('Segoe UI', 10), bg='#f8fafc', fg='#64748b', justify='center').pack(pady=5)
        if so: Label(df, text="Ярлык создан на рабочем столе", font=('Segoe UI', 10), bg='#f8fafc', fg='#10b981').pack()
        bf = Frame(df, bg='#f8fafc'); bf.pack(pady=10)
        if self.run_after.get():
            Button(bf, text="🚀 Запустить ONTEK", command=self.launch_and_close, font=('Segoe UI', 12, 'bold'), bg='#10b981', fg='white', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
        Button(bf, text="Закрыть", command=self.root.destroy, font=('Segoe UI', 12), bg='#e2e8f0', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
    
    def launch_and_close(self):
        exe = os.path.join(self.install_path.get(), 'ONTEK_Orders.exe')
        if os.path.exists(exe):
            os.startfile(exe)
        self.root.destroy()
    
    def run(self): self.root.mainloop()

if __name__ == '__main__': Installer().run()
