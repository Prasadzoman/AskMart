import re
import os
import logging
from flask import request, jsonify
from flask_login import current_user, login_required
import mysql.connector
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)

# MySQL database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'Prasad@2005'),
    'database': os.getenv('DB_NAME', 'Ecom')
}

# Parse price string like '10k' or '1,000' to integer
def parse_price(val):
    val = val.lower().replace(',', '').strip()
    if 'k' in val:
        val = val.replace('k', '')
        return int(float(val) * 1000)
    try:
        return int(float(val))
    except Exception:
        return 0

# Extract category and price range from user's message
def parse_message(message):
    message = message.lower().strip()
    message = message.replace('₹', '')
    message = re.sub(r'(\d),(\d)', r'\1\2', message)  # Clean up comma in numbers

    # Define keywords for each category
    categories = {
        "clothing": ["shirt", "t-shirt", "jacket", "tunic", "fit", "hood", "sleeve", "clothing"],
        "electronics": ["hdd", "ssd", "monitor", "electronics", "laptop", "keyboard", "mouse"],
        "jewelry": ["jewelry", "ring", "bracelet", "necklace"],
        "bags": ["bag", "backpack", "purse"]
    }

    # Detect category from message
    category = None
    for cat, keywords in categories.items():
        if any(word in message for word in keywords):
            category = cat
            break

    # Default price range
    price_min = 0
    price_max = 999999999

    # Regex to detect price range keywords in the message
    between = re.search(r'between\s+₹?([\d,\.kK]+)\s+(?:and|to)\s+₹?([\d,\.kK]+)', message)
    under = re.search(r'(?:under|below|less than)\s+₹?([\d,\.kK]+)', message)
    over = re.search(r'(?:over|above|more than)\s+₹?([\d,\.kK]+)', message)

    if between:
        price_min = parse_price(between.group(1))
        price_max = parse_price(between.group(2))
    elif under:
        price_max = parse_price(under.group(1))
    elif over:
        price_min = parse_price(over.group(1))

    return category, price_min, price_max

# Fetch products from the database based on filters
def fetch_products(category, price_min, price_max):
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        if category:
            cursor.execute("""
                SELECT id, name, price FROM products
                WHERE LOWER(category) = %s AND price BETWEEN %s AND %s
            """, (category, price_min, price_max))
        else:
            cursor.execute("""
                SELECT id, name, price FROM products
                WHERE price BETWEEN %s AND %s
            """, (price_min, price_max))

        return cursor.fetchall()
    except Exception as e:
        logging.error(f"Database error: {e}")
        return []
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Generate product recommendations and reply string
def get_product_recommendations(message):
    category, price_min, price_max = parse_message(message)
    logging.info(f"Parsed message -> Category: {category}, Price Min: {price_min}, Price Max: {price_max}")
    products = fetch_products(category, price_min, price_max)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # If no products found
    if not products:
        reply = "Sorry, I couldn't find any products matching your query."
        return {"reply": reply, "products": [], "timestamp": timestamp}

    # Create reply message with clickable product links
    lines = ["Here are some products you might like:<ul class='product-list'>"]
    for p in products[:5]:
        view_link = (
            f"<span class='product-link' onclick=\"window.location.href='http://localhost:5173/product/{p['id']}'\">🔗 View Product</span>"
        )
        lines.append(f"<li><strong>{p['name']}</strong> - ₹{p['price']:,}<br>{view_link}</li>")
    lines.append("</ul>")

    reply = "\n".join(lines)
    return {
        "reply": reply,
        "products": products[:5],
        "timestamp": timestamp
    }

# Save user message and chatbot reply to chat history
def save_chat_to_db(user_id, message, response, timestamp):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO chat_history (user_id, message, response, timestamp)
            VALUES (%s, %s, %s, %s)
        """, (user_id, message, response, timestamp))
        conn.commit()
    except Exception as e:
        logging.error(f"Error saving chat to DB: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# =====================
# ROUTES (called from app.py)
# =====================

# Handle chatbot query and return reply
@login_required
def handle_chat():
    data = request.get_json()
    message = data.get("message")

    if not message or not message.strip():
        return jsonify({"response": "Please provide a message."}), 400

    user_id = current_user.id
    result = get_product_recommendations(message)
    save_chat_to_db(user_id, message, result["reply"], result["timestamp"])
    return jsonify(result)

# Return chat history for the current user
@login_required
def get_chat_history():
    user_id = current_user.id
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT message, response, timestamp FROM chat_history
            WHERE user_id = %s ORDER BY timestamp
        """, (user_id,))
        history = cursor.fetchall()
        return jsonify(history)
    except Exception as e:
        logging.error(f"Error fetching chat history: {e}")
        return jsonify([]), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Delete chat history for the current user
@login_required
def reset_chat_history():
    user_id = current_user.id
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_history WHERE user_id = %s", (user_id,))
        conn.commit()
        return jsonify({"message": "Chat history reset."})
    except Exception as e:
        logging.error(f"Error resetting chat history: {e}")
        return jsonify({"error": "Failed to reset chat history"}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
