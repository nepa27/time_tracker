from datetime import datetime

from flask import flash, jsonify, render_template, redirect, url_for
from flask.views import MethodView
from flask_dance.contrib.github import github
from flask_jwt_extended import (
    get_jwt,
    get_jwt_identity,
    set_access_cookies,
    unset_access_cookies,
)
from flask_jwt_extended import jwt_required, create_access_token
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash

from config import db, logger
from constants import (
    MIN_LENGHT_USERNAME,
    MIN_LENGHT_PASSWORD,
)
from forms import AuthForm
from models import BlocklistJwt, UserModel


class UserRegister(MethodView):
    """Представление для регистрации пользователей."""

    def get(self):
        """Представление для отображения формы регистрации."""
        form = AuthForm()
        return render_template('auth/register.html', form=form)

    def post(self):
        """ Создает нового пользователя."""
        form = AuthForm()
        if form.validate_on_submit():
            if UserModel.query.filter(
                    UserModel.username == form.username.data
            ).first():
                flash(
                    'Пользователь с таким именем уже существует!',
                    category='error',
                )
                return redirect(url_for('users.register'))

            user = UserModel(
                username=form.username.data,
                password=generate_password_hash(form.password.data),
            )
            db.session.add(user)
            db.session.commit()
            logger.info(f'Пользователь {form.username.data} зарегистирован!')
            return redirect(url_for('users.login'))

        logger.error('Неудачная регистрация!')
        if MIN_LENGHT_USERNAME > len(form.username.data):
            flash(
                f'Имя должно быть больше {MIN_LENGHT_USERNAME} символов!',
                category='error',
            )
        if MIN_LENGHT_PASSWORD > len(form.password.data):
            flash(
                f'Пароль должно быть больше {MIN_LENGHT_PASSWORD} символов!',
                category='error',
            )
        return redirect(url_for('users.register'))


class UserLogin(MethodView):
    """Представление для аутентификации пользователей."""

    def get(self):
        """Представление для отображения формы аутентификации."""
        form = AuthForm()
        return render_template('auth/register.html', form=form)

    def post(self):
        """Аутентифицирует пользователя и выдает токен аутентификации."""
        form = AuthForm()
        if form.validate_on_submit():
            user = UserModel.query.filter(
                UserModel.username == form.username.data
            ).first()
            if not user or not check_password_hash(
                    user.password, form.password.data
            ):
                return (
                    jsonify(
                        {
                            'message': 'Неправильное имя '
                                       'пользователя или пароль!'
                        }
                    ),
                    401,
                )

            access_token = create_access_token(
                identity=user.username, fresh=True
            )

            resp = jsonify({'message': 'success login'})
            set_access_cookies(resp, access_token)
            logger.info(f'Пользователь {form.username.data} вошел в систему!')
            return resp, 200
        logger.error('Неудачная аутентификация!')
        return (
            jsonify({'message': 'Неправильное имя пользователя или пароль!'}),
            401,
        )


class UserLogout(MethodView):
    """Представление для выхода пользователей из системы."""

    @jwt_required()
    def get(self):
        """Добавляет токен пользователя в BlackList."""
        resp = jsonify({'message': 'logout successful'})
        try:
            user = get_jwt_identity()
            unset_access_cookies(resp)
            jti = get_jwt()['jti']
            now = datetime.now()
            db.session.add(BlocklistJwt(jti=jti, created_at=now))
            db.session.commit()
            logger.info(f'Пользователь {user} вышел из системы!')
            return redirect(url_for('timer.home'))
        except SQLAlchemyError as e:
            logger.error(f'Ошибка при удалении {str(e)[:15]}')
            return resp


def login_github():
    """Представление для аутентификации пользователей через GitHub."""
    if not github.authorized:
        return redirect(url_for('github.login'))
    res = github.get('/user')
    username = res.json()['login']
    if UserModel.query.filter(
            UserModel.username == username
    ).first():
        flash(
            'Пользователь с таким именем уже существует!',
            category='error',
        )
        return redirect(url_for('users.register'))

    user = UserModel(username=username)
    db.session.add(user)
    db.session.commit()
    access_token = create_access_token(
        identity=user.username, fresh=True
    )
    logger.info(f'Пользователь {username} зарегистрирован через GitHub!')
    return jsonify(access_token=access_token)
