'''
    Wrriten by Chris London

    This file is called by Flask and will serve as the main event manager for the UI
'''
from flask import Flask, render_template, request
from flask_socketio import SocketIO
import os
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
        :returns: Renders the index template file
    '''
    print("Main UI requested. Rendering...")
    return render_template("index.html")

@socketio.on('set_graph_data')
def set_graph_data(json):
    '''
        This will set the elements of the graph object to the new values from the UIself.
        The param should be a JSON object in the agreed-upon construction
        :param json: The JSON string containing all of the graph data
    '''
    print("New graph data received") #log to the console
    graph.set_graph_from_json(json)
    print("Graph data sent to the front-end")

@socketio.on('get_graph_data')
def get_graph_data():
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
    print("Client disconnected from the server!")

@socketio.on('shutdown')
def shutdown():
    '''
        Shut down the server, Save the current graph as an auto-save and terminate Flask
    '''
    print("Sutting down the server...")
    #TODO: Implement saving functionality
    os._exit(0)

@socketio.on('save_new_relation')
def save_new_relation(json):
    '''
        Set the relation data from a JSON string
        :param json: The JSON string containing the relation data
    '''
    print("New relation data received")
    graph.add_relation_from_json(json)
    print("New relation set for the current graph")

@socketio.on('get_results_of_operation')
def get_results_of_operation():
        '''
            Returns a graph as JSON to the front end that is supposed to represent the results of an operation(dilation, erosion etc) on the main graph.
        '''
        print("Front-end requested results of the previous operation to display (requested by new window displaying graphresult.html).")
        socketio.emit("received_results_of_operation", graph.get_operation_results_as_json())
        print("Data sent to the front-end")
#Start the application
if __name__ == "__main__":
        socketio.run(app)
