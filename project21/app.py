from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["task_db"]
tasks = db["tasks"]
users = db["users"]

# AUTH
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
    session["user_name"] = user["name"]

    return jsonify({"message": "Login success", "name": user["name"]})


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


# TASKS
@app.route('/tasks', methods=['GET'])
def get_tasks():
    data = []
    for t in tasks.find():
        t["_id"] = str(t["_id"])
        data.append(t)
    return jsonify(data)


@app.route('/add_task', methods=['POST'])
def add_task():
    tasks.insert_one(request.json)
    return jsonify({"message": "Task added"})


@app.route('/update_task/<id>', methods=['PUT'])
def update_task(id):
    tasks.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Updated"})


@app.route('/delete_task/<id>', methods=['DELETE'])
def delete_task(id):
    tasks.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5521)