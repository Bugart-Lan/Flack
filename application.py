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

channels = ['Channel 1', 'Channel 2', 'Channel 3', 'Channel 4']
dialogs = {'Channel 1': [{'message': "Hello_world! This is a new website", 'name': "name", 'timestamp': 'January 1, 1997, 12:00'}],
        'Channel 2': [], 'Channel 3': [], 'Channel 4': []}

@app.route("/")
def index():
    return render_template("index.html", channels = channels, dialogs = dialogs, first = channels[0])

@app.route("/get_channels")
def get_channels():
    return json.dumps(channels)

@socketio.on("new message")
def add_new_message(data):
    print(0)
    message = data['message']
    name = data['name']
    channel = data['channel']
    timestamp = data['timestamp']
    file = data['file']
    dialogs[channel].append(data)
    if len(dialogs[channel]) > 100:
        dialogs[channel].pop(0)
    emit('broadcast_new_message', {'message': message, 'name': name, 'timestamp': timestamp,
                                    'channel': channel, 'file': file}, broadcast=True)

@app.route("/load_channel/<name>")
def load_channel(name):
    return json.dumps(dialogs[name])

@app.route("/add_new_channel/<name>")
def add_new_channel(name):
    channels.append(name)
    dialogs[name] = []
    return jsonify(success = True)

if __name__ == "__main__":
    socketio.run(app)
