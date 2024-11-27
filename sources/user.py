from datetime import datetime
import hashlib

from flask import jsonify, render_template, redirect, url_for
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask_jwt_extended import jwt_required, create_access_token
from flask_jwt_extended import (
    get_jwt,
    set_access_cookies,
    unset_access_cookies
)
from sqlalchemy.exc import SQLAlchemyError

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
            abort(409, message='User already exists')
        user = UserModel(
            username=user_data['username'],
            password=hashlib.sha256(user_data['password'].encode()
                                    ).hexdigest()
        )
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('users.login'))

    def get(self):
        return render_template('auth/register.html')


@blp.route('/login', endpoint='login')
class UserLogin(MethodView):
    @blp.arguments(UserSchema)
    def post(self, user_data):
        author = UserModel.query.filter(
            UserModel.username == user_data['username']
        ).first()
        if not author or hashlib.sha256(
                user_data['password'].encode()
        ).hexdigest() != author.password:
            abort(400,
                  message='Username or password is invalid'
                  )

        access_token = create_access_token(
            identity=author.username,
            fresh=True
        )

        resp = jsonify({'message': 'success login'})
        set_access_cookies(resp, access_token)
        return resp, 200

    def get(self):
        return render_template('auth/login.html')


@blp.route('/logout', endpoint='logout')
class UserLogout(MethodView):
    @jwt_required()
    def get(self):
        resp = jsonify({'message': 'logout successful'})
        try:
            unset_access_cookies(resp)
            jti = get_jwt()['jti']
            now = datetime.now()
            db.session.add(BlocklistJwt(jti=jti, created_at=now))
            db.session.commit()
            return redirect(url_for('timer.home'))
        except SQLAlchemyError as e:
            print(f'error: {e}')
            return resp