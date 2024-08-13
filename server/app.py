from flask import request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_restful import Resource
from models import User, Event, Group, RSVP, Comment, GroupInvitation
from config import app, db, api

# Initialize JWT
jwt = JWTManager(app)

# Register Resource
class Register(Resource):
    def post(self):
        data = request.get_json()
        if User.query.filter_by(username=data['username']).first() is not None:
            return {"message": "Username already exists"}, 400
        if User.query.filter_by(email=data['email']).first() is not None:
            return {"message": "Email already registered"}, 400

        new_user = User(username=data['username'], email=data['email'])
        new_user.password = data['password']  # This will hash the password
        db.session.add(new_user)
        db.session.commit()
        return {"message": "User registered successfully"}, 201

# Login Resource
class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user is None or not user.check_password(data['password']):
            return {"message": "Invalid username or password"}, 401

        access_token = create_access_token(identity=user.id)
        return {"access_token": access_token}, 200

# Event Resources
class EventList(Resource):
    def get(self):
        events = Event.query.all()
        return [{
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "location": event.location,
            "description": event.description,
            "user_id": event.user_id
        } for event in events], 200

    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data = request.get_json()
        new_event = Event(
            name=data['name'],
            date=data['date'],
            location=data['location'],
            description=data['description'],
            user_id=current_user_id
        )
        db.session.add(new_event)
        db.session.commit()
        return {"message": "Event created successfully", "event": new_event.id}, 201

class EventDetail(Resource):
    def get(self, event_id):
        event = Event.query.get_or_404(event_id)
        return {
            "name": event.name,
            "date": event.date,
            "location": event.location,
            "description": event.description,
            "user_id": event.user_id
        }, 200

    @jwt_required()
    def put(self, event_id):
        current_user_id = get_jwt_identity()
        event = Event.query.get_or_404(event_id)

        if event.user_id != current_user_id:
            return {"message": "You do not have permission to update this event"}, 403

        data = request.get_json()
        event.name = data.get('name', event.name)
        event.date = data.get('date', event.date)
        event.location = data.get('location', event.location)
        event.description = data.get('description', event.description)

        db.session.commit()
        return {"message": "Event updated successfully"}, 200

    @jwt_required()
    def delete(self, event_id):
        current_user_id = get_jwt_identity()
        event = Event.query.get_or_404(event_id)

        if event.user_id != current_user_id:
            return {"message": "You do not have permission to delete this event"}, 403

        db.session.delete(event)
        db.session.commit()
        return {"message": "Event deleted successfully"}, 200

# Group Resources
class GroupList(Resource):
    def get(self):
        groups = Group.query.all()
        return [{
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "user_id": group.user_id
        } for group in groups], 200

    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data = request.get_json()
        new_group = Group(name=data['name'], description=data['description'], user_id=current_user_id)
        db.session.add(new_group)
        db.session.commit()
        return {"message": "Group created successfully", "group": new_group.id}, 201

class GroupDetail(Resource):
    def get(self, group_id):
        group = Group.query.get_or_404(group_id)
        return {
            "name": group.name,
            "description": group.description,
            "user_id": group.user_id
        }, 200

# Group Invitations
class GroupInvite(Resource):
    @jwt_required()
    def post(self, group_id):
        current_user_id = get_jwt_identity()
        group = Group.query.get_or_404(group_id)

        if group.user_id != current_user_id:
            return {"message": "You do not have permission to invite users to this group"}, 403

        data = request.get_json()
        invited_user = User.query.get_or_404(data['invited_user_id'])

        new_invitation = GroupInvitation(
            group_id=group.id,
            user_id=current_user_id,
            invited_user_id=invited_user.id,
            status='pending'
        )
        db.session.add(new_invitation)
        db.session.commit()
        return {"message": "Invitation sent successfully"}, 201

class GroupInvitations(Resource):
    @jwt_required()
    def get(self, group_id):
        group = Group.query.get_or_404(group_id)
        invitations = GroupInvitation.query.filter_by(group_id=group_id).all()
        return [{
            "id": invitation.id,
            "user_id": invitation.user_id,
            "invited_user_id": invitation.invited_user_id,
            "status": invitation.status
        } for invitation in invitations], 200

# RSVP Resources
class RSVPList(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data = request.get_json()
        new_rsvp = RSVP(
            user_id=current_user_id,
            event_id=data['event_id'],
            status=data['status']
        )
        db.session.add(new_rsvp)
        db.session.commit()
        return {"message": "RSVP created successfully", "rsvp": new_rsvp.id}, 201

class EventRSVPs(Resource):
    def get(self, event_id):
        rsvps = RSVP.query.filter_by(event_id=event_id).all()
        return [{
            "id": rsvp.id,
            "user_id": rsvp.user_id,
            "status": rsvp.status
        } for rsvp in rsvps], 200

# Comment Resources
class CommentList(Resource):
    @jwt_required()
    def post(self, event_id):
        current_user_id = get_jwt_identity()
        data = request.get_json()
        new_comment = Comment(
            content=data['content'],
            user_id=current_user_id,
            event_id=event_id
        )
        db.session.add(new_comment)
        db.session.commit()
        return {"message": "Comment added successfully", "comment": new_comment.id}, 201

class EventComments(Resource):
    def get(self, event_id):
        comments = Comment.query.filter_by(event_id=event_id).all()
        return [{
            "id": comment.id,
            "content": comment.content,
            "user_id": comment.user_id
        } for comment in comments], 200

# Add the resources to the API
api.add_resource(Register, '/register')
api.add_resource(Login, '/login')
api.add_resource(EventList, '/events')
api.add_resource(EventDetail, '/events/<int:event_id>')
api.add_resource(GroupList, '/groups')
api.add_resource(GroupDetail, '/groups/<int:group_id>')
api.add_resource(GroupInvite, '/groups/<int:group_id>/invite')
api.add_resource(GroupInvitations, '/groups/<int:group_id>/invitations')
api.add_resource(RSVPList, '/rsvps')
api.add_resource(EventRSVPs, '/events/<int:event_id>/rsvps')
api.add_resource(CommentList, '/events/<int:event_id>/comments')
api.add_resource(EventComments, '/events/<int:event_id>/comments')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
