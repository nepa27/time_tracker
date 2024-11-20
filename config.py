import os

from flask_sqlalchemy import SQLAlchemy
from flask import Flask


app = Flask(__name__, template_folder='templates')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///data.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # ?
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['WTF_CSRF_ENABLED'] = False
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or 'My-secret-key'

db = SQLAlchemy(app)
