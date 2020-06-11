import os
import requests
import json

from flask import Flask, jsonify, session, render_template, request
from flask_session import Session
from flask_socketio import SocketIO, emit
from time import asctime, localtime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

channels = ['announcements', 'general']
dialogs = {'announcements': [], 'general': []}

@app.route("/")
def index():
    return render_template("index.html", channels = channels, dialogs = dialogs, first = channels[0])

@app.route("/get_channels")
def get_channels():
    return json.dumps(channels)

@socketio.on("new message")
def add_new_message(data):
    print(f"got data at {asctime(localtime())}")
    channel = data['channel']
    dialogs[channel].append(data)
    if len(dialogs[channel]) > 100:
        dialogs[channel].pop(0)
    emit('broadcast_new_message', data, broadcast=True)
    print(f"send data at {asctime(localtime())}")

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
