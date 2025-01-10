from flask_smorest import Blueprint

from sources.endpoints import (
    HomePage,
    EditData,
    delete_item,
    get_statistics,
    api_data,
    api_statistics,
)
from sources.user import UserRegister, UserLogin, UserLogout


timer = Blueprint('timer', __name__, description='Timer work time')
users = Blueprint('users', __name__, description='Operations with users')


timer.add_url_rule(
    '/',
    view_func=HomePage.as_view('home')
)
timer.add_url_rule(
    '/edit/<date>/<name_of_work>',
    view_func=EditData.as_view('edit')
)
timer.add_url_rule(
    '/delete/<date>/<name_of_work>',
    view_func=delete_item,
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
    '/api/data/start=<int:start>&end=<int:end>/',
    methods=('GET',),
    view_func=api_data,
    endpoint='api_data'
)
timer.add_url_rule(
    '/api/statistics/',
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
