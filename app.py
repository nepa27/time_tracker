from config import app, db
from sources.endpoints import blp as timer


def create_app():
    with app.app_context():
        db.create_all()
    app.register_blueprint(timer)


if __name__ == '__main__':
    create_app()
    app.run()
