import logging
from logging.handlers import RotatingFileHandler
import os
import sys

from flask_sqlalchemy import SQLAlchemy
from flask import Flask


log_format = (
    '%(asctime)s - [%(levelname)s] -  %(name)s - '
    '(%(filename)s).%(funcName)s(%(lineno)d) - %(message)s'
)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

stream_handler = logging.StreamHandler(stream=sys.stdout)
stream_handler.setFormatter(logging.Formatter(log_format))

file_handler = RotatingFileHandler(
    f'{__file__}.log',
    maxBytes=5 * 1024 * 1024,
    backupCount=5,
    encoding='UTF-8',
)
file_handler.setFormatter(logging.Formatter(log_format))

logger.addHandler(stream_handler)
logger.addHandler(file_handler)

app = Flask(__name__, template_folder='templates')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///data.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['WTF_CSRF_ENABLED'] = False
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or 'My-secret-key'

db = SQLAlchemy(app)
