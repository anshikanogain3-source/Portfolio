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
db = client["employee_db"]
employees = db["employees"]
users = db["users3"]

# -------- AUTH --------
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


# -------- EMPLOYEES --------
@app.route('/employees', methods=['GET'])
def get_employees():
    data = []
    for e in employees.find():
        e["_id"] = str(e["_id"])
        data.append(e)
    return jsonify(data)


@app.route('/add_employee', methods=['POST'])
def add_employee():
    employees.insert_one(request.json)
    return jsonify({"message": "Employee added"})


@app.route('/update_employee/<id>', methods=['PUT'])
def update_employee(id):
    employees.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Updated"})


@app.route('/delete_employee/<id>', methods=['DELETE'])
def delete_employee(id):
    employees.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True,port=5504)