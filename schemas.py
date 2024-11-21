from marshmallow import fields, Schema


class TimeTrackerSchema(Schema):
    name_of_work = fields.Str(required=True)
    time = fields.Str(required=True)
    date = fields.Str(required=True)
