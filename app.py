import os
from flask import Flask

app = Flask(__name__)

# Simple test - direct HTML return karo
@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Blood Bank System - TEST</title>
        <style>
            body { font-family: Arial; padding: 50px; text-align: center; }
            .success { color: green; font-size: 24px; }
        </style>
    </head>
    <body>
        <h1 class="success">✅ Blood Bank System - WORKING!</h1>
        <p>If you can see this, Flask is running correctly.</p>
        <p>Now testing frontend files...</p>
        <a href="/test-frontend">Test Frontend</a>
    </body>
    </html>
    '''

@app.route('/test-frontend')
def test_frontend():
    try:
        # Try to serve actual index.html
        with open('frontend/index.html', 'r', encoding='utf-8') as f:
            html_content = f.read()
        return html_content
    except Exception as e:
        return f'''
        <html>
        <body>
            <h1 style="color: red;">❌ Frontend Error</h1>
            <p>Error: {str(e)}</p>
            <p>Current directory: {os.getcwd()}</p>
            <p>Files in directory: {os.listdir('.')}</p>
        </body>
        </html>
        '''

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)