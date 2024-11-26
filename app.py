from config import app, db, logger
from sources.endpoints import blp as timer


def create_app():
    with app.app_context():
        db.create_all()
        logger.info('Создана БД')
    app.register_blueprint(timer)
    logger.info(f'Зарегистрирован {timer}')


if __name__ == '__main__':
    create_app()
    app.run()
