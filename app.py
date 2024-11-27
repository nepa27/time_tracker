from config import app, db, logger
from sources.endpoints import blp as timer
from sources.user import blp as user


def create_app():
    with app.app_context():
        db.create_all()
        logger.info('Создана БД')
    app.register_blueprint(timer)
    app.register_blueprint(user)
    logger.info(f'Зарегистрирован {timer, user}')


if __name__ == '__main__':
    create_app()
    app.run()
