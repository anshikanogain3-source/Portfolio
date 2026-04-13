from flask import Flask, request, jsonify, render_template, Response
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
import datetime
import smtplib
import random
import csv
import os
from io import StringIO
from bson import ObjectId
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

app = Flask(__name__, template_folder="template")
CORS(app)
bcrypt = Bcrypt(app)

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "expense_tracker")

# MongoDB Connection
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]
users = db["users"]
expenses_col = db["expenses"]
categories_col = db["categories"]

def get_current_user():
    token = request.headers.get("Authorization")

    if not token:
        return None

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded["email"]
    except:
        return None


# Home Route
@app.route("/")
def home():
    return ("Welcome to the Expense Tracker Backend")

@app.route("/main")
def main_page():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"msg": "Token missing"}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({"msg": "Welcome to dashboard", "user": decoded}), 200
    except:
        return jsonify({"msg": "Invalid token"}), 401



# ========================
# 🔐 SIGNUP
# ========================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    email = data.get("email")
    password = data.get("password")
    name = data.get("name")

    if not email or not password or not name:
        return jsonify({"msg": "All fields are required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw
    })

    
    token = jwt.encode({
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "msg": "Account created successfully",
        "token": token
    }), 201


# ========================
# 🔐 LOGIN
# ========================
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})

    if not user:
        return jsonify({"msg": "User not found"}), 404

    if bcrypt.check_password_hash(user["password"], password):
        token = jwt.encode({
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "msg": "Login successful",
            "token": token
        }), 200

    return jsonify({"msg": "Invalid password"}), 401


# ========================
# 🔐 FORGOT PASSWORD (SIMULATED OTP)
# ========================
@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"msg": "Email is required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"msg": "Email not registered"}), 404

    otp = "".join([str(random.randint(0, 9)) for _ in range(6)])

    # Save OTP + expiry (5 min)
    users.update_one(
        {"email": email},
        {
            "$set": {
                "otp": otp,
                "otp_expiry": datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
            }
        }
    )

    # Send Email
    if send_email_otp(email, otp):
        return jsonify({"msg": "OTP sent to email"}), 200
    else:
        return jsonify({"msg": "Failed to send OTP"}), 500


@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    user_otp = data.get("otp")

    if not email or not user_otp:
        return jsonify({"msg": "Email and OTP required"}), 400

    user = users.find_one({"email": email})

    if not user or "otp" not in user:
        return jsonify({"msg": "No OTP found"}), 400

    if datetime.datetime.utcnow() > user.get("otp_expiry"):
        return jsonify({"msg": "OTP expired"}), 400

    if user["otp"] == user_otp:
        users.update_one(
            {"email": email},
            {"$unset": {"otp": "", "otp_expiry": ""}}
        )
        return jsonify({"msg": "OTP verified"}), 200

    return jsonify({"msg": "Invalid OTP"}), 400


@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    users.update_one(
        {"email": email},
        {"$set": {"password": hashed_pw}, "$unset": {"otp": ""}}
    )

    return jsonify({"msg": "Password updated successfully"}), 200

# Email OTP function
def send_email_otp(receiver_email, otp):
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        subject = "Your OTP for Password Reset"
        body = f'''Dear User,

        We received a request to reset your password for your account.

        Your One-Time Password (OTP) for verification is:

        {otp}

        This OTP is valid for the next 5 minutes. Please do not share this code with anyone for security reasons.

        If you did not request a password reset, please ignore this email or contact our support team immediately.

        Thank you,
        Support Team
        Expense Tracker'''

        message = f"Subject: {subject}\n\n{body}"

        server.sendmail(SENDER_EMAIL, receiver_email, message)
        server.quit()

        return True
    except Exception as e:
        print("Email Error:", e)
        return False

def parse_budget(value):
    try:
        budget = float(value if value not in (None, "") else 50000)
        return max(budget, 0)
    except (TypeError, ValueError):
        return 50000.0

def get_user_expenses(email):
    return list(expenses_col.find({"email": email}))

def build_report_summary(expenses, budget):
    total_spent = round(sum(float(item.get("amount", 0)) for item in expenses), 2)
    category_totals = {}

    for item in expenses:
        category = item.get("category") or "Uncategorized"
        category_totals[category] = category_totals.get(category, 0) + float(item.get("amount", 0))

    highest_category = "-"
    highest_category_amount = 0.0
    if category_totals:
        highest_category, highest_category_amount = max(category_totals.items(), key=lambda pair: pair[1])

    savings = round(budget - total_spent, 2)

    return {
        "totalSpent": total_spent,
        "highestCategory": highest_category,
        "highestCategoryAmount": round(highest_category_amount, 2),
        "savings": savings,
        "budget": round(budget, 2),
        "transactionCount": len(expenses)
    }

def build_csv_report(email, expenses, summary):
    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(["Expense Tracker Report"])
    writer.writerow(["User", email])
    writer.writerow(["Generated At", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow([])
    writer.writerow(["Summary"])
    writer.writerow(["Total Spent", summary["totalSpent"]])
    writer.writerow(["Highest Category", summary["highestCategory"]])
    writer.writerow(["Highest Category Amount", summary["highestCategoryAmount"]])
    writer.writerow(["Budget", summary["budget"]])
    writer.writerow(["Savings", summary["savings"]])
    writer.writerow(["Transactions", summary["transactionCount"]])
    writer.writerow([])
    writer.writerow(["Title", "Amount", "Date", "Category"])

    for item in expenses:
        writer.writerow([
            item.get("title", ""),
            item.get("amount", 0),
            item.get("date", ""),
            item.get("category", "Uncategorized")
        ])

    return output.getvalue().encode("utf-8")

def pdf_escape(text):
    return str(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

def build_pdf_report(email, expenses, summary):
    lines = [
        "Expense Tracker Report",
        f"User: {email}",
        f"Generated At: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        f"Total Spent: Rs {summary['totalSpent']}",
        f"Highest Category: {summary['highestCategory']} (Rs {summary['highestCategoryAmount']})",
        f"Budget: Rs {summary['budget']}",
        f"Savings: Rs {summary['savings']}",
        f"Transactions: {summary['transactionCount']}",
        "",
        "Entries:"
    ]

    for item in expenses[:20]:
        lines.append(
            f"- {item.get('title', '')} | Rs {item.get('amount', 0)} | {item.get('date', '')} | {item.get('category', 'Uncategorized')}"
        )

    if len(expenses) > 20:
        lines.append(f"... and {len(expenses) - 20} more entries")

    content_lines = ["BT", "/F1 12 Tf", "50 780 Td"]
    for idx, line in enumerate(lines):
        if idx > 0:
            content_lines.append("0 -18 Td")
        content_lines.append(f"({pdf_escape(line)}) Tj")
    content_lines.append("ET")

    stream = "\n".join(content_lines)
    objects = []
    objects.append("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj")
    objects.append("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj")
    objects.append("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >> endobj")
    objects.append("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj")
    objects.append(f"5 0 obj << /Length {len(stream.encode('latin-1', 'replace'))} >> stream\n{stream}\nendstream endobj")

    pdf = "%PDF-1.4\n"
    offsets = []
    for obj in objects:
        offsets.append(len(pdf.encode("latin-1")))
        pdf += obj + "\n"

    xref_position = len(pdf.encode("latin-1"))
    pdf += f"xref\n0 {len(objects) + 1}\n"
    pdf += "0000000000 65535 f \n"
    for offset in offsets:
        pdf += f"{offset:010d} 00000 n \n"
    pdf += f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_position}\n%%EOF"

    return pdf.encode("latin-1", "replace")

def generate_report_file(email, expenses, budget, file_format):
    summary = build_report_summary(expenses, budget)
    report_format = file_format.lower()

    if report_format == "csv":
        data = build_csv_report(email, expenses, summary)
        content_type = "text/csv"
    elif report_format == "pdf":
        data = build_pdf_report(email, expenses, summary)
        content_type = "application/pdf"
    else:
        raise ValueError("Unsupported report format")

    filename = f"expense_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.{report_format}"
    return data, content_type, filename, summary

def send_report_email(receiver_email, file_bytes, filename, file_format, summary):
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        message = MIMEMultipart()
        message["From"] = SENDER_EMAIL
        message["To"] = receiver_email
        message["Subject"] = "Expense Tracker Report"

        body = (
            "Hello,\n\n"
            "Please find your expense tracker report attached.\n\n"
            f"Total Spent: Rs {summary['totalSpent']}\n"
            f"Highest Category: {summary['highestCategory']} (Rs {summary['highestCategoryAmount']})\n"
            f"Budget: Rs {summary['budget']}\n"
            f"Savings: Rs {summary['savings']}\n\n"
            "Regards,\nExpense Tracker"
        )
        message.attach(MIMEText(body, "plain"))

        part = MIMEBase("application", "octet-stream")
        part.set_payload(file_bytes)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
        message.attach(part)

        server.sendmail(SENDER_EMAIL, receiver_email, message.as_string())
        server.quit()
        return True
    except Exception as e:
        print("Report Email Error:", e)
        return False

@app.route("/add-expense", methods=["POST"])
def add_expense():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json

    expense = {
        "email": email,
        "title": data.get("title"),
        "amount": float(data.get("amount")),
        "date": data.get("date"),
        "category": data.get("category"),
        "created_at": datetime.datetime.utcnow()
    }

    result = expenses_col.insert_one(expense)

    return jsonify({
        "msg": "Expense added",
        "id": str(result.inserted_id)
    }), 201

@app.route("/get-expenses", methods=["GET"])
def get_expenses():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = list(expenses_col.find({"email": email}))

    for d in data:
        d["_id"] = str(d["_id"])

    return jsonify(data), 200


@app.route("/update-expense/<id>", methods=["PUT"])
def update_expense(id):
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json

    expenses_col.update_one(
        {"_id": ObjectId(id), "email": email},
        {"$set": {
            "title": data.get("title"),
            "amount": data.get("amount"),
            "date": data.get("date"),
            "category": data.get("category")
        }}
    )

    return jsonify({"msg": "Expense updated"}), 200

@app.route("/delete-expense/<id>", methods=["DELETE"])
def delete_expense(id):
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    expenses_col.delete_one({
        "_id": ObjectId(id),
        "email": email
    })

    return jsonify({"msg": "Expense deleted"}), 200

@app.route("/add-category", methods=["POST"])
def add_category():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json
    name = data.get("name")

    categories_col.insert_one({
        "email": email,
        "name": name
    })

    return jsonify({"msg": "Category added"}), 201

@app.route("/get-categories", methods=["GET"])
def get_categories():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = list(categories_col.find({"email": email}))

    for c in data:
        c["_id"] = str(c["_id"])

    return jsonify(data), 200

# user profile route
#----------------------------------------------
@app.route("/get-profile", methods=["GET"])
def get_profile():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    user = users.find_one({"email": email}, {"_id": 0, "password": 0})

    return jsonify(user), 200

#update profile route
#----------------------------------------------
@app.route("/update-profile", methods=["PUT"])
def update_profile():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json
    name = data.get("name")

    users.update_one(
        {"email": email},
        {"$set": {"name": name}}
    )

    return jsonify({"msg": "Profile updated"}), 200

# change password route
#----------------------------------------------
@app.route("/change-password", methods=["PUT"])
def change_password():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    user = users.find_one({"email": email})

    if not bcrypt.check_password_hash(user["password"], old_password):
        return jsonify({"msg": "Old password incorrect"}), 400

    hashed = bcrypt.generate_password_hash(new_password).decode("utf-8")

    users.update_one(
        {"email": email},
        {"$set": {"password": hashed}}
    )

    return jsonify({"msg": "Password updated"}), 200

@app.route("/report-summary", methods=["GET"])
def report_summary():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    budget = parse_budget(request.args.get("budget"))
    expenses = get_user_expenses(email)
    summary = build_report_summary(expenses, budget)
    return jsonify(summary), 200

@app.route("/download-report", methods=["GET"])
def download_report():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    budget = parse_budget(request.args.get("budget"))
    file_format = request.args.get("format", "csv")
    expenses = get_user_expenses(email)

    try:
        file_bytes, content_type, filename, _ = generate_report_file(email, expenses, budget, file_format)
    except ValueError:
        return jsonify({"msg": "Unsupported report format"}), 400

    response = Response(file_bytes, mimetype=content_type)
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response

@app.route("/email-report", methods=["POST"])
def email_report():
    email = get_current_user()
    if not email:
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json or {}
    receiver_email = data.get("email")
    file_format = data.get("format", "pdf")
    budget = parse_budget(data.get("budget"))

    if not receiver_email:
        return jsonify({"msg": "Recipient email is required"}), 400

    expenses = get_user_expenses(email)

    try:
        file_bytes, _, filename, summary = generate_report_file(email, expenses, budget, file_format)
    except ValueError:
        return jsonify({"msg": "Unsupported report format"}), 400

    if send_report_email(receiver_email, file_bytes, filename, file_format, summary):
        return jsonify({"msg": f"Report sent to {receiver_email}"}), 200

    return jsonify({"msg": "Failed to send report email"}), 500

# ========================
# RUN
# ========================
if __name__ == "__main__":
    app.run(debug=True, port=8800)
