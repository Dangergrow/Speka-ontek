import os, sys, shutil, json, threading, tempfile, subprocess
from tkinter import Tk, Frame, Label, Entry, Button, Checkbutton, BooleanVar, StringVar, Canvas, messagebox, filedialog
from tkinter.ttk import Progressbar, Style

APP_NAME = "ONTEK — Таблица заказов"
APP_VERSION = "7.2.0"
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
    """Создать ярлык через Python"""
    try:
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        shortcut_path = os.path.join(desktop, f"{SHORTCUT_NAME}.lnk")
        exe_path = os.path.join(target_dir, 'ONTEK_Orders.exe')
        icon_path = os.path.join(target_dir, 'icon.ico')
        
        if not os.path.exists(exe_path):
            return False
        
        if os.path.exists(shortcut_path):
            try: os.remove(shortcut_path)
            except: pass
        
        # Способ 1: win32com
        try:
            import pythoncom
            from win32com.client import Dispatch
            pythoncom.CoInitialize()
            shell = Dispatch('WScript.Shell')
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.Targetpath = exe_path
            shortcut.WorkingDirectory = target_dir
            shortcut.IconLocation = icon_path if os.path.exists(icon_path) else exe_path + ",0"
            shortcut.Save()
            pythoncom.CoUninitialize()
            return os.path.exists(shortcut_path)
        except:
            pass
        
        # Способ 2: PowerShell с двойными кавычками
        try:
            ps = f'''$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("{shortcut_path}")
$Shortcut.TargetPath = "{exe_path}"
$Shortcut.WorkingDirectory = "{target_dir}"
$Shortcut.IconLocation = "{icon_path}"
$Shortcut.Save()
Write-Host "OK"'''
            ps_file = os.path.join(tempfile.gettempdir(), 'mk_shortcut.ps1')
            with open(ps_file, 'w', encoding='utf-8') as f:
                f.write(ps)
            result = subprocess.run(['powershell', '-ExecutionPolicy', 'Bypass', '-File', ps_file], capture_output=True, text=True, shell=True, timeout=10)
            try: os.remove(ps_file)
            except: pass
            return os.path.exists(shortcut_path)
        except:
            return False
            
    except Exception as e:
        print(f"Ошибка ярлыка: {e}")
        return False

def write_config(target_dir):
    config = {'version': APP_VERSION, 'install_path': target_dir}
    with open(os.path.join(target_dir, 'config.json'), 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)

class Installer:
    def __init__(self):
        self.root = Tk()
        self.root.title(f"Установка {APP_NAME}")
        self.root.geometry("640x650")
        self.root.resizable(False, False)
        self.root.configure(bg='#f0f2f5')
        try:
            self.root.iconbitmap(os.path.join(get_source_dir(), 'icon.ico'))
        except Exception:
            pass
        self.root.update_idletasks()
        w=640;h=650
        x=(self.root.winfo_screenwidth()//2)-(w//2)
        y=(self.root.winfo_screenheight()//2)-(h//2)
        self.root.geometry(f'{w}x{h}+{x}+{y}')
        self.install_path = StringVar(value=DEFAULT_PATH)
        self.create_desktop = BooleanVar(value=True)
        self.exe_path = None
        self.install_done_flag = False
        self.setup_ui()
    
    def setup_ui(self):
        # Presentation only. The installation workflow and callbacks are unchanged.
        header = Frame(self.root, bg='#17212b', height=152)
        header.pack(fill='x')
        header.pack_propagate(False)
        brand = Frame(header, bg='#17212b')
        brand.pack(anchor='w', padx=32, pady=(28, 0))
        mark = Canvas(brand, width=48, height=48, bg='#17212b', highlightthickness=0)
        mark.pack(side='left', padx=(0, 15))
        mark.create_rectangle(2, 2, 46, 46, fill='#2864d6', outline='')
        mark.create_polygon(17,10,31,10,39,18,39,32,31,40,17,40,9,32,9,18, fill='#ffffff', outline='')
        mark.create_polygon(20,18,28,18,31,21,31,29,28,32,20,32,17,29,17,21, fill='#2864d6', outline='')
        mark.create_rectangle(32, 8, 42, 18, fill='#82edce', outline='')
        title = Frame(brand, bg='#17212b')
        title.pack(side='left')
        Label(title, text='ONTEK', font=('Segoe UI', 24, 'bold'), fg='#ffffff', bg='#17212b', anchor='w').pack(anchor='w')
        Label(title, text='СПЕЦИФИКАЦИИ И ЗАКАЗЫ', font=('Segoe UI', 9), fg='#a9bacb', bg='#17212b').pack(anchor='w')
        Label(header, text=f'УСТАНОВКА ПРИЛОЖЕНИЯ    /    {APP_VERSION}', font=('Segoe UI', 9), fg='#a9bacb', bg='#17212b').pack(anchor='w', padx=32, pady=(18, 0))
        Frame(self.root, height=3, bg='#2864d6').pack(fill='x')

        self.main_frame = Frame(self.root, bg='#f0f2f5')
        self.main_frame.pack(fill='both', expand=True)
        body = self.setup_body = Frame(self.main_frame, bg='#f0f2f5', padx=32, pady=22)
        body.pack(fill='x')
        Label(body, text='Ваше рабочее пространство', font=('Segoe UI', 20, 'bold'), fg='#202d3a', bg='#f0f2f5', anchor='w').pack(fill='x')
        Label(body, text='Выберите папку и установите ONTEK на этот компьютер.', font=('Segoe UI', 10), fg='#5e6c7b', bg='#f0f2f5', anchor='w').pack(fill='x', pady=(5, 20))
        Label(body, text='Папка установки', font=('Segoe UI', 11, 'bold'), fg='#202d3a', bg='#f0f2f5', anchor='w').pack(fill='x')
        pf = Frame(body, bg='#f0f2f5')
        pf.pack(fill='x', pady=(9, 8))
        Button(pf, text='Обзор', command=self.browse, font=('Segoe UI', 10), bg='#e0e5eb', fg='#202d3a', activebackground='#d2dce8', relief='flat', bd=0, padx=18, pady=8, cursor='hand2').pack(side='right', padx=(10, 0))
        Entry(pf, textvariable=self.install_path, font=('Segoe UI', 10), bg='#ffffff', fg='#202d3a', insertbackground='#202d3a', bd=0, relief='flat', highlightthickness=1, highlightbackground='#c6d0db', highlightcolor='#2864d6').pack(side='left', fill='x', expand=True, ipady=9)
        Checkbutton(body, text='Создать ярлык на рабочем столе', variable=self.create_desktop, font=('Segoe UI', 11), bg='#f0f2f5', fg='#202d3a', selectcolor='#ffffff', activebackground='#f0f2f5', cursor='hand2').pack(anchor='w', pady=(12, 16))
        style = Style(self.root)
        style.theme_use('clam')
        style.configure('Ontek.Horizontal.TProgressbar', troughcolor='#e0e5eb', background='#2864d6', bordercolor='#e0e5eb', lightcolor='#2864d6', darkcolor='#2864d6', thickness=5)
        self.progress = Progressbar(body, mode='determinate', style='Ontek.Horizontal.TProgressbar')
        self.status_label = Label(body, text='', font=('Segoe UI', 10), bg='#f0f2f5', fg='#5e6c7b')
        self.install_btn = Button(body, text='Установить ONTEK', command=self.start_install, font=('Segoe UI', 12, 'bold'), bg='#2864d6', fg='white', activebackground='#2054b5', activeforeground='white', bd=0, padx=30, pady=12, cursor='hand2')
        self.install_btn.pack(anchor='e', pady=(3, 0))
        self.result_frame = Frame(self.main_frame, bg='#f0f2f5')
        self.launch_btn = None
        self.done_btn = None

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
                
                write_config(target)
                
                self.root.after(0, lambda: self.show_done(shortcut_ok))
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("Ошибка", str(e)))
        
        threading.Thread(target=install_thread, daemon=True).start()
    
    def update_progress(self, value):
        self.progress['value'] = value
    
    def show_done(self, shortcut_ok=False):
        self.progress.pack_forget()
        self.status_label.pack_forget()
        
        self.setup_body.pack_forget()
        self.result_frame.pack(pady=(48, 24), padx=24, fill='x')
        
        # Очищаем
        for w in self.result_frame.winfo_children():
            w.destroy()
        
        Label(self.result_frame, text="Установка завершена", font=('Segoe UI', 18, 'bold'), bg='#f0f2f5', fg='#168464').pack(pady=5)
        Label(self.result_frame, text=f"Папка:\n{self.install_path.get()}", font=('Segoe UI', 11), bg='#f0f2f5', fg='#5e6c7b', justify='center', wraplength=550).pack(pady=5)
        
        if shortcut_ok:
            Label(self.result_frame, text="Ярлык создан на рабочем столе", font=('Segoe UI', 11), bg='#f0f2f5', fg='#168464').pack()
        else:
            Label(self.result_frame, text="Ярлык не создан", font=('Segoe UI', 11), bg='#f0f2f5', fg='#aa691d').pack()
        
        btn_frame = Frame(self.result_frame, bg='#f0f2f5')
        btn_frame.pack(pady=15)
        
        if self.exe_path and os.path.exists(self.exe_path):
            Button(btn_frame, text="Запустить ONTEK", command=self.launch_and_close, font=('Segoe UI', 13, 'bold'), bg='#168464', fg='white', bd=0, padx=30, pady=12, cursor='hand2').pack(side='left', padx=8)
        
        Button(btn_frame, text="Готово", command=self.root.destroy, font=('Segoe UI', 13, 'bold'), bg='#4e6177', fg='white', bd=0, padx=30, pady=12, cursor='hand2').pack(side='left', padx=8)
    
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
