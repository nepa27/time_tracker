from datetime import time, timedelta, datetime

from flask import abort

from constants import TO_HOUR, TO_MINUTE, TO_SEC
from config import logger


def sum_time(*args) -> time:
    """Функция складывает время."""
    total_seconds = 0
    try:
        for arg in args:
            if isinstance(arg, list):
                for value in arg:
                    total_seconds += int(
                        timedelta(
                            hours=value.time.hour,
                            minutes=value.time.minute,
                            seconds=value.time.second,
                        ).total_seconds()
                    )
            else:
                total_seconds += int(
                    timedelta(
                        hours=arg.hour, minutes=arg.minute, seconds=arg.second
                    ).total_seconds()
                )

        result_time = time(
            total_seconds // TO_HOUR,
            (total_seconds % TO_HOUR) // TO_MINUTE,
            total_seconds % TO_SEC,
        )

        return result_time
    except ValueError as e:
        logger.info(f'Ошибка суммировании общего времени: {args} {e}')
        abort(500)


def data_to_json(data) -> dict:
    """Функция преобразует данные из БД в JSON."""
    result_data = {}

    for value in data:
        date = value.date.strftime('%d.%m.%Y')
        time_data = value.time.strftime('%H:%M:%S')
        if date in result_data:
            result_data[date][value.name_of_work] = time_data
        else:
            result_data[date] = {value.name_of_work: time_data}

    return result_data


def data_to_statistic(data) -> dict:
    """Функция преобразует данные из БД в JSON для статистики."""
    result_data = {}

    for value in data:
        name = value.name_of_work
        date = value.date.strftime('%d.%m.%Y')
        time_data = value.time.strftime('%H:%M:%S')

        if name not in result_data:
            result_data[name] = []

        result_data[name].append({date: time_data})
    return result_data


def data_to_obsidian(data) -> str:
    """Функция преобразует данные из БД в строку для Obsidian."""
    result_data = ''

    for value in data:
        name = value.name_of_work
        date = value.date.strftime('%d.%m.%Y')
        time_data = value.time.strftime('%H:%M:%S')

        if name not in result_data:
            result_data += (f'- <span style="background:#affad1">{name}'
                            f'</span>: <u>{date}</u> - *{time_data}*\n')
    return result_data


def parse_date(date_str):
    """Функция преобразует строку в дату в зависимости от формата."""
    formats = ('%d.%m.%Y', '%Y-%m-%d')
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    raise ValueError(f'Дата {date_str} некорректного формата.')
