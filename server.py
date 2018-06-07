'''
    Wrriten by Chris London

    This file is called by Flask and will serve as the main event manager for the UI
'''
from flask import Flask, render_template
from flask_socketio import SocketIO
from graph import Graph
app = Flask(__name__)
app.config['SECRET_KEY'] = 'key123'
socketio = SocketIO(app)
graph = Graph() #this will be the graph object for this session

'''
    Routes a user to the correct html page
'''
@app.route('/')
def root():
    return render_template("index.html")

'''
    This will set the elements of the graph object to the new values from the UIself.
    The param should be a JSON object in the agreed-upon construction
'''
@socketio.on('SetGraphData')
def setGraphData(json):
    graph.setGraphFromJSON(json)

'''
    This should send a JSON object representing the entire graph to the client-side
    It should emit the correct event. After this has been sent the UI is free to display the graph
'''
@socketio.on('GetGraphData')
def getGraphData():
    socketio.emit('NewGraphData', graph.getjJSONRepresentation(), json=True)

'''
    This shows that the client-side has now connected to the server
'''
@socketio.on('connect')
def connect():
    print("Client connected to the server!")
    graph.addVertex(('n1', 1, 1, "hi"))
    graph.addVertex(('n2', 10, 1, "hi"))
    graph.addVertex(('n4', 20, 1, "hi"))
    graph.addEdge(('e1','n1', 'n2', "edge1"))
    getGraphData()

'''
    This shows that the client-side has now connected to the server; once this happens
    the server will shutdown
'''
@socketio.on('disconnect')
def disconnect():
    print("Client disconnected to the server!")
    #TODO: Shut downt the server

#Start the application
if __name__ == '__main__':
    socketio.run(app)
