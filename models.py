from sqlalchemy import UniqueConstraint

from config import db

from constants import LENGHT_STRING


class TimeTrackerModel(db.Model):
    __tablename__ = 'time_tracker'

    id = db.Column(
        db.Integer,
        primary_key=True
    )
    name_of_work = db.Column(
        db.String,
        nullable=False
    )
    date = db.Column(
        db.Date(),
        nullable=False
    )
    time = db.Column(
        db.Time(),
        nullable=False
    )
    description = db.Column(
        db.String(LENGHT_STRING),
        nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            'name_of_work',
            'date',
            name='un_name_date'
        ),
    )
