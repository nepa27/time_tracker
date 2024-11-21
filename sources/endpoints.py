from datetime import datetime, time, timedelta

from flask import render_template, redirect, request, url_for
from flask_smorest import Blueprint
from flask.views import MethodView

from config import db
from models import TimeTrackerModel
from utils.utils import sum_time
from schemas import TimeTrackerSchema


blp = Blueprint(
    'timer',
    __name__,
    description='Timer work time'
)


@blp.route('/', endpoint='home')
class HomePage(MethodView):
    def get(self):
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        now_date = datetime.now().date()
        data_time = TimeTrackerModel.query.filter(
            TimeTrackerModel.date == now_date
        ).order_by('time')

        data = TimeTrackerModel.query.order_by(
            TimeTrackerModel.id.desc()
        ).paginate(page=page, per_page=per_page)
        total_time = sum_time(data_time.all())

        return render_template(
            'index.html',
            data=data,
            total_time=total_time,
            pagination=data
        )

    @blp.arguments(TimeTrackerSchema)
    def post(self, data):
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

        return {'message': 'Data add in BD'}, 201


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
