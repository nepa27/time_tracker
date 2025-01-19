"""Модуль, инициализирующий объект приложения Flask."""
from config import app, db, logger
from sources.urls import github_bp, timer,users


def create_app():
    """Функция инициализации приложения."""
    with app.app_context():
        db.create_all()
        logger.info('Создана БД')
    app.register_blueprint(timer)
    app.register_blueprint(users)
    app.register_blueprint(github_bp, url_prefix='/login')
    logger.info(f'Зарегистрирован {timer, users}')
    return app
