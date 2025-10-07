from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import User, Donor, BloodRequest
from auth import generate_token, token_required, admin_required
from database import Database
import os

app = Flask(__name__)
CORS(app)

# Initialize database
db = Database()
db.init_db()

# Default admin creation function
def create_default_admin():
    try:
        admin = User.get_by_email('amanadmin@lifestream.org')
        if not admin:
            admin_user = User(
                email='amanadmin@lifestream.org',
                password='Aman@#8882',
                full_name='Aman Administrator',
                user_type='admin'
            )
            if admin_user.create():
                print("DEFAULT ADMIN CREATED SUCCESSFULLY!")
        else:
            print("Admin user already exists")
    except Exception as e:
        print(f"Error creating default admin: {e}")

create_default_admin()

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('frontend', path)

# Basic test route
@app.route('/api/test')
def test():
    return jsonify({"message": "API Working!"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)