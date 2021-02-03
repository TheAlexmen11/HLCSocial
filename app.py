from os import name
from flask import Flask, json,render_template,redirect,request,jsonify,url_for
from flask_socketio import SocketIO, rooms,leave_room,join_room
from model import Room,User
from uuid import uuid4

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socket = SocketIO(app)

#index
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/link_create_room',methods=['post'])
def link_create_room():
    name_room = request.form['name_room'].strip()
    if  name_room == "":
        result = jsonify(state='error',result='campo vacio')
    else:
        if name_room in Room.rooms:
            result = jsonify(state='error',result='Ese nombre ya esta siendo usado')    
        else:
            result = jsonify(state='ok',result=name_room)
            room = Room(name_room)
            Room.rooms.append(room)
    return result

@app.route('/<name_room>')
def link_join_room(name_room):
    print(Room.rooms)
    if name_room in Room.rooms:
        print("hay?")
        result = render_template('room.html')
    else:
        print(" noa hay nadie loco xd")
        return redirect(url_for('index'))
    return result
#index

#socketio
@socket.on('join_in_room')
def join_in_room(data):
    name_room = data['name_room']
    join_room(name_room)
    room = Room.get_room(name_room)
    if room != None:
        user = User('myname',request.sid,room)#creamos usuario
        room.users.append(user)#aumentamos el numero de usuarios en el salon
        User.users.append(user)#almacenamos usuario
        print(User.users)
        socket.emit('message',{
            'action':'join',
            'message':f'{user.nickname} se acaba de unir'
        },room=name_room)
        socket.emit('add_user',{
                "id_users": (' ').join([i.id_user for i in room.users]),
                "nickname": (' ').join([i.nickname for i in room.users])
                },
            room=name_room)
    
@socket.on('message')
def message(data):
    user = User.get_user(request.sid)
    room = user.room
    socket.emit('message',{
        'action':'message',
        'user':user.nickname,
        'message':data["message"]
    },room=room.name_room)

@socket.on('change_name')
def change_name(data):
    new_name = data['name']
    user = User.get_user(request.sid)
    if user != None:
        name = user.nickname
        user.nickname = new_name
        socket.emit('change_name',{
            'id_user':request.sid,
            'nickname':new_name
        },
        room = user.room.name_room)

        socket.emit('message',{
            'action':'name',
            'message':f"{name} ha cambiado a {new_name}"
        },room = user.room.name_room)
@socket.on('disconnect')
def disconnect():
    user = User.get_user(request.sid)
    if user != None:
        room = user.room
        leave_room(room.name_room)
        socket.emit('message',{
            'action':'leave',
            'message':f'{user.nickname} se ha ido'
        },room=room.name_room)
        socket.emit('delete_name',{
            'id_user':request.sid
        },room=room.name_room)
        User.eliminate_user(request.sid)#eliminamos el usuario
        room.delete_user(request.sid)
        if len(room.users) == 0:
            Room.eliminate_room(room.name_room)#eliminamos el salon si ya no queda nadie

#socketio

if __name__ == '__main__':
    socket.run(app,debug=True)