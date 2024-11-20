from datetime import datetime, time, timedelta

from flask import render_template, request
from flask_smorest import Blueprint
from flask.views import MethodView

from config import db
from models import TimeTrackerModel

blp = Blueprint(
    'timer',
    __name__,
    description='Timer work time'
)


@blp.route('/', endpoint='home')
class HomePage(MethodView):
    def get(self):
        return render_template(
            'index.html',
            data=TimeTrackerModel.query.all()
        )

    def post(self):
        data = request.json
        time_obj = datetime.strptime(data['time'], '%H:%M:%S').time()
        date_obj = datetime.strptime(data['date'], '%d.%m.%Y').date()

        values = TimeTrackerModel.query.all()
        for value in values:
            if value.name_of_work == data['name_of_work']:
                timedelta_bd = timedelta(
                    hours=value.time.hour,
                    minutes=value.time.minute,
                    seconds=value.time.second
                )
                timedelta_form = timedelta(
                    hours=time_obj.hour,
                    minutes=time_obj.minute,
                    seconds=time_obj.second
                )

                total_seconds = int(
                    (timedelta_bd + timedelta_form).total_seconds()
                )
                result_time = time(
                    total_seconds // 3600,
                    (total_seconds % 3600) // 60,
                    total_seconds % 60
                )

                value.time = result_time
                db.session.commit()
                db.session.close()

                return {'message': 'Item from BD has UPDATE'}, 204

        work = TimeTrackerModel(
            name_of_work=data['name_of_work'],
            date=date_obj,
            time=time_obj,
        )
        db.session.add(work)
        db.session.commit()
        db.session.close()

        return {'message': 'Ok'}, 204
