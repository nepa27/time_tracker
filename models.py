from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

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
    proj_id = db.Column(
        db.Integer,
        ForeignKey('projects.id'),
        nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            'name_of_work',
            'date',
            name='un_name_date'
        ),
    )
    project = relationship(
        'ProjectsModel',
        back_populates='time_trackers'
    )


class ProjectsModel(db.Model):
    __tablename__ = 'projects'

    id = db.Column(
        db.Integer,
        primary_key=True
    )
    name_of_proj = db.Column(
        db.String,
        nullable=False
    )

    time_trackers = relationship(
        'TimeTrackerModel',
        back_populates='project'
    )
