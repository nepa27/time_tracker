from datetime import datetime

from flask import flash, jsonify, render_template, redirect, url_for
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
from forms import RegistrationForm
from models import BlocklistJwt, UserModel
from schemas import UserSchema

blp = Blueprint(
    'users',
    __name__,
    description='Operations with users'
)


@blp.route('/register', endpoint='register')
class UserRegister(MethodView):
    # TODO: Почему не работает?!
    #@blp.arguments(UserSchema)
    def post(self):
        form = RegistrationForm()
        if form.validate_on_submit():
            if UserModel.query.filter(
                    UserModel.username == form.username.data
            ).first():
                flash(
                    'Пользователь с таким именем уже существует!',
                    category='error'
                )
                return redirect(url_for('users.register'))

            user = UserModel(
                username=form.username.data,
                password=generate_password_hash(form.password.data)
            )
            db.session.add(user)
            db.session.commit()
            logger.info(f'Пользователь {form.username.data} зарегистирован!')
            return redirect(url_for('users.login'))
        # TODO: Если невалидна, то нужен ответ
        self.get()

    def get(self):
        form = RegistrationForm()
        return render_template(
            'auth/register.html',
            form=form
        )

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