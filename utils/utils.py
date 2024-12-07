from datetime import time, timedelta, datetime

from constants import TO_HOUR, TO_MINUTE, TO_SEC


def sum_time(*args) -> time:
    """Функция складывает время."""
    total_seconds = 0
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


def data_to_json(data) -> dict:
    """Функция преобразует данные из БД в JSON."""
    result_data = {}

    for value in data:
        date = value.date
        temp = {}
        for el in data:
            if el.date == date:
                temp[el.name_of_work] = el.time.strftime('%H:%M:%S')
        date = date.strftime('%d.%m.%Y')
        result_data[date] = temp
    return result_data


def data_to_statistic(data) -> dict:
    """Функция преобразует данные из БД в JSON для статистики."""
    result_data = {}

    for value in data:
        name = value.name_of_work

        temp = []
        for el in data:
            if el.name_of_work == name:
                temp.append(
                    {
                        el.date.strftime('%d.%m.%Y'): el.time.strftime(
                            '%H:%M:%S'
                        )
                    }
                )
        result_data[name] = temp
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
