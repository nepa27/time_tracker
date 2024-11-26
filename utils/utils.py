from datetime import time, timedelta

from constants import TO_HOUR, TO_MINUTE, TO_SEC


def sum_time(*args) -> time:
    """ Функция складывает время. """
    total_seconds = 0
    for arg in args:
        if isinstance(arg, list):
            for value in arg:
                total_seconds += int(timedelta(
                    hours=value.time.hour,
                    minutes=value.time.minute,
                    seconds=value.time.second
                ).total_seconds())
        else:
            total_seconds += int(timedelta(
                hours=arg.hour,
                minutes=arg.minute,
                seconds=arg.second
            ).total_seconds())

    result_time = time(
        total_seconds // TO_HOUR,
        (total_seconds % TO_HOUR) // TO_MINUTE,
        total_seconds % TO_SEC
    )

    return result_time


def data_to_template(data) -> dict:
    """ Функция преобразует данные из БД в словарь. """
    result_data = {}

    for value in data:
        date = value.date
        temp = []
        for el in data:
            if el.date == date:
                temp.append((el.id, el.name_of_work, el.time))
        date = date.strftime("%d.%m.%Y")
        result_data[date] = temp

    return result_data
