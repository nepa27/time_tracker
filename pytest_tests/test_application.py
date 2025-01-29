from db import db
from models import TimeTrackerModel, UserModel


def test_request_home_page_anonymous(client):
    response = client.get('/')
    assert response.status_code == 200


def test_request_home_page_user(client, token):
    response = client.get('/', headers={'Authorization': token})
    assert response.status_code == 200


def test_request_post_home_page_user(client, token, create_work):
    assert create_work.status_code == 201


def test_request_statistics_anonymous(client):
    response = client.get('/statistics/')
    assert response.status_code == 302


def test_request_statistics_user(client, token):
    response = client.get('/statistics/', headers={'Authorization': token})
    assert response.status_code == 200


def test_get_api_data_anonymous(client):
    response = client.get('/api/data')
    assert response.status_code == 302


def test_get_api_data_user(client, token):
    response = client.get('/api/data', headers={'Authorization': token})
    assert response.status_code == 200


def test_get_api_statistics_anonymous(client):
    response = client.get('/api/statistics')
    assert response.status_code == 302


def test_request_edit_anonymous(client):
    response = client.get('/edit/2025-01-24/Test')
    assert response.status_code == 302


def test_request_edit_user(client, token):
    response = client.get('/edit/2025-01-24/Test')
    assert response.status_code == 200


def test_request_post_edit_user(client, update_work):
    assert update_work.status_code == 302


def test_request_post_anonymous(client):
    response = client.post('/edit/2025-01-24/Test')
    assert response.status_code == 302


def test_request_delete_anonymous(client):
    response = client.delete('/delete/25.01.2025/newTest')
    assert response.status_code == 302


def test_request_delete_user(client, delete_work):
    assert delete_work.status_code == 204


# __TEST__CONTENT__


def test_content_home_page_anonymous(client):
    response = client.get('/')
    assert (
        'Используйте навигационную панель' ' для доступа к вашему профилю'
    ) in response.text


def test_content_home_page_user(client, token):
    response = client.get('/', headers={'Authorization': token})
    assert 'Список дел' in response.text


def test_content_statistics_user(client, token):
    response = client.get('/statistics/', headers={'Authorization': token})
    assert '<title>Статистика</title>' in response.text


def test_content_api_data_user(client, token):
    response = client.get('/api/data', headers={'Authorization': token})
    assert isinstance(response.json, dict)


def test_content_edit_user(client, create_work, token):
    response = client.get('/edit/2025-01-24/Test')
    assert 'Обновить задачу' in response.text


def test_check_test_data(app):
    with app.app_context():
        test_data = TimeTrackerModel.query.filter(
            TimeTrackerModel.name_of_work == 'Test',
            TimeTrackerModel.date == '2025-01-24',
        ).delete()
        test_user = UserModel.query.filter(
            UserModel.username == 'test',
        ).delete()

        db.session.commit()
        assert test_data == 1
        assert test_user == 1
