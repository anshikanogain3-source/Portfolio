from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "secret123"

CORS(app, supports_credentials=True)

client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]

products = db["products"]
customers = db["customers"]
orders = db["orders"]
reviews = db["reviews"]
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


# ================= PRODUCTS =================
@app.route('/products')
def get_products():
    data = []
    for p in products.find():
        p["_id"] = str(p["_id"])
        data.append(p)
    return jsonify(data)


@app.route('/add_product', methods=['POST'])
def add_product():
    data = request.json

    products.insert_one({
        "name": data.get("name"),
        "price": data.get("price"),
        "category": data.get("category"),
        "stock": data.get("stock")
    })

    return jsonify({"message": "Product added"})


@app.route('/update_product/<id>', methods=['PUT'])
def update_product(id):
    products.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Product updated"})


@app.route('/delete_product/<id>', methods=['DELETE'])
def delete_product(id):
    products.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


# ================= CUSTOMERS =================
@app.route('/customers')
def get_customers():
    data = []

    for c in customers.find():
        c["_id"] = str(c["_id"])

        # Attach reviews of that customer
        cust_reviews = []
        for r in reviews.find({"customerId": c["_id"]}):
            r["_id"] = str(r["_id"])
            cust_reviews.append(r)

        c["reviews"] = cust_reviews
        data.append(c)

    return jsonify(data)


@app.route('/add_customer', methods=['POST'])
def add_customer():
    data = request.json

    customers.insert_one({
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "address": data.get("address")
    })

    return jsonify({"message": "Customer added"})


@app.route('/update_customer/<id>', methods=['PUT'])
def update_customer(id):
    customers.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Customer updated"})


@app.route('/delete_customer/<id>', methods=['DELETE'])
def delete_customer(id):
    customers.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


# ================= ORDERS =================
@app.route('/orders')
def get_orders():
    data = []
    for o in orders.find():
        o["_id"] = str(o["_id"])
        data.append(o)
    return jsonify(data)


@app.route('/add_order', methods=['POST'])
def add_order():
    data = request.json

    orders.insert_one({
        "customer": data.get("customer"),
        "phone": data.get("phone"),
        "product": data.get("product"),
        "quantity": data.get("quantity")
    })

    return jsonify({"message": "Order added"})


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


# ================= REVIEWS =================
@app.route('/add_review', methods=['POST'])
def add_review():
    data = request.json

    reviews.insert_one({
        "customerId": data.get("customerId"),
        "review": data.get("review")
    })

    return jsonify({"message": "Review added"})


@app.route('/delete_review/<id>', methods=['DELETE'])
def delete_review(id):
    reviews.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})

# ================= UPDATE REVIEW =================
@app.route('/update_review/<id>', methods=['PUT'])
def update_review(id):
    reviews.update_one(
        {"_id": ObjectId(id)},
        {"$set": request.json}
    )
    return jsonify({"message": "Review updated"})

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True, port=5529)