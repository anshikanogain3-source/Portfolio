from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["restaurant_db"]

orders = db["orders"]
menu = db["menu"]
users = db["users"]

# ================= AUTH =================
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    if users.find_one({"email": data["email"]}):
        return jsonify({"error": "User exists"}), 400

    users.insert_one({
        "name": data["name"],
        "email": data["email"],
        "password": generate_password_hash(data["password"])
    })

    return jsonify({"message": "Signup success"})


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = users.find_one({"email": data["email"]})

    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Invalid login"}), 401

    session["user"] = str(user["_id"])
    return jsonify({"message": "Login success"})


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


# ================= MENU =================
@app.route('/menu', methods=['GET'])
def get_menu():
    data = []
    for item in menu.find():
        item["_id"] = str(item["_id"])
        data.append(item)
    return jsonify(data)


@app.route('/add_menu', methods=['POST'])
def add_menu():
    menu.insert_one(request.json)
    return jsonify({"message": "Menu added"})


# ================= ORDERS =================
@app.route('/orders', methods=['GET'])
def get_orders():
    data = []
    for o in orders.find():
        o["_id"] = str(o["_id"])
        data.append(o)
    return jsonify(data)


@app.route('/add_order', methods=['POST'])
def add_order():
    orders.insert_one(request.json)
    return jsonify({"message": "Order created"})


@app.route('/update_order/<id>', methods=['PUT'])
def update_order(id):
    orders.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Order updated"})


@app.route('/delete_order/<id>', methods=['DELETE'])
def delete_order(id):
    orders.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5524)