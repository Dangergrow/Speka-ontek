import os, sys, shutil, json, threading, tempfile, subprocess
from tkinter import Tk, Frame, Label, Entry, Button, Checkbutton, BooleanVar, StringVar, messagebox, filedialog
from tkinter.ttk import Progressbar

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "4.5.0"
APP_FOLDER = "Ontek_Speka"
SHORTCUT_NAME = "ONTEK"
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
    """Создать ярлык на рабочем столе"""
    try:
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{SHORTCUT_NAME}.lnk")
        exe_path = os.path.join(target_dir, 'ONTEK_Orders.exe')
        icon_path = os.path.join(target_dir, 'icon.ico')
        
        if not os.path.exists(exe_path):
            return False
        
        # Удаляем старый ярлык если есть
        if os.path.exists(shortcut_path):
            try: os.remove(shortcut_path)
            except: pass
        
        # Пробуем через PowerShell (Windows 10/11)
        ps_script = f'''
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{exe_path}"
$Shortcut.WorkingDirectory = "{target_dir}"
$Shortcut.IconLocation = "{icon_path}"
$Shortcut.Save()
'''
        try:
            result = subprocess.run(['powershell', '-Command', ps_script], capture_output=True, text=True, shell=True, timeout=10)
            if os.path.exists(shortcut_path):
                return True
        except:
            pass
        
        # Запасной способ — VBScript
        vbs = f'''Set WshShell = CreateObject("WScript.Shell")
Set Shortcut = WshShell.CreateShortcut("{shortcut_path}")
Shortcut.TargetPath = "{exe_path}"
Shortcut.WorkingDirectory = "{target_dir}"
Shortcut.Save()'''
        
        vbs_path = os.path.join(tempfile.gettempdir(), 'create_shortcut.vbs')
        try:
            with open(vbs_path, 'w', encoding='ascii') as f:
                f.write(vbs)
            subprocess.run(['cscript', '//NoLogo', vbs_path], capture_output=True, shell=True, timeout=10)
        except:
            pass
        finally:
            try: os.remove(vbs_path)
            except: pass
        
        return os.path.exists(shortcut_path)
        
    except Exception as e:
        print(f"Ошибка создания ярлыка: {e}")
        return False

def write_config(target_dir):
    config = {'version': APP_VERSION, 'install_path': target_dir}
    config_path = os.path.join(target_dir, 'config.json')
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

class Installer:
    def __init__(self):
        self.root = Tk()
        self.root.title(f"Установка {APP_NAME}")
        self.root.geometry("540x440")
        self.root.resizable(False, False)
        self.root.configure(bg='#f8fafc')
        self.root.update_idletasks()
        w=540;h=440
        x=(self.root.winfo_screenwidth()//2)-(w//2)
        y=(self.root.winfo_screenheight()//2)-(h//2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')
        self.install_path = StringVar(value=DEFAULT_PATH)
        self.create_desktop = BooleanVar(value=True)
        self.exe_path = None
        self.setup_ui()
    
    def setup_ui(self):
        header = Frame(self.root, bg='#1e40af', height=80)
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
        
        Checkbutton(body, text="Создать ярлык на рабочем столе", variable=self.create_desktop, font=('Segoe UI', 11), bg='#f8fafc', activebackground='#f8fafc', cursor='hand2').pack(anchor='w', pady=10)
        
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
        self.progress.pack(fill='x', pady=(10,5))
        self.status_label.pack()
        
        def install_thread():
            try:
                sd = get_source_dir()
                self.root.after(0, lambda: self.status_label.config(text="Копирование файлов..."))
                install_files(sd, target, lambda p: self.root.after(0, self.update_progress, p))
                
                self.exe_path = os.path.join(target, 'ONTEK_Orders.exe')
                
                shortcut_ok = False
                if self.create_desktop.get():
                    self.root.after(0, lambda: self.status_label.config(text="Создание ярлыка..."))
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
        
        Label(self.root, text="✅ Установка завершена!", font=('Segoe UI', 14, 'bold'), bg='#f8fafc', fg='#10b981').pack(pady=5)
        Label(self.root, text=f"Папка:\n{self.install_path.get()}", font=('Segoe UI', 10), bg='#f8fafc', fg='#64748b', justify='center').pack(pady=5)
        
        if shortcut_ok:
            Label(self.root, text="Ярлык создан на рабочем столе", font=('Segoe UI', 10), bg='#f8fafc', fg='#10b981').pack()
        else:
            Label(self.root, text="Не удалось создать ярлык", font=('Segoe UI', 10), bg='#f8fafc', fg='#ef4444').pack()
        
        btn_frame = Frame(self.root, bg='#f8fafc')
        btn_frame.pack(pady=10)
        
        if self.exe_path and os.path.exists(self.exe_path):
            Button(btn_frame, text="🚀 Запустить ONTEK", command=self.launch_and_close, font=('Segoe UI', 12, 'bold'), bg='#10b981', fg='white', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
        
        Button(btn_frame, text="Готово", command=self.root.destroy, font=('Segoe UI', 12, 'bold'), bg='#e2e8f0', bd=0, padx=20, pady=8, cursor='hand2').pack(side='left', padx=5)
    
    def launch_and_close(self):
        if self.exe_path and os.path.exists(self.exe_path):
            try:
                os.startfile(self.exe_path)
            except:
                subprocess.Popen([self.exe_path], shell=True)
        self.root.destroy()
    
    def run(self):
        self.root.mainloop()

if __name__ == '__main__':
    Installer().run()
