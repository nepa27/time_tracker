from datetime import datetime, time, timedelta


def sum_time(*args):
    total_seconds = 0
    for arg in args:
        for value in arg:
            timedelta_bd = timedelta(
                hours=value.time.hour,
                minutes=value.time.minute,
                seconds=value.time.second
            )
            total_seconds += int(timedelta_bd.total_seconds())

    result_time = time(
        total_seconds // 3600,
        (total_seconds % 3600) // 60,
        total_seconds % 60
    )

    return result_time