from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["freelancer_db"]

projects = db["projects"]
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


# ================= PROJECTS =================
@app.route('/projects', methods=['GET'])
def get_projects():
    data = []
    for p in projects.find():
        p["_id"] = str(p["_id"])
        data.append(p)
    return jsonify(data)


@app.route('/add_project', methods=['POST'])
def add_project():
    projects.insert_one(request.json)
    return jsonify({"message": "Project added"})


@app.route('/update_project/<id>', methods=['PUT'])
def update_project(id):
    projects.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Updated"})


@app.route('/delete_project/<id>', methods=['DELETE'])
def delete_project(id):
    projects.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5526)