from datetime import datetime

from flask import render_template, request
from flask_smorest import Blueprint
from flask.views import MethodView
import sqlalchemy

from config import db, logger
from models import TimeTrackerModel
from utils.utils import data_to_template, sum_time
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
            TimeTrackerModel.date.desc(),
            TimeTrackerModel.id.desc()
        ).paginate(page=page, per_page=per_page)
        total_time = sum_time(data_time.all())

        return render_template(
            'index.html',
            data=data_to_template(data),
            total_time=total_time,
            pagination=data
        )

    @blp.arguments(TimeTrackerSchema)
    def post(self, data):
        time_obj = datetime.strptime(data['time'], '%H:%M:%S').time()
        date_obj = datetime.strptime(data['date'], '%d.%m.%Y').date()

        now_date = datetime.now().date()
        values = TimeTrackerModel.query.filter(
            TimeTrackerModel.date == now_date
        )
        name_of_work = data['name_of_work']
        for value in values:
            if value.name_of_work == name_of_work:
                result_time = sum_time(value.time, time_obj)
                value.time = result_time
                db.session.commit()
                logger.info(f'Обновлены данные по задаче {name_of_work}. Время: {result_time}')
                db.session.close()

                return {'message': 'Item from BD has UPDATE'}, 204

        work = TimeTrackerModel(
            name_of_work=name_of_work,
            date=date_obj,
            time=time_obj,
        )
        db.session.add(work)
        db.session.commit()
        logger.info(f'Данные по задаче {name_of_work} добавлены в БД')
        db.session.close()

        return {'message': 'Data add in BD'}, 201


@blp.route('/edit/<int:work_id>', endpoint='edit')
class EditData(MethodView):
    def get(self, work_id):
        data = TimeTrackerModel.query.filter(
            TimeTrackerModel.id == work_id
        )
        return render_template(
            'edit.html',
            data=data
        )

    def post(self, work_id):
        work_data = TimeTrackerModel.query.get_or_404(work_id)
        form_data = request.form.to_dict()

        time_obj = datetime.strptime(form_data['time'], '%H:%M:%S').time()
        date_obj = datetime.strptime(form_data['date'], '%Y-%m-%d').date()

        old_name = work_data.name_of_work

        work_data.name_of_work = form_data['name_of_work']
        work_data.date = date_obj
        work_data.time = time_obj

        try:
            db.session.commit()
        except sqlalchemy.exc.IntegrityError as e:
            error_info = 'Нельзя создать два одинаковых объекта для одной даты.'
            logger.error(f'{error_info}')
            db.session.rollback()
            error_message = f'{error_info}'
            return {'message': error_message}, 400

        logger.info(f'Измененны данные по задаче {old_name}.'
                    f' Название: {work_data.name_of_work},'
                    f' Время: {work_data.time},'
                    f' Дата: {work_data.date}.')
        db.session.close()
        return {'message': 'Task has update'}, 204


@blp.route('/delete/<int:work_id>', methods=['DELETE'], endpoint='delete')
def delete_item(work_id):
    TimeTrackerModel.query.filter(
        TimeTrackerModel.id == work_id
    ).delete()
    db.session.commit()
    logger.info(f'Удалена задаче с id = {work_id}')
    return {'message': 'Task has delete'}, 204
