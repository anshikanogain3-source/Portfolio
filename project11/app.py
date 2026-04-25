from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["blog_db"]
blogs = db["blogs"]
users = db["users4"]

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


# BLOGS
@app.route('/blogs', methods=['GET'])
def get_blogs():
    data = []
    for b in blogs.find():
        b["_id"] = str(b["_id"])
        data.append(b)
    return jsonify(data)


@app.route('/add_blog', methods=['POST'])
def add_blog():
    blogs.insert_one(request.json)
    return jsonify({"message": "Blog added"})


@app.route('/update_blog/<id>', methods=['PUT'])
def update_blog(id):
    blogs.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Updated"})


@app.route('/delete_blog/<id>', methods=['DELETE'])
def delete_blog(id):
    blogs.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


if __name__ == "__main__":
    app.run(debug=True, port=5511)