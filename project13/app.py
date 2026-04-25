from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["ticket_db"]
tickets = db["tickets"]
users = db["users6"]

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
    return jsonify({"message": "Login success"})


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


# TICKETS
@app.route('/tickets', methods=['GET'])
def get_tickets():
    data = []
    for t in tickets.find():
        t["_id"] = str(t["_id"])
        data.append(t)
    return jsonify(data)


@app.route('/add_ticket', methods=['POST'])
def add_ticket():
    tickets.insert_one(request.json)
    return jsonify({"message": "Ticket created"})


@app.route('/update_ticket/<id>', methods=['PUT'])
def update_ticket(id):
    tickets.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Updated"})


@app.route('/delete_ticket/<id>', methods=['DELETE'])
def delete_ticket(id):
    tickets.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5513)