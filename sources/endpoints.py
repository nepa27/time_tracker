from datetime import datetime, time, timedelta

from flask import render_template, redirect, request, url_for
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
        date_obj = datetime.strptime(data['date'], '%Y-%m-%d').date()

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

        return {'message': 'Data add in BD'}, 204


@blp.route('/edit/<int:work_id>', endpoint='edit')
class EditData(MethodView):
    def get(self, work_id):
        data = TimeTrackerModel.query.filter(
            TimeTrackerModel.id == work_id
        )
        return render_template('edit.html', data=data)

    def post(self, work_id):
        work_data = TimeTrackerModel.query.get_or_404(work_id)
        form_data = request.form.to_dict()

        time_obj = datetime.strptime(form_data['time'], '%H:%M:%S').time()
        date_obj = datetime.strptime(form_data['date'], '%Y-%m-%d').date()

        work_data.name_of_work = form_data['name_of_work']
        work_data.date = date_obj
        work_data.time = time_obj

        db.session.commit()
        db.session.close()
        return redirect(url_for('timer.home'))


@blp.route('/delete/<int:work_id>', methods=['DELETE'], endpoint='delete')
def delete_item(work_id):
    TimeTrackerModel.query.filter(
        TimeTrackerModel.id == work_id
    ).delete()
    db.session.commit()
    return {'message': 'Task has delete'}, 204
