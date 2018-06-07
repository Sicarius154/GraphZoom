'''
    Wrriten by Chris London

    This file is called by Flask and will serve as the main event manager for the UI
'''
from flask import Flask, render_template
from flask_socketio import SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'key123'
socketio = SocketIO(app)

@app.route('/')
def root():
    return render_template("index.html")

@app.route('/help')
def help():
    return render_template("help.html")

@socketio.on('SetGraphData')
def setGraphData():
    pass

@socketio.on('GetGraphData')
def getGraphData():
    pass

@socketio.on('TestEvent')
def test():
    print("Test event from UI")

#Start the application
if __name__ == '__main__':
    socketio.run(app)
