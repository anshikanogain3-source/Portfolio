from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

# MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["student_db"]
students = db["students"]
users = db["users"]

# ---------------- AUTH ----------------
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


# ---------------- STUDENTS ----------------
@app.route('/students', methods=['GET'])
def get_students():
    result = []
    for s in students.find():
        s["_id"] = str(s["_id"])
        result.append(s)
    return jsonify(result)


@app.route('/add_student', methods=['POST'])
def add_student():
    data = request.json

    students.insert_one(data)
    return jsonify({"message": "Added"})


@app.route('/delete_student/<id>', methods=['DELETE'])
def delete_student(id):
    students.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


@app.route('/update_student/<id>', methods=['PUT'])
def update_student(id):
    data = request.json

    students.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )
    return jsonify({"message": "Updated"})


if __name__ == "__main__":
    app.run(debug=True, port=5550)