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
    try:
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{APP_NAME}.lnk")
        exe_path = os.path.join(target_dir, 'ONTEK_Orders.exe')
        icon_path = os.path.join(target_dir, 'icon.ico')
        if not os.path.exists(exe_path): return False
        if os.path.exists(shortcut_path): os.remove(shortcut_path)
        ps = f'''
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{exe_path}"
$Shortcut.WorkingDirectory = "{target_dir}"
$Shortcut.IconLocation = "{icon_path}"
$Shortcut.Save()
'''
        subprocess.run(['powershell', '-Command', ps], capture_output=True, shell=True)
        return os.path.exists(shortcut_path)
    except: return False

def write_config(target_dir):
    with open(os.path.join(target_dir, 'config.json'), 'w', encoding='utf-8') as f:
        json.dump({'version': APP_VERSION, 'install_path': target_dir}, f)

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
        self.exe_path = None
        self.setup_ui()
    
    def setup_ui(self):
        header = Frame(self.root, bg='#1e40af', height=90)
        header.pack(fill='x')
        Label(header, text=f"Установка {APP_NAME}", font=('Segoe UI', 20, 'bold'), fg='white', bg='#1e40af').pack(pady=(20,5))
        Label(header, text=f"Версия {APP_VERSION}", font=('Segoe UI', 11), fg='#93c5fd', bg='#1e40af').pack()
        body = Frame(self.root, bg='#f8fafc', padx=25, pady=20)
        body.pack(fill='both', expand=True)
        Label(body, text="Папка установки:", font=('Segoe UI', 11, 'bold'), bg='#f8fafc').pack(fill='x')
        pf = Frame(body, bg='#f8fafc'); pf.pack(fill='x', pady=(5,15))
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
        path = filedialog.askdirectory(title="Выберите папку", initialdir=self.install_path.get())
        if path: self.install_path.set(os.path.join(path, APP_FOLDER))
    
    def start_install(self):
        target = self.install_path.get()
        if not target: messagebox.showerror("Ошибка", "Укажите папку!"); return
        try: os.makedirs(target, exist_ok=True)
        except Exception as e: messagebox.showerror("Ошибка", str(e)); return
        self.install_btn.pack_forget()
        self.progress.pack(fill='x', pady=(10,5))
        self.status_label.pack()
        def run():
            sd = get_source_dir()
            self.root.after(0, lambda: self.status_label.config(text="Копирование..."))
            install_files(sd, target, lambda p: self.root.after(0, lambda v=p: self.progress.configure(value=v)))
            self.exe_path = os.path.join(target, 'ONTEK_Orders.exe')
            so = False
            if self.create_desktop.get():
                self.root.after(0, lambda: self.status_label.config(text="Ярлык..."))
                so = create_shortcut(target)
            write_config(target)
            self.root.after(0, lambda: self.done(so))
        threading.Thread(target=run, daemon=True).start()
    
    def done(self, so):
        self.progress.pack_forget(); self.status_label.pack_forget()
        Label(self.root, text="✅ Установка завершена!", font=('Segoe UI', 14, 'bold'), bg='#f8fafc', fg='#10b981').pack(pady=5)
        if so: Label(self.root, text="Ярлык на рабочем столе", font=('Segoe UI', 10), bg='#f8fafc', fg='#10b981').pack()
        bf = Frame(self.root, bg='#f8fafc'); bf.pack(pady=10)
        if self.run_after.get() and self.exe_path and os.path.exists(self.exe_path):
            Button(bf, text="🚀 Запустить", command=lambda: (os.startfile(self.exe_path), self.root.destroy()), font=('Segoe UI', 12, 'bold'), bg='#10b981', fg='white', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
        Button(bf, text="Готово", command=self.root.destroy, font=('Segoe UI', 12, 'bold'), bg='#e2e8f0', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
    
    def run(self): self.root.mainloop()

if __name__ == '__main__':
    Installer().run()
