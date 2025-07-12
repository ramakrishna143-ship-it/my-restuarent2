from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import os

app = Flask(__name__)
MENU_FILE = 'menu.json'
OWNER_PHONE = "9603282043"
OWNER_PASSWORD = "3528"


def load_menu():
    if os.path.exists(MENU_FILE):
        with open(MENU_FILE, 'r') as file:
            return json.load(file)
    return {"Veg": [], "Non-Veg": [], "Drinks": []}


def save_menu(data):
    with open(MENU_FILE, 'w') as file:
        json.dump(data, file, indent=2)


@app.route('/')
def index():
    menu = load_menu()
    table_no = request.args.get('table', 'Unknown')
    return render_template("index.html", menu=menu, table=table_no)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        phone = request.form.get("phone")
        password = request.form.get("password")
        if phone == OWNER_PHONE and password == OWNER_PASSWORD:
            return redirect(url_for('owner'))
        else:
            return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")


@app.route('/owner')
def owner():
    menu = load_menu()
    return render_template("owner.html", menu=menu)


@app.route('/add-item', methods=['POST'])
def add_item():
    data = request.json
    menu = load_menu()
    category = data['category']
    item = {
        "name": data['name'],
        "price": data['price'],
        "image": data['image']
    }
    menu[category].append(item)
    save_menu(menu)
    return jsonify({"status": "success"})


@app.route('/remove-item', methods=['POST'])
def remove_item():
    data = request.json
    category = data['category']
    name = data['name']
    menu = load_menu()
    menu[category] = [item for item in menu[category] if item['name'] != name]
    save_menu(menu)
    return jsonify({"status": "removed"})


@app.route('/get-menu')
def get_menu():
    return jsonify(load_menu())


if __name__ == '__main__':
    app.run(debug=True)
