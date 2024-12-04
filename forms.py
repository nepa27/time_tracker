from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length

from constants import (
    MIN_LENGHT_USERNAME,
    MIN_LENGHT_PASSWORD,
    MAX_LENGHT_USERNAME,
    MAX_LENGHT_PASSWORD
)


class AuthForm(FlaskForm):
    username = StringField('Имя пользователя',
                           validators=[
                               DataRequired(),
                               Length(
                                   min=MIN_LENGHT_USERNAME,
                                   max=MAX_LENGHT_USERNAME,
                                   message='Имя должно'
                                           ' быть больше'
                                           f' {MIN_LENGHT_USERNAME} '
                                           'символов'
                               )
                           ])
    password = PasswordField('Пароль',
                             validators=[
                                 DataRequired(),
                                 Length(
                                     min=MIN_LENGHT_PASSWORD,
                                     max=MAX_LENGHT_PASSWORD,
                                     message='Пароль должен '
                                             'быть больше'
                                             f' {MAX_LENGHT_PASSWORD}'
                                             f' символов'
                                 )
                             ])
