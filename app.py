# (Keep all your imports here)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import User, Donor, BloodRequest
from auth import generate_token, token_required, admin_required
from database import Database
# import os # Already imported

# --- Flask App Initialization (Sirf ek baar) ---
# 'frontend' folder ko static files ke liye use karo
app = Flask(__name__, static_folder="frontend") 
CORS(app) # CORS ko apply karo

# Initialize database
db = Database()
db.init_db() # Yahin database initialize hoga

# ... (Create default admin function and call jaisa pehle tha, usko chhod do) ...
# create_default_admin()

# --- Serve static files (API routes ke neeche daalo) ---
@app.route('/')
def serve_index():
    # Frontend/index.html ko serve karega
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # CSS, JS, images, etc. ko serve karega
    return send_from_directory(app.static_folder, path)

# --- Baki saare API Routes (@app.route('/api/...') jaisa pehle tha, waisa hi chhod do) ---

if __name__ == "__main__":
    app.run(debug=True)