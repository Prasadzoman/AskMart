from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify, request, session, make_response
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import mysql.connector
from werkzeug.security import check_password_hash, generate_password_hash
import os
from chatbot import handle_chat, get_chat_history, reset_chat_history

app = Flask(__name__)
app.secret_key = 'supersecret'

# Session/Cookie configuration
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)

# Enable CORS for React frontend on localhost:5173
CORS(app,
     supports_credentials=True,
     origins=["http://localhost:5173"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"]
)

# MySQL database configuration
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

# Load user by ID for session management
@login_manager.user_loader
def load_user(user_id):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user:
        return User(user['id'], user['username'])
    return None

# User signup route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = generate_password_hash(password)

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                       (username, email, hashed_password))
        conn.commit()
        return jsonify({"message": "User created successfully"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# User login route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, password FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and check_password_hash(user['password'], password):
        user_obj = User(user['id'], user['username'])
        login_user(user_obj)

        response = make_response(jsonify({
            "message": "Logged in successfully",
            "username": user['username']
        }))
        return response
    else:
        return jsonify({"error": "Invalid username or password"}), 401

# Logout route
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})

# Get current logged-in user details
@app.route('/me')
@login_required
def me():
    return jsonify({"id": current_user.id, "username": current_user.username})

# Get all products
@app.route('/products', methods=['GET'])
def get_products():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, category, description, price, stock, image_url FROM products")
        products = cursor.fetchall()
        return jsonify({"products": products})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# Get product by ID
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, category, description, price, stock, image_url FROM products WHERE id = %s",
                       (product_id,))
        product = cursor.fetchone()
        if product:
            return jsonify({"product": product})
        else:
            return jsonify({"error": "Product not found"}), 404
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# Get items in user's cart
@app.route('/cart', methods=['GET'])
@login_required
def get_cart():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ci.id, p.name, p.price, p.image_url, ci.quantity 
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = %s
    """, (current_user.id,))
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(items)

# Add item to cart
@app.route('/cart', methods=['POST'])
@login_required
def add_to_cart():
    data = request.json
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE quantity = quantity + %s
    """, (current_user.id, product_id, quantity, quantity))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Item added to cart'})

# Chatbot response route
@app.route('/chat', methods=['POST'])
@login_required
def chatbot_reply():
    data = request.json
    message = data.get('message', '')
    return handle_chat()

# Chatbot conversation history
@app.route('/chat/history', methods=['GET'])
@login_required
def chatbot_history():
    return get_chat_history()

# Reset chatbot conversation
@app.route('/chat/reset', methods=['POST'])
@login_required
def chatbot_reset():
    return reset_chat_history()

# Product search route
@app.route('/search', methods=['GET'])
def search_products():
    search_query = request.args.get('query', '').strip().lower()

    if not search_query:
        return jsonify({"error": "Search query is required"}), 400

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        search_pattern = f"%{search_query}%"
        cursor.execute("""
            SELECT id, name, category, description, price, stock, image_url 
            FROM products 
            WHERE LOWER(name) LIKE %s OR LOWER(category) LIKE %s
        """, (search_pattern, search_pattern))

        products = cursor.fetchall()
        return jsonify({"products": products})

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        conn.close()

# Optional: Check session cookie
@app.route('/check-cookie')
def check_cookie():
    return jsonify({"session_cookie": request.cookies.get('session')})

# Optional: Debug session contents
@app.route("/session-debug")
def session_debug():
    return jsonify(dict(session))

# Run Flask app locally
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)
