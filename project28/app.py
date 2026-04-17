from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["saas_db"]

subscriptions = db["subscriptions"]
users = db["users"]

# ================= AUTH =================
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "User exists"}), 400

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

    user = users.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid login"}), 401

    session["user"] = str(user["_id"])
    return jsonify({"message": "Login success"})


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@app.route('/check_session')
def check_session():
    return jsonify({"loggedIn": "user" in session})


# ================= SUBSCRIPTIONS =================
@app.route('/subscriptions', methods=['GET'])
def get_subscriptions():
    data = []
    for s in subscriptions.find():
        s["_id"] = str(s["_id"])
        data.append(s)
    return jsonify(data)


@app.route('/add_subscription', methods=['POST'])
def add_subscription():
    subscriptions.insert_one(request.json)
    return jsonify({"message": "Subscription added"})


@app.route('/update_subscription/<id>', methods=['PUT'])
def update_subscription(id):
    subscriptions.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Updated"})


@app.route('/delete_subscription/<id>', methods=['DELETE'])
def delete_subscription(id):
    subscriptions.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5528)