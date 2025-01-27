import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app

USERNAME = 'test'
PASSWORD = 'testpass'


@pytest.fixture(scope='module')
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
    })
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


@pytest.fixture()
def register(client):
    response = client.post(
        '/register/',
        data={
            'username': USERNAME,
            'password': PASSWORD
        }
    )


@pytest.fixture()
def token(client):
    response = client.post(
        '/login/',
        data={
            'username': 'wwww',
            'password': 'wwwwww'
        }
    )
    return response.headers['Set-Cookie'].split('=')[1]


@pytest.fixture()
def create_work(client, token):
    response = client.post(
        '/',
        headers={
            'Autorization': token,
            'Content-Type': 'application/json'},
        json={
            'name_of_work': 'Test',
            'time': '01:40:34',
            'date': '24.01.2025'
        }
    )

@pytest.fixture()
def update_work(client, token):
    response = client.post(
        '/edit/2025-01-24/Test',
        headers={'Autorization': token,},
        data={
            'name_of_work': 'newTest',
            'time': '01:41:34',
            'date': '25.01.2025'
        }
    )

@pytest.fixture()
def delete_work(client, token):
    response = client.delete(
        '/delete/2025-01-24/Test',
        headers={'Autorization': token}
    )
