from database import Database
import hashlib
import secrets
from datetime import datetime

db = Database()

# Simple password hashing without bcrypt
def hash_password(password):
    salt = secrets.token_hex(16)
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest() + ':' + salt

def verify_password(password, hashed):
    if ':' in hashed:
        hashed_val, salt = hashed.split(':')
        return hashlib.sha256((password + salt).encode('utf-8')).hexdigest() == hashed_val
    return False

class User:
    def __init__(self, id=None, email=None, password=None, full_name=None, user_type='user'):
        self.id = id
        self.email = email
        self.password = password
        self.full_name = full_name
        self.user_type = user_type
    
    def create(self):
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            hashed_password = hash_password(self.password)
            
            # POSTGRESQL FIX 1: Added RETURNING id for primary key fetching
            cursor.execute('''
                INSERT INTO users (email, password, full_name, user_type)
                VALUES (%s, %s, %s, %s) RETURNING id
            ''', (self.email, hashed_password, self.full_name, self.user_type))
            
            try:
                # Try fetching ID (works for PostgreSQL)
                self.id = cursor.fetchone()['id']
            except Exception:
                # Fallback for SQLite (if needed for local testing)
                self.id = cursor.lastrowid 
                
            conn.commit()
            conn.close()
            return True
        return False
    
    @staticmethod
    def get_by_email(email):
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            # PostgreSQL FIX 2: Using %s placeholder
            cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
            row = cursor.fetchone()
            conn.close()
            if row:
                # FINAL FIX: Password ko String mein convert karna zaroori hai
                password_str = str(row['password']) if row['password'] is not None else None
                
                return User(id=row['id'], 
                            email=row['email'], 
                            password=password_str, 
                            full_name=row['full_name'], 
                            user_type=row['user_type'])
        return None
    
    def verify_password(self, password):
        # Is function ko stringified password ki zaroorat hoti hai
        return verify_password(password, self.password)

class Donor:
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.full_name = kwargs.get('full_name')
        self.age = kwargs.get('age')
        self.gender = kwargs.get('gender')
        self.mobile = kwargs.get('mobile')
        self.email = kwargs.get('email')
        self.address = kwargs.get('address')
        self.city = kwargs.get('city')
        self.state = kwargs.get('state')
        self.blood_group = kwargs.get('blood_group')
        self.is_available = kwargs.get('is_available', True)
    
    def create(self):
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            
            # POSTGRESQL FIX 1: Added RETURNING id
            cursor.execute('''
                INSERT INTO donors (user_id, full_name, age, gender, mobile, email, address, city, state, blood_group)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            ''', (self.user_id, self.full_name, self.age, self.gender, self.mobile, 
                  self.email, self.address, self.city, self.state, self.blood_group))
            
            try:
                self.id = cursor.fetchone()['id']
            except Exception:
                self.id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            return True
        return False
    

    @staticmethod
    def get_by_blood_group_location(blood_group, state, city=None):
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            
            # PostgreSQL FIX 2: Using %s placeholders
            query = "SELECT * FROM donors WHERE blood_group = %s AND state = %s AND is_available = 1"
            params = [blood_group, state]
            
            if city and city.strip():
                query += " AND city = %s"
                params.append(city.strip())
                
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            conn.close()
            
            donors = []
            for row in rows:
                donors.append(Donor(
                    id=row['id'], user_id=row['user_id'], full_name=row['full_name'], age=row['age'],
                    gender=row['gender'], mobile=row['mobile'], email=row['email'], address=row['address'],
                    city=row['city'], state=row['state'], blood_group=row['blood_group']
                ))
            return donors
        return []

    
    @staticmethod
    def get_all():
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM donors')
            rows = cursor.fetchall()
            conn.close()
            donors = []
            for row in rows:
                donors.append(Donor(
                    id=row['id'], user_id=row['user_id'], full_name=row['full_name'], age=row['age'],
                    gender=row['gender'], mobile=row['mobile'], email=row['email'], address=row['address'],
                    city=row['city'], state=row['state'], blood_group=row['blood_group']
                ))
            return donors
        return []
    
    @staticmethod
    def get_blood_stock():
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT blood_group, COUNT(*) as count 
                FROM donors 
                WHERE is_available = 1 
                GROUP BY blood_group
            ''')
            rows = cursor.fetchall()
            conn.close()
            stock = {}
            blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            for bg in blood_groups:
                stock[bg] = 0
            for row in rows:
                stock[row['blood_group']] = row['count']
            return stock
        return {}

class BloodRequest:
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.patient_name = kwargs.get('patient_name')
        self.age = kwargs.get('age')
        self.gender = kwargs.get('gender')
        self.blood_group = kwargs.get('blood_group')
        self.units_required = kwargs.get('units_required')
        self.hospital_name = kwargs.get('hospital_name')
        self.hospital_address = kwargs.get('hospital_address')
        self.city = kwargs.get('city')
        self.state = kwargs.get('state')
        self.contact_person = kwargs.get('contact_person')
        self.contact_mobile = kwargs.get('contact_mobile')
        self.contact_email = kwargs.get('contact_email')
        self.urgency = kwargs.get('urgency', 'Normal')
        self.status = kwargs.get('status', 'Pending')
    
    def create(self):
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            
            # POSTGRESQL FIX 1: Added RETURNING id
            cursor.execute('''
                INSERT INTO blood_requests 
                (patient_name, age, gender, blood_group, units_required, hospital_name, 
                 hospital_address, city, state, contact_person, contact_mobile, contact_email, urgency)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            ''', (self.patient_name, self.age, self.gender, self.blood_group, 
                  self.units_required, self.hospital_name, self.hospital_address,
                  self.city, self.state, self.contact_person, self.contact_mobile,
                  self.contact_email, self.urgency))
            
            # ID fetch karne ka logic
            try:
                self.id = cursor.fetchone()['id']
            except Exception:
                self.id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            return True
        return False
    
    @staticmethod
    def get_all():
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM blood_requests ORDER BY created_at DESC')
            rows = cursor.fetchall()
            conn.close()
            requests = []
            for row in rows:
                requests.append(BloodRequest(
                    id=row['id'], patient_name=row['patient_name'], age=row['age'], gender=row['gender'],
                    blood_group=row['blood_group'], units_required=row['units_required'], hospital_name=row['hospital_name'],
                    hospital_address=row['hospital_address'], city=row['city'], state=row['state'],
                    contact_person=row['contact_person'], contact_mobile=row['contact_mobile'], contact_email=row['contact_email'],
                    urgency=row['urgency'], status=row['status']
                ))
            return requests
        return []
    
    @staticmethod
    def update_status(request_id, status):
        conn = db.get_connection()
        if conn:
            cursor = conn.cursor()
            # PostgreSQL FIX 2: Using %s placeholders
            cursor.execute('''
                UPDATE blood_requests SET status = %s WHERE id = %s
            ''', (status, request_id))
            conn.commit()
            conn.close()
            return True
        return False