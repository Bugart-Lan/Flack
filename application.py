import os
import requests
import json

from flask import Flask, jsonify, session, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

current = 'Channel 1'
channels = ['Channel 1', 'Channel 2', 'Channel 3', 'Channel 4']
dialogs = {'Channel 1': [{'message': "Hello_world! This is a new website", 'name': "name"}],
        'Channel 2': [], 'Channel 3': [], 'Channel 4': []}

@app.route("/")
def index():
    return render_template("index.html", channels = channels, dialogs = dialogs, first = channels[0])

@socketio.on("new message")
def add_new_message(data):
    message = data['message']
    name = data['name']
    dialogs[current].append(data)
    print(dialogs)
    if len(dialogs[current]) > 100:
        dialogs[current].pop(0)
    emit('broadcast_new_message', {'message': message, 'name': name}, broadcast=True)

@app.route("/change_channel/<name>")
def change_channel(name):
    global current
    current = name
    return json.dumps(dialogs[name])

if __name__ == "__main__":
    socketio.run(app)
