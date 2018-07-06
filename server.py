'''
    Wrriten by Chris London

    This file is called by Flask and will serve as the main event manager for the UI
'''
from flask import Flask, render_template, request
from flask_socketio import SocketIO
from graph import Graph
app = Flask(__name__)
app.config['SECRET_KEY'] = 'key123'
app.config['DEBUG'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True
socketio = SocketIO(app)
graph = Graph() #this will be the graph object for this session

@app.route('/')
def root():
    '''
        Routes a user to the correct html page
    '''
    return render_template("index.html")

@socketio.on('SetGraphData')
def setGraphData(json):
    '''
        This will set the elements of the graph object to the new values from the UIself.
        The param should be a JSON object in the agreed-upon construction
        :param json: The JSON string containing all of the graph data
    '''
    print("New graph data received") #log to the console
    graph.set_graph_from_json(json)

@socketio.on('GetGraphData')
def getGraphData():
    '''
        This should send a JSON object representing the entire graph to the client-side
        It should emit the correct event. After this has been sent the UI is free to display the graph
    '''
    print("Sending requested graph data")
    socketio.emit('NewGraphData', graph.getJSONRepresentation(), json=True)

@socketio.on('connect')
def connect():
    '''
        This shows that the client-side has now connected to the server
    '''
    print("Client connected to the server!")

@socketio.on('disconnect')
def disconnect():
    '''
        A client terminated the connection
    '''
    print("Client disconnected to the server!")

@socketio.on('shutdown')
def shutdown():
    '''
        Shut down the server, Save the current graph as an auto-save and terminate Flask
    '''
    print("Sutting down the server...")
    #TODO: Implement saving functionality
    socketio.stop()
    


@socketio.on('saveNewRelation')
def save_new_relation(json):
    '''
        Set the relation data from a JSON string
        :param json: The JSON string containing the relation data
    '''
    print("New relation data received")
    graph.add_relation_from_json(json)

#Start the application
if __name__ == "__main__":
        socketio.run(app)
