# Time tracker - таймер учета рабочего времени
[![Python](https://img.shields.io/badge/-Python-464646?style=flat-square&logo=Python)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/-JavaScript-464646?style=flat-square&logo=JavaScript)](https://www.javascript.com/)
[![Flask](https://img.shields.io/badge/-Flask-464646?style=flat-square&logo=Flask)](https://flask.palletsprojects.com/)
[![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy-464646?style=flat-square&logo=SQLAlchemy)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/-JSON%20Web%20Tokens-464646?style=flat-square&logo=json-web-tokens)](https://jwt.io/)
[![nginx](https://img.shields.io/badge/-nginx-464646?style=flat-square&logo=nginx)](https://www.nginx.com/)
[![gunicorn](https://img.shields.io/badge/-gunicorn-464646?style=flat-square&logo=gunicorn)](https://gunicorn.org/)
[![docker](https://img.shields.io/badge/-Docker-464646?style=flat-square&logo=docker)](https://www.docker.com/)
[![GitHub%20Actions](https://img.shields.io/badge/-GitHub%20Actions-464646?style=flat-square&logo=GitHub%20actions)](https://github.com/features/actions)


## Описание
Добро пожаловать в приложение Time Tracker - ваше универсальное решение для оптимизации работы с рабочим временем!

Наша программа предлагает интуитивно понятный и функциональный интерфейс, который позволяет отслеживать свои ежедневные 
задачи в режиме реального времени, обеспечивая максимальную продуктивность и управление временем. Используя Time Tracker,
вы сможете легко отслеживать проекты, распределение задач, контролировать свой прогресс, идентифицировать области улучшения 
и сократить рабочие процессы.

## Основные особенности
- Возможность отслеживать свои ежедневные задачи в режиме реального времени;
- Возможность внесения изменений в уже созданные задачи;
- Отслеживание статистики в удобном графическом виде.

## Стек использованных технологий
+ Python 3.11
+ JavaScript
+ Flask
+ SQLAlchemy
+ SQLite
+ JWT
+ Jinja2
+ Nginx
+ Gunicorn
+ CI/CD

## Запуск проекта
### Локальное развертывание
Во-первых установите Python и pip (команды для Ubuntu).
```
sudo apt-get install python
sudo apt-get install pip
```
Создайте виртуальное окружение
```
python -m venv venv
source venv/bin/activate    # (Ubuntu)
./venv/Scripts/python       # (Windows)
```
Затем установите необходимые зависимости из файла requirements.txt
```
pip install -r requirements.txt
```

### Запуск
+ Клонируйте репозиторий и перейдите в него с помощью командной строки:
```
git clone git@github.com:nepa27/time_tracker.git
cd time_tracker
```
+ Установите и активируйте виртуальное окружение c учетом версии Python 3.11:

```
python3 -m venv env
либо
python -m venv venv
```
* Если у вас Linux/macOS

```
source env/bin/activate
```

* Если у вас Windows

```
source venv/Scripts/activate
```
```
python -m pip install --upgrade pip
```

+ Затем установите зависимости из файла requirements.txt:

```
pip install -r requirements.txt
```

+ Запускаем проект:

```
gunicorn -c gunicorn_config.py 'app:create_app()'
```
Если вы все правильно сделали, то высветится приглашение
```
 * Serving Flask app 'config'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment.
Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```
Откройте браузер и перейдите по адресу http://127.0.0.1:5000/

## Автор
+ [Александр Непочатых](https://github.com/nepa27)
+ [Всеволод Могучий](https://github.com/seva123321)
