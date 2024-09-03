import tkinter as tk
from tkinter import messagebox, ttk
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import random
import string
import csv
from tkinter import filedialog
'''
@file taChatbotWhiteList.py
Simple GUI Admin Application to manage user auth

@author Sanjit Verma (skverma)
'''
class UserWhitelistApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Virtual TA Admin Panel")
        self.root.geometry("1000x600")  

        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(1, weight=1)

        self.sidebar = tk.Frame(root, bg="#333", width=200)
        self.sidebar.grid(row=0, column=0, sticky="nsew")

        self.auth_users_button = tk.Button(self.sidebar, text="Authenticated Users", command=self.show_auth_users_view, bg="#444", fg="white", padx=10, pady=10)
        self.auth_users_button.pack(fill=tk.X)

        self.find_user_button = tk.Button(self.sidebar, text="Search User", command=self.show_find_user_view, bg="#444", fg="white", padx=10, pady=10)
        self.find_user_button.pack(fill=tk.X)

        self.access_codes_button = tk.Button(self.sidebar, text="Access Codes", command=self.show_access_codes_view, bg="#444", fg="white", padx=10, pady=10)
        self.access_codes_button.pack(fill=tk.X)

        self.main_frame = tk.Frame(root, bg="#f0f0f0")
        self.main_frame.grid(row=0, column=1, sticky="nsew")

        self.auth_users_view = None
        self.access_codes_view = None

        load_dotenv()
        MONGODB_URI = os.getenv('MONGODB_URI')
        MONGODB_WHITELIST_USERS = os.getenv('MONGODB_WHITELIST_USERS')
        MONGODB_ACCESS_CODES = os.getenv('MONGODB_ACCESSCODES')
        MONGODB_DB = os.getenv('MONGODB_DATABASE')

        self.client = MongoClient(MONGODB_URI)
        self.auth_users_collection = self.client[MONGODB_DB][MONGODB_WHITELIST_USERS]
        self.access_codes_collection = self.client[MONGODB_DB][MONGODB_ACCESS_CODES]

        self.show_auth_users_view()

    def clear_frame(self):
        """Clear the main frame before switching views."""
        for widget in self.main_frame.winfo_children():
            widget.destroy()

    def show_auth_users_view(self):
        """Show the authenticated users management view."""
        self.clear_frame()

        self.main_frame.grid_rowconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)
        self.main_frame.grid_columnconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(2, weight=1)  

        tk.Label(self.main_frame, text="Authenticated Users", font=("Helvetica", 16)).grid(row=0, column=0, padx=10, pady=10, columnspan=3, sticky="w")

        self.tree = ttk.Treeview(self.main_frame, columns=('First Name', 'Last Name', 'Email'), show='headings')
        self.tree.heading('First Name', text='First Name')
        self.tree.heading('Last Name', text='Last Name')
        self.tree.heading('Email', text='Email')

        self.vsb = ttk.Scrollbar(self.main_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=self.vsb.set)
        self.vsb.grid(row=1, column=3, sticky='ns')

        self.tree.grid(row=1, column=0, columnspan=3, padx=10, pady=10, sticky="nsew")

        self.add_entry_email = tk.Entry(self.main_frame)
        self.add_entry_email.grid(row=2, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.add_entry_email.insert(0, "Enter email")
        self.add_entry_email.bind("<FocusIn>", self.clear_placeholder)
        self.add_entry_email.bind("<FocusOut>", lambda e: self.restore_placeholder(self.add_entry_email, "Enter email"))

        self.add_entry_first_name = tk.Entry(self.main_frame)
        self.add_entry_first_name.grid(row=3, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.add_entry_first_name.insert(0, "Enter first name (optional)")
        self.add_entry_first_name.bind("<FocusIn>", self.clear_placeholder)
        self.add_entry_first_name.bind("<FocusOut>", lambda e: self.restore_placeholder(self.add_entry_first_name, "Enter first name (optional)"))

        self.add_entry_last_name = tk.Entry(self.main_frame)
        self.add_entry_last_name.grid(row=4, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.add_entry_last_name.insert(0, "Enter last name (optional)")
        self.add_entry_last_name.bind("<FocusIn>", self.clear_placeholder)
        self.add_entry_last_name.bind("<FocusOut>", lambda e: self.restore_placeholder(self.add_entry_last_name, "Enter last name (optional)"))

        self.add_button = tk.Button(self.main_frame, text="Add User", command=self.add_user)
        self.add_button.grid(row=5, column=0, padx=10, pady=5, sticky="ew")

        self.remove_button = tk.Button(self.main_frame, text="Remove Selected Users", command=self.remove_user)
        self.remove_button.grid(row=5, column=1, padx=10, pady=5, sticky="ew")

        self.upload_csv_button = tk.Button(self.main_frame, text="Upload CSV", command=self.upload_csv)
        self.upload_csv_button.grid(row=5, column=2, padx=10, pady=5, sticky="ew")

        self.load_users_from_db()


    def show_access_codes_view(self):
        """Show the access codes management view."""
        self.clear_frame()

        self.main_frame.grid_rowconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)
        self.main_frame.grid_columnconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(2, weight=1)

        tk.Label(self.main_frame, text="Access Codes", font=("Helvetica", 16)).grid(row=0, column=0, padx=10, pady=10, columnspan=3, sticky="w")

        self.access_tree = ttk.Treeview(self.main_frame, columns=('First Name', 'Last Name', 'Access Code', 'Used'), show='headings')
        self.access_tree.heading('First Name', text='First Name')
        self.access_tree.heading('Last Name', text='Last Name')
        self.access_tree.heading('Access Code', text='Access Code')
        self.access_tree.heading('Used', text='Used')

        self.vsb_access = ttk.Scrollbar(self.main_frame, orient="vertical", command=self.access_tree.yview)
        self.access_tree.configure(yscrollcommand=self.vsb_access.set)
        self.vsb_access.grid(row=1, column=3, sticky='ns')

        self.access_tree.grid(row=1, column=0, columnspan=3, padx=10, pady=10, sticky="nsew")

        self.access_entry_first_name = tk.Entry(self.main_frame)
        self.access_entry_first_name.grid(row=2, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.access_entry_first_name.insert(0, "Enter first name (required)")
        self.access_entry_first_name.bind("<FocusIn>", self.clear_placeholder)
        self.access_entry_first_name.bind("<FocusOut>", lambda e: self.restore_placeholder(self.access_entry_first_name, "Enter first name (required)"))

        self.access_entry_last_name = tk.Entry(self.main_frame)
        self.access_entry_last_name.grid(row=3, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.access_entry_last_name.insert(0, "Enter last name (required)")
        self.access_entry_last_name.bind("<FocusIn>", self.clear_placeholder)
        self.access_entry_last_name.bind("<FocusOut>", lambda e: self.restore_placeholder(self.access_entry_last_name, "Enter last name (required)"))

        self.generate_code_button = tk.Button(self.main_frame, text="Generate Access Code", command=self.generate_access_code)
        self.generate_code_button.grid(row=4, column=0, padx=10, pady=5, sticky="ew")

        self.revoke_code_button = tk.Button(self.main_frame, text="Revoke Access Code", command=self.revoke_access_code)
        self.revoke_code_button.grid(row=4, column=2, padx=10, pady=5, sticky="ew")

        self.load_access_codes_from_db()

    def show_find_user_view(self):
        """Show the Find User view."""
        self.clear_frame()

        self.main_frame.grid_rowconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)
        self.main_frame.grid_columnconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(2, weight=1)

        tk.Label(self.main_frame, text="Search User", font=("Helvetica", 16)).grid(row=0, column=0, padx=10, pady=10, columnspan=3, sticky="w")

        self.search_results = ttk.Treeview(self.main_frame, columns=('First Name', 'Last Name', 'Email'), show='headings')
        self.search_results.heading('First Name', text='First Name')
        self.search_results.heading('Last Name', text='Last Name')
        self.search_results.heading('Email', text='Email')

        self.vsb_search = ttk.Scrollbar(self.main_frame, orient="vertical", command=self.search_results.yview)
        self.search_results.configure(yscrollcommand=self.vsb_search.set)
        self.vsb_search.grid(row=1, column=3, sticky='ns')

        self.search_results.grid(row=1, column=0, columnspan=3, padx=10, pady=10, sticky="nsew")

        self.search_first_name = tk.Entry(self.main_frame)
        self.search_first_name.grid(row=2, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.search_first_name.insert(0, "Enter first name (optional)")
        self.search_first_name.bind("<FocusIn>", self.clear_placeholder)
        self.search_first_name.bind("<FocusOut>", lambda e: self.restore_placeholder(self.search_first_name, "Enter first name (optional)"))

        self.search_last_name = tk.Entry(self.main_frame)
        self.search_last_name.grid(row=3, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.search_last_name.insert(0, "Enter last name (optional)")
        self.search_last_name.bind("<FocusIn>", self.clear_placeholder)
        self.search_last_name.bind("<FocusOut>", lambda e: self.restore_placeholder(self.search_last_name, "Enter last name (optional)"))

        self.search_email = tk.Entry(self.main_frame)
        self.search_email.grid(row=4, column=0, columnspan=3, padx=10, pady=5, sticky="ew")
        self.search_email.insert(0, "Enter email (optional)")
        self.search_email.bind("<FocusIn>", self.clear_placeholder)
        self.search_email.bind("<FocusOut>", lambda e: self.restore_placeholder(self.search_email, "Enter email (optional)"))

        self.search_button = tk.Button(self.main_frame, text="Search", command=self.search_user)
        self.search_button.grid(row=5, column=0, columnspan=3, padx=10, pady=5, sticky="ew")

    def search_user(self):
        """Search for users based on the input fields."""
        first_name = self.search_first_name.get().strip()
        last_name = self.search_last_name.get().strip()
        email = self.search_email.get().strip()
        query = {}
        if first_name and first_name != "Enter first name (optional)":
            query["first_name"] = {"$regex": f"^{first_name}", "$options": "i"}
        if last_name and last_name != "Enter last name (optional)":
            query["last_name"] = {"$regex": f"^{last_name}", "$options": "i"}
        if email and email != "Enter email (optional)":
            query["email"] = {"$regex": f"^{email}", "$options": "i"}

        results = self.auth_users_collection.find(query)
        for item in self.search_results.get_children():
            self.search_results.delete(item)
        for user in results:
            self.search_results.insert('', 'end', values=(
                user.get('first_name', ''),
                user.get('last_name', ''),
                user['email']
            ))

    def clear_placeholder(self, event):
        widget = event.widget
        if widget.get() in ["Enter email", "Enter first name (optional)", "Enter last name (optional)", "Enter first name (required)", "Enter last name (required)"]:
            widget.delete(0, tk.END)
        elif widget == self.search_email:
            if widget.get() == "Enter email (optional)":
                widget.delete(0, tk.END)

    def restore_placeholder(self, entry, placeholder):
        if not entry.get():
            entry.insert(0, placeholder)

    def load_users_from_db(self):
        """Load users from the database into the local list and update the UI."""
        self.users = list(self.auth_users_collection.find())
        self.update_user_list()

    def load_access_codes_from_db(self):
        """Load access codes from the database and update the UI."""
        self.access_codes = list(self.access_codes_collection.find())
        self.update_access_code_list()

    def upload_csv(self):
        """Handle uploading a CSV file and parsing it into the authenticated users list."""
        messagebox.showinfo("CSV Format Information", "The CSV file must be organized in the following order: First Name, Last Name, Email.")
        file_path = filedialog.askopenfilename(title="Select CSV File", filetypes=[("CSV files", "*.csv")])
        if not file_path:
            return
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                if not reader.fieldnames or "First Name" not in reader.fieldnames or "Last Name" not in reader.fieldnames or "Email" not in reader.fieldnames:
                    messagebox.showerror("Error", "CSV file format is incorrect. Please ensure it has 'First Name', 'Last Name', and 'Email' columns.")
                    return
                
                for row in reader:
                    first_name = row.get('First Name', '').strip()
                    last_name = row.get('Last Name', '').strip()
                    email = row.get('Email', '').strip()

                    print(f"Processing row: {first_name} {last_name} {email}") 

                    if email and not any(user['email'] == email for user in self.users):
                        user_doc = {
                            "email": email,
                            "first_name": first_name or None,
                            "last_name": last_name or None
                        }

                        print(f"Inserting user: {user_doc}")  

                        try:
                            result = self.auth_users_collection.insert_one(user_doc)
                            if result.acknowledged:
                                self.users.append(user_doc)
                            else:
                                print(f"Failed to insert user: {user_doc}")  
                        except Exception as e:
                            print(f"Exception occurred while inserting user: {e}")  

                self.update_user_list()
                messagebox.showinfo("Success", "CSV file has been successfully uploaded and users added.")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to upload CSV file: {e}")
            print(f"Exception occurred during CSV upload: {e}")  


    def add_user(self):
        email = self.add_entry_email.get().strip()
        first_name = self.add_entry_first_name.get().strip()
        last_name = self.add_entry_last_name.get().strip()

        first_name = first_name if first_name != "Enter first name (optional)" else ""
        last_name = last_name if last_name != "Enter last name (optional)" else ""

        if email and email != "Enter email":
            if not any(user['email'] == email for user in self.users):
                try:
                    user_doc = {
                        "email": email,
                        "first_name": first_name or None,
                        "last_name": last_name or None
                    }

                    user_doc = {k: v for k, v in user_doc.items() if v}
                    self.auth_users_collection.insert_one(user_doc)
                    self.users.append(user_doc)
                    self.reset_entry_fields()
                    self.update_user_list()
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to add user to database: {e}")
            else:
                messagebox.showwarning("Warning", "User already in the list.")
        else:
            messagebox.showwarning("Warning", "Please enter a valid email.")

    def generate_access_code(self):
        first_name = self.access_entry_first_name.get().strip()
        last_name = self.access_entry_last_name.get().strip()

        first_name = first_name if first_name != "Enter first name (required)" else ""
        last_name = last_name if last_name != "Enter last name (required)" else ""

        if not all([first_name, last_name]):
            messagebox.showwarning("Warning", "All fields are required to generate an access code.")
            return

        access_code = self._generate_random_code()
        try:
            access_code_doc = {
                "first_name": first_name,
                "last_name": last_name,
                "access_code": access_code,
                "used": False  
            }
            self.access_codes_collection.insert_one(access_code_doc)
            self.access_codes.append(access_code_doc)
            self.update_access_code_list()
            messagebox.showinfo("Access Code Generated", f"Access code for {first_name} {last_name} is {access_code}")

            self.clear_access_code_fields()

        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate access code: {e}")

    def clear_access_code_fields(self):
        """Clear all input fields in the access code section."""
        self.access_entry_first_name.delete(0, tk.END)
        self.access_entry_first_name.insert(0, "Enter first name (required)")

        self.access_entry_last_name.delete(0, tk.END)
        self.access_entry_last_name.insert(0, "Enter last name (required)")

    def revoke_access_code(self):
        selected_items = self.access_tree.selection()
        if selected_items:
            codes_to_revoke = [self.access_tree.item(item, "values")[2] for item in selected_items]
            try:
                result = self.access_codes_collection.delete_many({"access_code": {"$in": codes_to_revoke}})
                if result.deleted_count > 0:
                    self.access_codes = [code for code in self.access_codes if code['access_code'] not in codes_to_revoke]
                    self.update_access_code_list()
                    messagebox.showinfo("Access Code Revoked", f"Access code(s) {', '.join(codes_to_revoke)} have been revoked.")
                else:
                    messagebox.showwarning("Warning", "No access codes found for the selected codes.")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to revoke access code(s): {e}")
        else:
            messagebox.showwarning("Warning", "Please select at least one access code to revoke.")

    def _generate_random_code(self):
        """Generate a random 7-character alphanumeric code."""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=7))

    def reset_entry_fields(self):
        """Reset entry fields to their placeholder text."""
        self.add_entry_email.delete(0, tk.END)
        self.add_entry_email.insert(0, "Enter email")

        self.add_entry_first_name.delete(0, tk.END)
        self.add_entry_first_name.insert(0, "Enter first name (optional)")

        self.add_entry_last_name.delete(0, tk.END)
        self.add_entry_last_name.insert(0, "Enter last name (optional)")

    def remove_user(self):
        selected_items = self.tree.selection()
        if selected_items:
            emails_to_remove = [self.tree.item(item, "values")[2] for item in selected_items]
            try:
                self.auth_users_collection.delete_many({"email": {"$in": emails_to_remove}})
                self.users = [user for user in self.users if user['email'] not in emails_to_remove]
                self.update_user_list()
            except Exception as e:
                messagebox.showerror("Error", f"Failed to remove user(s) from database: {e}")
        else:
            messagebox.showwarning("Warning", "Please select at least one user to remove.")

    def update_user_list(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
        for user in self.users:
            self.tree.insert('', 'end', values=(
                user.get('first_name', ''),
                user.get('last_name', ''),
                user['email']
            ))

    def update_access_code_list(self):
        for item in self.access_tree.get_children():
            self.access_tree.delete(item)
        for code in self.access_codes:
            self.access_tree.insert('', 'end', values=(
                code.get('first_name', ''),
                code.get('last_name', ''),
                code.get('access_code', ''),
                "Yes" if code.get('used', False) else "No" 
            ))

if __name__ == "__main__":
    root = tk.Tk()
    app = UserWhitelistApp(root)
    root.mainloop()
