import os
import sqlite3
from urllib.parse import urlparse

# --- Yahan se 'from models import ...' line hata di gayi hai ---

class Database:
    def __init__(self):
        self.database_url = os.environ.get('DATABASE_URL')
        self.database_path = 'bloodbank.db'
    
    def get_connection(self):
        try:
            if self.database_url:
                # PostgreSQL for production (Render)
                print("Using PostgreSQL database...")
                try:
                    import psycopg2
                    result = urlparse(self.database_url)
                    conn = psycopg2.connect(
                        database=result.path[1:],
                        user=result.username,
                        password=result.password,
                        host=result.hostname,
                        port=result.port
                    )
                    return conn
                except ImportError:
                    print("psycopg2 not available, falling back to SQLite")
                    return self._get_sqlite_connection()
            else:
                # SQLite for development
                return self._get_sqlite_connection()
        except Exception as e:
            print(f"Database connection error: {e}")
            return None
    
    def _get_sqlite_connection(self):
        """SQLite connection for local development"""
        print("Using SQLite database...")
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        conn = self.get_connection()
        if conn:
            cursor = conn.cursor()
            
            # Check if we're using PostgreSQL or SQLite
            is_postgres = self.database_url is not None
            
            # Create Users table
            if is_postgres:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        full_name TEXT NOT NULL,
                        user_type TEXT DEFAULT 'user',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        full_name TEXT NOT NULL,
                        user_type TEXT DEFAULT 'user',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
            
            # Create Donors table
            if is_postgres:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS donors (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER,
                        full_name TEXT NOT NULL,
                        age INTEGER NOT NULL,
                        gender TEXT NOT NULL,
                        mobile TEXT NOT NULL,
                        email TEXT NOT NULL,
                        address TEXT NOT NULL,
                        city TEXT NOT NULL,
                        state TEXT NOT NULL,
                        blood_group TEXT NOT NULL,
                        is_available BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS donors (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER,
                        full_name TEXT NOT NULL,
                        age INTEGER NOT NULL,
                        gender TEXT NOT NULL,
                        mobile TEXT NOT NULL,
                        email TEXT NOT NULL,
                        address TEXT NOT NULL,
                        city TEXT NOT NULL,
                        state TEXT NOT NULL,
                        blood_group TEXT NOT NULL,
                        is_available BOOLEAN DEFAULT 1,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                ''')
            
            # Create Blood Requests table
            if is_postgres:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS blood_requests (
                        id SERIAL PRIMARY KEY,
                        patient_name TEXT NOT NULL,
                        age INTEGER NOT NULL,
                        gender TEXT NOT NULL,
                        blood_group TEXT NOT NULL,
                        units_required INTEGER NOT NULL,
                        hospital_name TEXT NOT NULL,
                        hospital_address TEXT NOT NULL,
                        city TEXT NOT NULL,
                        state TEXT NOT NULL,
                        contact_person TEXT NOT NULL,
                        contact_mobile TEXT NOT NULL,
                        contact_email TEXT,
                        urgency TEXT DEFAULT 'Normal',
                        status TEXT DEFAULT 'Pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
            else:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS blood_requests (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        patient_name TEXT NOT NULL,
                        age INTEGER NOT NULL,
                        gender TEXT NOT NULL,
                        blood_group TEXT NOT NULL,
                        units_required INTEGER NOT NULL,
                        hospital_name TEXT NOT NULL,
                        hospital_address TEXT NOT NULL,
                        city TEXT NOT NULL,
                        state TEXT NOT NULL,
                        contact_person TEXT NOT NULL,
                        contact_mobile TEXT NOT NULL,
                        contact_email TEXT,
                        urgency TEXT DEFAULT 'Normal',
                        status TEXT DEFAULT 'Pending',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
            
            conn.commit()
            conn.close()
            print("Database initialized successfully!")