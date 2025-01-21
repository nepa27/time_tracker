"""Модуль, содержащий настройки конфигурации приложения Flask."""

import logging
import os
import sys
from datetime import timedelta, datetime, timezone
from logging.handlers import RotatingFileHandler

from flask import Flask, g, render_template, redirect, url_for
from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    JWTManager,
    set_access_cookies,
    verify_jwt_in_request,
)
from flask_wtf.csrf import CSRFProtect

from constants import (
    TIME_JWT,
    FILE_SIZE_BYTE,
    SIZE_TO_MB,
    FILES_COUNT,
    MAX_CONTENT_LENGTH,
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
    'DATABASE_URL', 'sqlite:///data.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
app.config['WTF_CSRF_ENABLED'] = False
app.config['DEBUG'] = False
app.config['PROPAGATE_EXCEPTIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY') or 'My-secret-key'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or 'My-secret-key'
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=TIME_JWT)
app.config['JWT_COOKIE_CSRF_PROTECT'] = False

csrf = CSRFProtect(app)
db.init_app(app)
jwt = JWTManager(app)


@app.before_request
def load_logged_in_user():
    """Функция для загрузки авторизованного пользователя перед каждым запросом."""
    try:
        verify_jwt_in_request(optional=True)
        user_identity = get_jwt_identity()
        if user_identity:
            g.user = user_identity
        else:
            g.user = None
    except BaseException as e:
        g.user = None
        logger.error(f'Error in load_logged_in_user: {e}')


@app.context_processor
def inject_user():
    """Контекстный процессор для добавления текущего пользователя в шаблон контекста."""
    return dict(user=g.user)


@app.after_request
def refresh_expiring_jwts(response):
    """Функция для обновления токена доступа перед истечением его времени жизни."""
    try:
        if g.user:
            exp_timestamp = get_jwt()['exp']
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=30))

            if target_timestamp > exp_timestamp:
                access_token = create_access_token(identity=get_jwt_identity())
                set_access_cookies(response, access_token)

        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    except (RuntimeError, KeyError) as e:
        logger.error(f'Error: {e}')
        return response


@app.errorhandler(400)
def page_not_found(error):
    """Обработчик ошибки 400."""
    return render_template('errors/400.html'), 400


@app.errorhandler(403)
def dont_have_permission(error):
    """Обработчик ошибки 403."""
    return render_template('errors/403.html'), 403


@app.errorhandler(404)
def bad_request(error):
    """Обработчик ошибки 404."""
    return render_template('errors/404.html'), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Обработчик ошибки 405."""
    return render_template('errors/405.html'), 405


@app.errorhandler(500)
def internal_error_server(error):
    """Обработчик ошибки 500."""
    return render_template('errors/500.html'), 500


@jwt.expired_token_loader
def expired_token_loader(jwt_header, jwt_payload):
    """Обработчик истечения жизни токена JWT."""
    return redirect(url_for('timer.home'))


@jwt.unauthorized_loader
def unauthorized_loader_callback(error):
    """Обработчик недопустимого токена JWT."""
    return redirect(url_for('timer.home'))


@jwt.invalid_token_loader
def invalid_token_callback(error):
    """Обработчик недействительного токена JWT."""
    return redirect(url_for('timer.home'))


@jwt.revoked_token_loader
def revoked_token_loader(header_jwt, data_jwt):
    """Обработчик аннулированного токена JWT."""
    return redirect(url_for('timer.home'))


@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload: dict) -> bool:
    """Проверка токена JWT на наличие в блокируемом списке."""
    jti = jwt_payload['jti']
    token = db.session.query(BlocklistJwt.id).filter_by(jti=jti).scalar()
    return token is not None
