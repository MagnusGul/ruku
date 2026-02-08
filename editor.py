import json
import tkinter as tk
from tkinter import ttk, messagebox, filedialog


class SidebarEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("JSON Sidebar Editor")

        self.file_path = "sidebarItems.json"
        self.data = []
        self.current_index = None

        self.setup_ui()
        self.load_data()

    def setup_ui(self):
        # Главный контейнер (PanedWindow для изменения размеров сторон)
        self.paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        self.paned.pack(fill=tk.BOTH, expand=True)

        # --- ЛЕВАЯ ПАНЕЛЬ: Список элементов ---
        left_frame = ttk.Frame(self.paned)
        self.paned.add(left_frame, weight=1)

        self.listbox = tk.Listbox(left_frame, font=("Segoe UI", 10))
        self.listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.listbox.bind("<<ListboxSelect>>", self.on_select)

        scrollbar = ttk.Scrollbar(left_frame, orient=tk.VERTICAL, command=self.listbox.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.listbox.config(yscrollcommand=scrollbar.set)

        btn_frame = ttk.Frame(left_frame)
        btn_frame.pack(fill=tk.X)
        ttk.Button(btn_frame, text="Добавить", command=self.add_item).pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(btn_frame, text="Удалить", command=self.delete_item).pack(side=tk.LEFT, fill=tk.X, expand=True)

        # --- ПРАВАЯ ПАНЕЛЬ: Редактирование ---
        self.edit_frame = ttk.Frame(self.paned)
        self.paned.add(self.edit_frame, weight=3)

        # Общие поля
        self.fields_container = ttk.LabelFrame(self.edit_frame, text="Основные свойства")
        self.fields_container.pack(fill=tk.X, padx=10, pady=5)

        self.entries = {}
        self.field_names = ["type", "number", "name", "id", "title", "chapter", "from", "to", "juz", "tags",
                            "boldSeparators"]

        for i, field in enumerate(self.field_names):
            ttk.Label(self.fields_container, text=field).grid(row=i // 2, column=(i % 2) * 2, sticky=tk.W, padx=5,
                                                              pady=2)
            ent = ttk.Entry(self.fields_container)
            ent.grid(row=i // 2, column=(i % 2) * 2 + 1, sticky=tk.EW, padx=5, pady=2)
            self.entries[field] = ent

        # --- БЛОК DESCRIPTION ---
        desc_label_frame = ttk.LabelFrame(self.edit_frame, text="Description (блоки)")
        desc_label_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        self.desc_canvas = tk.Canvas(desc_label_frame)
        self.desc_scroll = ttk.Scrollbar(desc_label_frame, orient=tk.VERTICAL, command=self.desc_canvas.yview)
        self.desc_inner_frame = ttk.Frame(self.desc_canvas)

        self.desc_canvas.create_window((0, 0), window=self.desc_inner_frame, anchor="nw")
        self.desc_canvas.configure(yscrollcommand=self.desc_scroll.set)

        self.desc_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.desc_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        self.desc_inner_frame.bind("<Configure>",
                                   lambda e: self.desc_canvas.configure(scrollregion=self.desc_canvas.bbox("all")))

        ttk.Button(self.edit_frame, text="Добавить блок описания", command=self.add_desc_row).pack(pady=5)
        ttk.Button(self.edit_frame, text="СОХРАНИТЬ ИЗМЕНЕНИЯ", command=self.save_changes).pack(fill=tk.X, padx=10,
                                                                                                pady=10)

        # Меню
        menubar = tk.Menu(self.root)
        filemenu = tk.Menu(menubar, tearoff=0)
        filemenu.add_command(label="Открыть", command=self.load_data)
        filemenu.add_command(label="Сохранить файл", command=self.save_to_file)
        menubar.add_cascade(label="Файл", menu=filemenu)
        self.root.config(menu=menubar)

        self.desc_rows = []

    def load_data(self):
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                content = json.load(f)
                self.data = content.get("sidebarItems", [])
            self.refresh_listbox()
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось загрузить файл: {e}")

    def refresh_listbox(self):
        self.listbox.delete(0, tk.END)
        for item in self.data:
            t = item.get("type", "???")
            n = item.get("number", "")
            title = item.get("title", item.get("name", ""))
            self.listbox.insert(tk.END, f"[{t}] {n} {title}")

    def on_select(self, event):
        selection = self.listbox.curselection()
        if not selection:
            return

        self.current_index = selection[0]
        item = self.data[self.current_index]

        # Заполняем основные поля
        for field in self.field_names:
            self.entries[field].delete(0, tk.END)
            val = item.get(field, "")
            if isinstance(val, list):
                val = ", ".join(map(str, val))
            self.entries[field].insert(0, str(val))

        # Заполняем блоки описания
        for row in self.desc_rows:
            row['frame'].destroy()
        self.desc_rows.clear()

        descriptions = item.get("description", [])
        for desc in descriptions:
            self.add_desc_row(desc.get("text", ""), desc.get("ref", ""))

    def add_desc_row(self, text="", ref=""):
        row_frame = ttk.Frame(self.desc_inner_frame)
        row_frame.pack(fill=tk.X, pady=2)

        tk.Label(row_frame, text="Текст:").pack(side=tk.LEFT)
        t_ent = ttk.Entry(row_frame, width=40)
        t_ent.insert(0, text)
        t_ent.pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)

        tk.Label(row_frame, text="Ref:").pack(side=tk.LEFT)
        r_ent = ttk.Entry(row_frame, width=15)
        r_ent.insert(0, ref)
        r_ent.pack(side=tk.LEFT, padx=5)

        del_btn = ttk.Button(row_frame, text="X", width=3, command=lambda rf=row_frame: self.remove_desc_row(rf))
        del_btn.pack(side=tk.LEFT)

        self.desc_rows.append({'frame': row_frame, 'text': t_ent, 'ref': r_ent})

    def remove_desc_row(self, frame):
        for i, row in enumerate(self.desc_rows):
            if row['frame'] == frame:
                row['frame'].destroy()
                self.desc_rows.pop(i)
                break

    def save_changes(self):
        if self.current_index is None:
            return

        item = self.data[self.current_index]

        # Сохраняем основные поля
        for field in self.field_names:
            val = self.entries[field].get().strip()
            if not val:
                if field in item: del item[field]
                continue

            # Преобразование типов
            if field in ["number", "id", "chapter", "from", "to", "juz"]:
                try:
                    item[field] = int(val)
                except:
                    item[field] = val
            elif field in ["tags", "boldSeparators"]:
                item[field] = []
                item[field] = [x.strip() for x in val.split(",") if x.strip()]
                if field == "boldSeparators":
                    item[field] = [int(x) for x in item[field] if x.isdigit()]
            else:
                item[field] = val

        # Сохраняем description
        new_desc = []
        for row in self.desc_rows:
            new_desc.append({
                "text": row['text'].get(),
                "ref": row['ref'].get()
            })
        if new_desc:
            item["description"] = new_desc
        elif "description" in item:
            del item["description"]

        self.refresh_listbox()
        messagebox.showinfo("Готово", "Изменения применены к элементу в списке")

    def add_item(self):
        new_item = {"type": "ruku", "title": "Новый раздел", "description": []}
        self.data.append(new_item)
        self.refresh_listbox()
        self.listbox.selection_clear(0, tk.END)
        self.listbox.selection_set(tk.END)
        self.on_select(None)

    def delete_item(self):
        selection = self.listbox.curselection()
        if not selection: return
        if messagebox.askyesno("Удаление", "Удалить этот элемент?"):
            self.data.pop(selection[0])
            self.refresh_listbox()

    def save_to_file(self):
        path = filedialog.asksaveasfilename(defaultextension=".json", initialfile=self.file_path)
        if path:
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"sidebarItems": self.data}, f, ensure_ascii=False, indent=4)
            messagebox.showinfo("Успех", "Файл сохранен!")


if __name__ == "__main__":
    root = tk.Tk()
    app = SidebarEditor(root)
    root.mainloop()