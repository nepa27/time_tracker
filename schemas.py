import re

from pydantic import BaseModel, validator

from constants import LENGHT_NAME


class TimeTrackerSchema(BaseModel):
    name_of_work: str
    time: str
    date: str

    @validator('name_of_work')
    def validate_name_of_work(cls, name):
        if len(name) > LENGHT_NAME or not re.match("^[a-zA-Z0-9\sА-Яа-яЁё]*$", name):
            raise ValueError(
                'Название проекта может содержать только буквы'
                ' и цифры, а также не превышать '
                f'{LENGHT_NAME} символов'
            )
        return name
