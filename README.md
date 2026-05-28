# ONTEK — Таблица заказов

![Version](https://img.shields.io/badge/version-3.7.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-green)

Приложение для создания и редактирования таблиц заказов с экспортом в Excel.

## Возможности

- 📊 Создание нескольких таблиц с разными валютами (RUB/USD)
- 💾 Сохранение в Excel с формулами и форматированием
- 🌙 Тёмная тема
- 🔍 Поиск и замена (Ctrl+F / Ctrl+H)
- ⌨ Горячие клавиши для быстрой навигации
- 📋 Вставка данных из буфера обмена
- 🖱 Контекстное меню (ПКМ)
- 🔄 Автоматическая проверка обновлений

## Скачать

Скачайте последнюю версию в [Releases](https://github.com/Dangergrow/Speka-ontek/releases/latest)

## Горячие клавиши

| Клавиши | Действие |
|---------|----------|
| `Shift+A` | Добавить строку |
| `Shift+D` | Удалить строку |
| `Shift+C` | Добавить колонку |
| `Shift+X` | Удалить колонку |
| `Shift+1` | Новая таблица RUB |
| `Shift+2` | Новая таблица USD |
| `Shift+V` | Вставить из буфера |
| `Ctrl+F` | Поиск |
| `Ctrl+H` | Замена |
| `Ctrl+T` | Тёмная тема |
| `Ctrl+Z` | Отмена |
| `Ctrl+S` | Сохранить |
| `Tab` | Следующая ячейка |
| `Enter` | Ячейка вниз |

## Разработка

```bash
pip install pywebview pyinstaller pystray Pillow
python run.py

Сборка EXE:

bash
pyinstaller --onefile --windowed --add-data "index.html;." --add-data "exceljs.min.js;." --add-data "xlsx.full.min.js;." --name "ONTEK_Orders" --hidden-import=webview --hidden-import=tkinter run.py
text

---

## 🎉 Готово! Теперь у вас есть:

1. ✅ Рабочая программа EXE
2. ✅ Страница на GitHub с описанием
3. ✅ Release с EXE-файлом для скачивания
4. ✅ Автообновление (при новой версии в `version.json`)

Когда захотите выпустить обновление:
1. Увеличьте версию в `version.json` (например `3.8.0`)
2. Соберите новый EXE
3. Создайте новый Release на GitHub
4. Пользователи увидят уведомление об обновлении
