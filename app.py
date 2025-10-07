from flask import Flask, send_from_directory
from flask_cors import CORS
import os

# Backend import
from backend.backendapp import app as backend_app  # backend ka Flask app

# Root app jo frontend serve karega
app = Flask(__name__, static_folder="frontend", template_folder="frontend")
CORS(app)  # CORS enable

# Frontend route
@app.route('/')
def index():
    return send_from_directory(app.template_folder, 'index.html')

# Backend routes ko root app me register karna
# Agar backend me Blueprint use kiya hai:
app.register_blueprint(backend_app)  

# Optionally, any static files (css/js) automatically serve ho jaye
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    # Production me debug=False
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
