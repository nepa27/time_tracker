import time
from datetime import datetime

from flask import flash, redirect, render_template, request, url_for
from flask_smorest import Blueprint
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
    verify_jwt_in_request
)
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
        try:
            verify_jwt_in_request(optional=True)
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 5, type=int)

            now_date = datetime.now().date()

            data = TimeTrackerModel.query.filter(
                TimeTrackerModel.username == get_jwt_identity()
            ).order_by(
                TimeTrackerModel.date.desc(),
                TimeTrackerModel.id.desc()
            )

            data_paginate = data.paginate(page=page, per_page=per_page)
            data_total_time = data.filter(TimeTrackerModel.date == now_date)
            total_time = sum_time(data_total_time.all())

            return render_template(
                'index.html',
                data=data_to_template(data),
                total_time=total_time,
                pagination=data_paginate
            )
        except BaseException:
            logger.info('Анонимный пользователь зашел на страницу')
            return render_template(
                'index.html',
                data=None,
                total_time=None,
                pagination=None
            )

    @blp.arguments(TimeTrackerSchema)
    @jwt_required()
    def post(self, data):
        time_obj = datetime.strptime(data['time'], '%H:%M:%S').time()
        date_obj = datetime.strptime(data['date'], '%d.%m.%Y').date()

        now_date = datetime.now().date()
        values = TimeTrackerModel.query.filter(
            TimeTrackerModel.date == now_date,
            TimeTrackerModel.username == get_jwt_identity()
        )
        name_of_work = data['name_of_work']
        for value in values:
            if value.name_of_work == name_of_work:
                result_time = sum_time(value.time, time_obj)
                value.time = result_time
                db.session.commit()
                logger.info(
                    f'Обновлены данные по задаче {name_of_work}.'
                    f' Время: {result_time}'
                )

                return {'message': 'Item from BD has UPDATE'}, 204

        work = TimeTrackerModel(
            name_of_work=name_of_work,
            date=date_obj,
            time=time_obj,
            username=get_jwt_identity()
        )
        db.session.add(work)
        db.session.commit()
        logger.info(f'Данные по задаче {name_of_work} добавлены в БД')

        return {'message': 'Data add in BD'}, 201


@blp.route('/edit/<username>/<date>/<name_of_work>', endpoint='edit')
class EditData(MethodView):
    @jwt_required()
    def get(self, username, name_of_work, date):
        date = datetime.date(datetime.strptime(date, '%d.%m.%Y'))
        data = TimeTrackerModel.query.filter(
            TimeTrackerModel.name_of_work == name_of_work,
            TimeTrackerModel.date == date,
            TimeTrackerModel.username == get_jwt_identity()
        ).first()
        if data:
            if data.username == get_jwt_identity():
                return render_template(
                    'edit.html',
                    data=data
                )
            else:
                return {'message': 'You don`t have permission'}, 403
        return {'message': 'Page doesn`t exist'}, 404

    @jwt_required()
    def post(self, username, name_of_work, date):
        date = datetime.date(datetime.strptime(date, '%Y-%m-%d'))
        work_data = TimeTrackerModel.query.filter(
            TimeTrackerModel.name_of_work == name_of_work,
            TimeTrackerModel.date == date,
            TimeTrackerModel.username == get_jwt_identity()
        ).first()
        form_data = request.form.to_dict()

        time_obj = datetime.strptime(form_data['time'], '%H:%M:%S').time()
        date_obj = datetime.strptime(form_data['date'], '%Y-%m-%d').date()

        try:
            old_name = work_data.name_of_work
            work_data.name_of_work = form_data['name_of_work']
            work_data.date = date_obj
            work_data.time = time_obj
            db.session.commit()
        except sqlalchemy.exc.IntegrityError:
            error_message = ('Нельзя создать два одинаковых '
                             'объекта для одной даты')
            logger.error(error_message)
            db.session.rollback()
            flash(
                error_message,
                category='error'
            )
            return redirect(url_for(
                'timer.edit',
                username=get_jwt_identity(),
                name_of_work=name_of_work,
                date=date
            ))
        else:
            logger.info(f'Измененны данные по задаче {old_name}.'
                        f' Название: {work_data.name_of_work},'
                        f' Время: {work_data.time},'
                        f' Дата: {work_data.date}.')
            return redirect(url_for('timer.home'))


@blp.route('/delete/<username>/<date>/<name_of_work>', methods=['DELETE'], endpoint='delete')
@jwt_required()
def delete_item(username, date, name_of_work):
    date = datetime.date(datetime.strptime(date, '%d.%m.%Y'))
    TimeTrackerModel.query.filter(
        TimeTrackerModel.name_of_work == name_of_work,
        TimeTrackerModel.date == date,
        TimeTrackerModel.username == get_jwt_identity()
    ).delete()
    db.session.commit()
    logger.info(f'Удалена задача: name = {name_of_work}'
                f', date = {date}')
    return {'message': 'Task has delete'}, 204
