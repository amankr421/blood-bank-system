from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import User, Donor, BloodRequest
from auth import generate_token, token_required, admin_required
from database import Database
import os
# from backend.backendapp import app # <-- Yeh line hata di gayi hai

# --- Flask App Initialization (Sirf ek baar) ---
# Front-end static folder set kiya gaya hai
app = Flask(__name__, static_folder="frontend") 
CORS(app)

# Initialize database
db = Database()
db.init_db()

# Default admin creation function (Jaisa tha, waisa hi rakha hai)
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
                print("=" * 50)
                print("DEFAULT ADMIN CREATED SUCCESSFULLY!")
                print("Email: amanadmin@lifestream.org")
                print("Password: Aman@#8882")
                print("=" * 50)
            else:
                print("Failed to create default admin")
        else:
            print("Admin user already exists")
    except Exception as e:
        print(f"Error creating default admin: {e}")

# Create default admin
create_default_admin()

# --- Serve static files (Frontend) ---
@app.route('/')
def serve_index():
    # 'index.html' ko frontend folder se serve karega
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # CSS, JS, etc. ko serve karega
    return send_from_directory(app.static_folder, path)

# --- Auth routes (Baki saare API routes jaisa the, waisa hi rakha hai) ---
@app.route('/api/register', methods=['POST'])
def register():
    # ... (Aapka pura register logic yahan) ...
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        user_type = data.get('user_type', 'user')
        
        if user_type == 'admin':
            return jsonify({'message': 'Admin registration not allowed through public API'}), 403
        
        if User.get_by_email(email):
            return jsonify({'message': 'User already exists'}), 400
        
        user = User(email=email, password=password, full_name=full_name, user_type=user_type)
        if user.create():
            token = generate_token(user.id, user.email, user.user_type)
            return jsonify({
                'message': 'User registered successfully',
                'token': token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'user_type': user.user_type
                }
            }), 201
        else:
            return jsonify({'message': 'Registration failed'}), 500
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    # ... (Aapka pura login logic yahan) ...
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        user = User.get_by_email(email)
        if not user or not user.verify_password(password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        token = generate_token(user.id, user.email, user.user_type)
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'user_type': user.user_type
            }
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Donor routes
@app.route('/api/donors/register', methods=['POST'])
@token_required
def register_donor():
    # ... (Aapka pura register_donor logic yahan) ...
    try:
        data = request.json
        donor = Donor(
            user_id=data.get('user_id'),
            full_name=data.get('full_name'),
            age=data.get('age'),
            gender=data.get('gender'),
            mobile=data.get('mobile'),
            email=data.get('email'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            blood_group=data.get('blood_group')
        )
        if donor.create():
            return jsonify({'message': 'Donor registered successfully'}), 201
        else:
            return jsonify({'message': 'Donor registration failed'}), 500
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/donors/search', methods=['GET'])
def search_donors():
    # ... (Aapka pura search_donors logic yahan) ...
    try:
        blood_group = request.args.get('blood_group')
        state = request.args.get('state') 
        city = request.args.get('city') 
        
        if not blood_group:
            return jsonify({'message': 'Blood group is a required search criterion.'}), 400
        if not state:
            return jsonify({'message': 'State/Region is a required search criterion.'}), 400

        donors = Donor.get_by_blood_group_location(blood_group, state, city)
        
        donor_list = []
        for donor in donors:
            donor_list.append({
                'id': donor.id,
                'full_name': donor.full_name,
                'age': donor.age,
                'gender': donor.gender,
                'mobile': donor.mobile,
                'email': donor.email,
                'address': donor.address,
                'city': donor.city,
                'state': donor.state,
                'blood_group': donor.blood_group
            })
        return jsonify({'donors': donor_list}), 200
    except Exception as e:
        print(f"Error in donor search: {e}") 
        return jsonify({'message': 'An internal error occurred during donor search.'}), 500


# Blood request routes
@app.route('/api/blood-requests', methods=['POST'])
def create_blood_request():
    # ... (Aapka pura create_blood_request logic yahan) ...
    try:
        data = request.json
        blood_request = BloodRequest(
            patient_name=data.get('patient_name'),
            age=data.get('age'),
            gender=data.get('gender'),
            blood_group=data.get('blood_group'),
            units_required=data.get('units_required'),
            hospital_name=data.get('hospital_name'),
            hospital_address=data.get('hospital_address'),
            city=data.get('city'),
            state=data.get('state'),
            contact_person=data.get('contact_person'),
            contact_mobile=data.get('contact_mobile'),
            contact_email=data.get('contact_email'),
            urgency=data.get('urgency', 'Normal')
        )
        if blood_request.create():
            return jsonify({'message': 'Blood request submitted successfully'}), 201
        else:
            return jsonify({'message': 'Blood request submission failed'}), 500
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Blood stock routes
@app.route('/api/blood-stock', methods=['GET'])
def get_blood_stock():
    # ... (Aapka pura get_blood_stock logic yahan) ...
    try:
        stock = Donor.get_blood_stock()
        return jsonify({'stock': stock}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Admin routes
@app.route('/api/admin/donors', methods=['GET'])
@admin_required
def get_all_donors():
    # ... (Aapka pura get_all_donors logic yahan) ...
    try:
        donors = Donor.get_all()
        donor_list = []
        for donor in donors:
            donor_list.append({
                'id': donor.id,
                'full_name': donor.full_name,
                'age': donor.age,
                'gender': donor.gender,
                'mobile': donor.mobile,
                'email': donor.email,
                'address': donor.address,
                'city': donor.city,
                'state': donor.state,
                'blood_group': donor.blood_group
            })
        return jsonify({'donors': donor_list}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/blood-requests', methods=['GET'])
@admin_required
def get_all_blood_requests():
    # ... (Aapka pura get_all_blood_requests logic yahan) ...
    try:
        requests = BloodRequest.get_all()
        request_list = []
        for req in requests:
            request_list.append({
                'id': req.id,
                'patient_name': req.patient_name,
                'age': req.age,
                'gender': req.gender,
                'blood_group': req.blood_group,
                'units_required': req.units_required,
                'hospital_name': req.hospital_name,
                'hospital_address': req.hospital_address,
                'city': req.city,
                'state': req.state,
                'contact_person': req.contact_person,
                'contact_mobile': req.contact_mobile,
                'contact_email': req.contact_email,
                'urgency': req.urgency,
                'status': req.status,
                'created_at': req.created_at.isoformat() if hasattr(req, 'created_at') else None
            })
        return jsonify({'requests': request_list}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/blood-requests/<int:request_id>', methods=['PUT'])
@admin_required
def update_blood_request_status(request_id):
    # ... (Aapka pura update_blood_request_status logic yahan) ...
    try:
        data = request.json
        status = data.get('status')
        if not status:
            return jsonify({'message': 'Status is required'}), 400
        
        if BloodRequest.update_status(request_id, status):
            return jsonify({'message': 'Request status updated successfully'}), 200
        else:
            return jsonify({'message': 'Failed to update request status'}), 500
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)