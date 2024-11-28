from datetime import date

from config import db

from constants import (
    LENGHT_STRING,
    LENGHT_USERNAME,
    LENGHT_PASSWORD,
    LENGHT_TOKEN,
    LENGHT_JTI
)


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
    username = db.Column(
        db.Integer,
        db.ForeignKey('users.username')
    )

    __table_args__ = (
        db.UniqueConstraint(
            'name_of_work',
            'date',
            'username',
            name='un_name_date_user'
        ),
    )

    user = db.relationship(
        'UserModel',
        back_populates='time_tracker'
    )


class UserModel(db.Model):
    __tablename__ = 'users'

    id = db.Column(
        db.Integer,
        primary_key=True
    )
    username = db.Column(
        db.String(LENGHT_USERNAME),
        nullable=False,
        unique=True
    )
    password = db.Column(
        db.String(LENGHT_PASSWORD),
        nullable=False
    )
    time_tracker = db.relationship(
        'TimeTrackerModel',
        back_populates='user'
    )


class BlocklistJwt(db.Model):
    __tablename__ = 'blocklistjwt'

    id = db.Column(
        db.Integer,
        primary_key=True
    )
    jti = db.Column(
        db.String(LENGHT_JTI),
        nullable=False,
        index=True
    )
    created_at = db.Column(
        db.Date,
        default=date.today,
        nullable=False
    )
