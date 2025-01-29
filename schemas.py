"""Модуль, содержащий схемы валидации."""

import re

from pydantic import BaseModel, field_validator

from constants import LENGHT_NAME


class TimeTrackerSchema(BaseModel):
    """Класс для схем валидации модели TimeTracker."""

    name_of_work: str
    time: str
    date: str

    @field_validator('name_of_work')
    def validate_name_of_work(cls, name: str) -> str:
        """Функция валидации названия дела."""
        if len(name) > LENGHT_NAME or not re.match(
            "^[\w\s!\"#@$%&()*+,-./:;<=>?[\]" "^_{|}~a-zA-Z0-9\sА-Яа-яЁё]*$",
            name,
        ):
            raise ValueError(
                'Название проекта не может превышать '
                f'{LENGHT_NAME} символов'
            )
        return name
