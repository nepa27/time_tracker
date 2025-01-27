def test_request_home_page_anonymous(client):
    response = client.get('/')
    assert response.status_code == 200


def test_request_home_page_user(client, register, token):
    response = client.get('/', headers={
        'Autorization': token
    })
    assert response.status_code == 200


def test_request_statistics_anonymous(client):
    response = client.get('/statistics/')
    assert response.status_code == 302


def test_request_statistics_user(client, register, token):
    response = client.get('/statistics/', headers={
        'Autorization': token
    })
    assert response.status_code == 200


def test_get_api_data_anonymous(client):
    response = client.get('/api/data')
    assert response.status_code == 302


def test_get_api_data_user(client, register, token):
    response = client.get('/api/data', headers={
        'Autorization': token
    })
    assert response.status_code == 200


def test_get_api_statistics_anonymous(client):
    response = client.get('/api/statistics')
    assert response.status_code == 302

def test_request_edit_anonymous(client):
    response = client.get('/edit/2025-01-24/Test')
    assert response.status_code == 302

def test_request_edit_user(client, create_work):
    response = client.get('/edit/2025-01-24/Test')
    assert response.status_code == 200


#__TEST__CONTENT__

def test_content_home_page_anonymous(client):
    response = client.get('/')
    assert ('Используйте навигационную панель'
            ' для доступа к вашему профилю') in response.text


def test_content_home_page_user(client, register, token):
    response = client.get('/', headers={
        'Autorization': token
    })
    assert 'Список дел' in response.text


def test_content_statistics_anonymous(client):
    response = client.get('/statistics/')
    assert response.status_code == 302


def test_content_statistics_user(client, register, token):
    response = client.get('/statistics/', headers={
        'Autorization': token
    })
    assert '<title>Статистика</title>' in response.text


def test_get_content_api_data_user(client, register, token):
    response = client.get('/api/data', headers={
        'Autorization': token
    })
    assert isinstance(response.json, dict)
