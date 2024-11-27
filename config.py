from datetime import timedelta, datetime, timezone
import logging
from logging.handlers import RotatingFileHandler
import os
import sys

from flask import Flask, g, jsonify
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    JWTManager,
    jwt_required,
    set_access_cookies,
    verify_jwt_in_request
)

from constants import (
    TIME_JWT,
    FILE_SIZE_BYTE,
    SIZE_TO_MB,
    FILES_COUNT
)
from db import db
from models import BlocklistJwt


log_format = (
    '%(asctime)s - [%(levelname)s] -  %(name)s - '
    '(%(filename)s).%(funcName)s(%(lineno)d) - %(message)s'
)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

stream_handler = logging.StreamHandler(stream=sys.stdout)
stream_handler.setFormatter(logging.Formatter(log_format))

file_handler = RotatingFileHandler(
    'time_tracker.log',
    maxBytes=SIZE_TO_MB * FILE_SIZE_BYTE * FILE_SIZE_BYTE,
    backupCount=FILES_COUNT,
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
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY') or 'My-secret-key'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or 'My-secret-key'
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=TIME_JWT)
app.config['JWT_COOKIE_CSRF_PROTECT'] = False

db.init_app(app)
jwt = JWTManager(app)


@app.before_request
def load_logged_in_user():
    try:
        verify_jwt_in_request(optional=True)
        user_identity = get_jwt_identity()
        if user_identity:
            g.user = user_identity
        else:
            g.user = None
    except Exception as e:
        g.user = None
        print(f'Error in load_logged_in_user: {e}')


@app.context_processor
def inject_user():
    return dict(user=g.user)


@app.after_request
def refresh_expiring_jwts(response):
    try:
        if g.user:
            exp_timestamp = get_jwt()['exp']
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(
                now + timedelta(minutes=30)
            )

            if target_timestamp > exp_timestamp:
                access_token = create_access_token(
                    identity=get_jwt_identity()
                )
                set_access_cookies(response, access_token)

        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    except (RuntimeError, KeyError) as e:
        print(f'Error: {e}')
        return response


@jwt.expired_token_loader
def expired_token_loader(jwt_header, jwt_payload):
    return jsonify(
        {'Message': 'The token as expired',
         'error': 'token_expired'}
    ), 401


@jwt.unauthorized_loader
def unauthorized_loader_callback(error):
    return jsonify(
        {'Message': 'The token is not found.',
         'error': 'missing_token'}
    ), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify(
        {'Message': 'Signature verification failed.',
         'error': 'invalid_token'}
    ), 401


@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload['jti']
    token = db.session.query(
        BlocklistJwt.id
    ).filter_by(jti=jti).scalar()
    return token is not None
