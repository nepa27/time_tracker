from datetime import datetime

from flask import jsonify, render_template, redirect, url_for
from flask.views import MethodView
from flask_jwt_extended import (
    get_jwt,
    get_jwt_identity,
    set_access_cookies,
    unset_access_cookies
)
from flask_jwt_extended import jwt_required, create_access_token
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash

from config import db, logger
from models import BlocklistJwt, UserModel
from schemas import UserSchema

blp = Blueprint(
    'users',
    __name__,
    description='Operations with users'
)


@blp.route('/register', endpoint='register')
class UserRegister(MethodView):
    @blp.arguments(UserSchema)
    def post(self, user_data):
        if UserModel.query.filter(
                UserModel.username == user_data['username']
        ).first():
            abort(409, message='Пользователь уже зарегистирован!')

        user = UserModel(
            username=user_data['username'],
            password=generate_password_hash(user_data['password'])
        )
        db.session.add(user)
        db.session.commit()
        logger.info(f'Пользователь {user_data["username"]} зарегистирован!')
        return redirect(url_for('users.login'))

    def get(self):
        return render_template('auth/register.html')


@blp.route('/login', endpoint='login')
class UserLogin(MethodView):
    @blp.arguments(UserSchema)
    def post(self, user_data):
        user = UserModel.query.filter(
            UserModel.username == user_data['username']
        ).first()
        if not user or not check_password_hash(
                user.password,
                user_data['password']
        ):
            abort(400, message='Неверное имя пользователя или пароль!')

        access_token = create_access_token(
            identity=user.username,
            fresh=True
        )

        resp = jsonify({'message': 'success login'})
        set_access_cookies(resp, access_token)
        logger.info(f'Пользователь {user.username} вошел в систему!')
        return resp, 200

    def get(self):
        return render_template('auth/login.html')


@blp.route('/logout', endpoint='logout')
class UserLogout(MethodView):
    @jwt_required()
    def get(self):
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
            print(f'error: {e}')
            return resp