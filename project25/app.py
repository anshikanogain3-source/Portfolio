from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["realestate_db"]

properties = db["properties"]
users = db["users"]

# ================= AUTH =================
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    print("Received:", data)  # 🔥 DEBUG

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    users.insert_one({
        "name": name,
        "email": email,
        "password": generate_password_hash(password)
    })

    return jsonify({"message": "Signup success"})


@app.route('/login', methods=['POST'])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email & Password required"}), 400

    user = users.find_one({"email": email})

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Wrong password"}), 401

    session["user"] = str(user["_id"])
    return jsonify({"message": "Login success"})


# ================= PROPERTIES =================
@app.route('/properties', methods=['GET'])
def get_properties():
    data = []
    for p in properties.find():
        p["_id"] = str(p["_id"])
        data.append(p)
    return jsonify(data)


@app.route('/add_property', methods=['POST'])
def add_property():
    properties.insert_one(request.json)
    return jsonify({"message": "Property added"})


@app.route('/update_property/<id>', methods=['PUT'])
def update_property(id):
    properties.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Updated"})


@app.route('/delete_property/<id>', methods=['DELETE'])
def delete_property(id):
    properties.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5525)