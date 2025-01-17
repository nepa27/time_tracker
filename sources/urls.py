import os

from flask_smorest import Blueprint
from flask_dance.contrib.github import make_github_blueprint

from sources.endpoints import (
    ReadCreateWorksView,
    EditWorksView,
    delete_works,
    get_statistics,
    api_data,
    api_statistics,
)
from sources.user import UserRegister, UserLogin, UserLogout, login_github


CLIENT_ID = os.getenv('CLIENT_GITHUB_ID')
CLIENT_GITHUB_ID = os.getenv('CLIENT_GITHUB_ID')

github_bp = make_github_blueprint(
    client_id=CLIENT_ID,
    client_secret=CLIENT_GITHUB_ID,
)

timer = Blueprint('timer', __name__, description='Timer work time')
users = Blueprint('users', __name__, description='Operations with users')


timer.add_url_rule(
    '/',
    view_func=ReadCreateWorksView.as_view('home')
)
timer.add_url_rule(
    '/edit/<date>/<name_of_work>',
    view_func=EditWorksView.as_view('edit')
)
timer.add_url_rule(
    '/delete/<date>/<name_of_work>',
    view_func=delete_works,
    methods=('DELETE',),
    endpoint='delete',
)
timer.add_url_rule(
    '/statistics/',
    view_func=get_statistics,
    methods=('GET',),
    endpoint='statistics',
)
timer.add_url_rule(
    '/api/data',
    methods=('GET',),
    view_func=api_data,
    endpoint='api_data'
)
timer.add_url_rule(
    '/api/statistics',
    methods=('GET',),
    view_func=api_statistics,
    endpoint='api_statistics'
)


users.add_url_rule(
    '/register/',
    view_func=UserRegister.as_view('register')
)
users.add_url_rule(
    '/login/',
    view_func=UserLogin.as_view('login')
)
users.add_url_rule(
    '/logout/',
    view_func=UserLogout.as_view('logout')
)
users.add_url_rule(
    '/github',
    view_func=login_github,
    endpoint='login_github'
)