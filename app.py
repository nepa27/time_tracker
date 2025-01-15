from config import app, db, logger
from sources.urls import github_bp, timer,users


def create_app():
    with app.app_context():
        db.create_all()
        logger.info('Создана БД')
    app.register_blueprint(timer)
    app.register_blueprint(users)
    app.register_blueprint(github_bp, url_prefix='/login')
    logger.info(f'Зарегистрирован {timer, users}')


if __name__ == '__main__':
    create_app()
    app.run(port=5001)
