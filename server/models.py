from sqlalchemy_serializer import SerializerMixin
from config import db
import bcrypt

# Association table for the many-to-many relationship between User and Group
group_member = db.Table('group_member',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True)
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    
    serialize_rules = ('-password_hash', '-events', '-sent_invitations', '-received_invitations', '-comments', '-rsvps', '-groups')

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    events = db.relationship('Event', back_populates='user', cascade="all, delete-orphan")
    comments = db.relationship('Comment', back_populates='user', cascade="all, delete-orphan")
    rsvps = db.relationship('RSVP', back_populates='user', cascade="all, delete-orphan")
    groups = db.relationship('Group', secondary=group_member, back_populates='members')
    sent_invitations = db.relationship('GroupInvitation', foreign_keys='GroupInvitation.user_id', back_populates='inviter', cascade="all, delete-orphan")
    received_invitations = db.relationship('GroupInvitation', foreign_keys='GroupInvitation.invited_user_id', back_populates='invitee', cascade="all, delete-orphan")

    def add_group(self, group):
        if group not in self.groups:
            self.groups.append(group)
            db.session.commit()

class Event(db.Model, SerializerMixin):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates='events')
    comments = db.relationship('Comment', back_populates='event', cascade="all, delete-orphan")
    rsvps = db.relationship('RSVP', back_populates='event', cascade="all, delete-orphan")

    serialize_rules = ('-comments', '-rsvps', '-user')

class RSVP(db.Model, SerializerMixin):
    __tablename__ = 'rsvps'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)

    user = db.relationship('User', back_populates='rsvps')
    event = db.relationship('Event', back_populates='rsvps')

    serialize_rules = ('-user', '-event')

class Comment(db.Model, SerializerMixin):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)

    user = db.relationship('User', back_populates='comments')
    event = db.relationship('Event', back_populates='comments')

    serialize_rules = ('-user', '-event')

class Group(db.Model, SerializerMixin):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    members = db.relationship('User', secondary=group_member, back_populates='groups')
    invitations = db.relationship('GroupInvitation', back_populates='group', cascade="all, delete-orphan")

    serialize_rules = ('-invitations', 'members.username')


class GroupInvitation(db.Model, SerializerMixin):
    __tablename__ = 'group_invitations'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    invited_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)

    inviter = db.relationship('User', foreign_keys=[user_id], back_populates='sent_invitations')
    invitee = db.relationship('User', foreign_keys=[invited_user_id], back_populates='received_invitations')
    group = db.relationship('Group', back_populates='invitations')

    serialize_rules = ('-inviter', '-invitee', '-group')

