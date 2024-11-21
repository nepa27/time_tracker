from datetime import time, timedelta


def sum_time(*args):
    total_seconds = 0
    for arg in args:
        if isinstance(arg, list):  # Проверяем, является ли аргумент списком
            for value in arg:
                total_seconds += int(timedelta(
                    hours=value.time.hour,
                    minutes=value.time.minute,
                    seconds=value.time.second
                ).total_seconds())
        else:  # Если это не список, предполагаем, что это одиночный объект
            total_seconds += int(timedelta(
                hours=arg.hour,
                minutes=arg.minute,
                seconds=arg.second
            ).total_seconds())

    result_time = time(
        total_seconds // 3600,
        (total_seconds % 3600) // 60,
        total_seconds % 60
    )

    return result_time
