"""Модуль, содержащий эндпоинты взаимодействия с пользователями"""

from datetime import datetime

import sqlalchemy
from flask import abort, flash, redirect, render_template, request, url_for
from flask.views import MethodView
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
    verify_jwt_in_request,
)
from pydantic import ValidationError

from config import db, logger
from models import TimeTrackerModel
from schemas import TimeTrackerSchema
from utils.utils import data_to_statistic, data_to_json, parse_date, sum_time


class ReadCreateWorksView(MethodView):
    """Представление для просмотра и добавления новых дел."""

    def get(self):
        """Представление для просмотра дел."""
        return render_template('index.html')

    @jwt_required()
    def post(self):
        """Представление для добавления новых дел."""
        try:
            data = TimeTrackerSchema(**request.get_json()).model_dump()
        except ValidationError as err:
            logger.error(err)
            abort(400)
        time_obj = datetime.strptime(data['time'], '%H:%M:%S').time()
        date_obj = parse_date(data['date'])

        now_date = datetime.now().date()
        name_of_work = data['name_of_work']
        value = TimeTrackerModel.query.filter(
            TimeTrackerModel.date == now_date,
            TimeTrackerModel.username == get_jwt_identity(),
            TimeTrackerModel.name_of_work == name_of_work,
        ).first()

        if value:
            value.time = time_obj
            db.session.commit()
            logger.info(
                f'Обновлены данные по задаче "{name_of_work}"'
                f' Время: {time_obj}'
            )

            return {'message': 'Item from BD has UPDATE'}, 204
        try:
            work = TimeTrackerModel(
                name_of_work=name_of_work,
                date=date_obj,
                time=time_obj,
                username=get_jwt_identity(),
            )
            db.session.add(work)
            db.session.commit()
            logger.info(f'Данные по задаче "{name_of_work}" добавлены в БД')

            return {'message': 'Data add in BD'}, 201
        except BaseException as e:
            logger.error(
                f'Ошибка при добавлении задачи: {e}'
            )
            abort(400)


class EditWorksView(MethodView):
    """Представление для редактирования дел."""

    @jwt_required()
    def get(self, name_of_work, date):
        """Представление для отображения формы редактирования дела."""
        try:
            date = parse_date(date)
        except ValueError as e:
            logger.error(e)
            abort(400)

        data = TimeTrackerModel.query.filter(
            TimeTrackerModel.name_of_work == name_of_work,
            TimeTrackerModel.date == date,
        ).first()
        if data:
            if data.username == get_jwt_identity():
                return render_template('edit.html', data=data)
            else:
                return abort(403)
        return abort(404)

    @jwt_required()
    def post(self, name_of_work, date):
        """Представление для редактирования дела."""
        try:
            form_data = TimeTrackerSchema(**request.form.to_dict()).model_dump()
        except ValidationError as err:
            errors = [str(err['msg']) for err in err.errors()]
            error = errors[0].split('error,')[1]
            logger.error(error)
            flash(error, category='error')
            return redirect(
                url_for(
                    'timer.edit',
                    username=get_jwt_identity(),
                    name_of_work=name_of_work,
                    date=date,
                )
            )
        date = parse_date(date)
        work_data = TimeTrackerModel.query.filter(
            TimeTrackerModel.name_of_work == name_of_work,
            TimeTrackerModel.date == date,
            TimeTrackerModel.username == get_jwt_identity(),
        ).first()
        try:
            time_obj = datetime.strptime(form_data['time'], '%H:%M:%S').time()
            date_obj = parse_date(form_data['date'])

            old_name = work_data.name_of_work
            work_data.name_of_work = form_data['name_of_work']
            work_data.date = date_obj
            work_data.time = time_obj
            db.session.commit()
        except sqlalchemy.exc.IntegrityError:
            error_message = (
                'Нельзя создать два одинаковых ' 'объекта для одной даты'
            )
            logger.error(error_message)
            db.session.rollback()
            flash(error_message, category='error')
            return redirect(
                url_for(
                    'timer.edit',
                    username=get_jwt_identity(),
                    name_of_work=name_of_work,
                    date=date,
                )
            )
        except ValueError as e:
            logger.error(e)
            db.session.rollback()
            flash('Ошибка при сохранении даты или времени!', category='error')
            return redirect(
                url_for(
                    'timer.edit',
                    username=get_jwt_identity(),
                    name_of_work=name_of_work,
                    date=date,
                )
            )
        else:
            logger.info(
                f'Изменены данные по задаче "{old_name}".'
                f' Название: {work_data.name_of_work},'
                f' Время: {work_data.time},'
                f' Дата: {work_data.date}.'
            )
            return redirect(url_for('timer.home'))


@jwt_required()
def delete_works(date, name_of_work):
    """Представление для удаления дела."""
    date = parse_date(date)
    if TimeTrackerModel.query.filter(
        TimeTrackerModel.name_of_work == name_of_work,
        TimeTrackerModel.date == date,
        TimeTrackerModel.username == get_jwt_identity(),
    ).delete():
        db.session.commit()
        logger.info(
            f'Удалена задача: name = {name_of_work}' f', date = {date}'
        )
        return {'message': 'Task has delete'}, 204
    logger.error(
        f'Ошибка при удалении задачи: name = {name_of_work}' f', date = {date}'
    )
    abort(400)


@jwt_required()
def get_statistics():
    """Представление для отображения страницы статистики."""
    return render_template('statistics.html')


@jwt_required()
def api_data():
    """Возвращает набора данных обо всех делах из БД."""
    try:
        verify_jwt_in_request(optional=True)
        now_date = datetime.now().date()

        start = request.args.get('_start', type=int)
        end = request.args.get('_end', type=int)

        data = TimeTrackerModel.query.filter(
            TimeTrackerModel.username == get_jwt_identity()
        ).order_by(TimeTrackerModel.date.desc(), TimeTrackerModel.id.desc())

        data_total_time = data.filter(TimeTrackerModel.date == now_date)

        data = data.offset(start).limit(end)
        data_task_names = TimeTrackerModel.query.group_by(
            'name_of_work'
        ).filter(TimeTrackerModel.username == get_jwt_identity())

        task_names = [result.name_of_work for result in data_task_names]
        total_time = sum_time(data_total_time.all()).strftime('%H:%M:%S')

        return {
            'data': data_to_json(data),
            'total_time': total_time,
            'task_names': task_names,
        }, 200
    except BaseException as e:
        logger.info(f'Ошибка при получении данных: {e}')
        abort(500)


@jwt_required()
def api_statistics():
    """Возвращает набора данных из БД для статистики."""
    try:
        date_from = request.args.get('from', type=str)
        date_to = request.args.get('to', type=str)

        date_from = parse_date(date_from)
        date_to = parse_date(date_to)

        verify_jwt_in_request(optional=True)
        data = TimeTrackerModel.query.filter(
            TimeTrackerModel.username == get_jwt_identity(),
            TimeTrackerModel.date >= date_from,
            TimeTrackerModel.date <= date_to,
        )

        return {
            'data': data_to_statistic(data),
        }, 200
    except BaseException as e:
        logger.info(f'Ошибка при получении данных: {e}')
        abort(500)
