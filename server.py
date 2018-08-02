'''
    Wrriten by Chris London

    This file is called by Flask and will serve as the main event manager for the UI
'''
from flask import Flask, render_template, request
from flask_socketio import SocketIO
import os
from graph import Graph
import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)
app.config['SECRET_KEY'] = 'key123'
app.config['DEBUG'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True
socketio = SocketIO(app)
graph = Graph() #this will be the graph object for this session

@app.route('/')
def root():
    '''
        Routes a user to the correct html page
        :return: Renders the index template file
    '''
    new_graph()
    print("Main UI requested. Rendering...")
    return render_template("index.html")

@socketio.on('server_set_graph_data')
def set_graph_data(json):
    '''
        This will set the elements of the graph object to the new values from the UIself.
        The param should be a JSON object in the agreed-upon construction
        :param json: The JSON string containing all of the graph data
    '''
    print("New graph data received") #log to the console
    graph.set_graph_from_json(json)

@socketio.on('server_get_graph_data')
def get_graph_data():
    '''
        This should send a JSON object representing the entire graph to the client-side
        It should emit the correct event. After this has been sent the UI is free to display the graph
    '''
    print("Sending requested graph data")

    socketio.emit('ui_set_graph_data', graph.get_json_representation(), json=True)

@socketio.on('server_connect')
def connect():
    '''
        This shows that the client-side has now connected to the server
    '''
    print("Client connected to the server!")

@socketio.on('server_disconnect')
def disconnect():
    '''
        A client terminated the connection
    '''
    print("Client disconnected from the server!")

@socketio.on('server_shutdown')
def shutdown():
    '''
        Shut down the server, Save the current graph as an auto-save and terminate Flask
    '''
    print("Shutting down the server...")
    #TODO: Implement saving functionality
    os._exit(0)

@socketio.on('server_set_new_relation')
def save_new_relation(json):
    '''
        Set the relation data from a JSON string
        :param json: The JSON string containing the relation data
    '''
    print("New relation data received")
    graph.add_relation_from_json(json)
    print("New relation set for the current graph")

@socketio.on('server_get_results_of_operation')
def get_results_of_operation():
        '''
            Returns a graph as JSON to the front end that is supposed to represent the results of an operation(dilation, erosion etc) on the main graph.
        '''
        print("Front-end requested results of the previous operation to display (requested by new window displaying graphresult.html).")
        socketio.emit("ui_set_results_of_operation", graph.get_operation_results_as_json())
        print("Data sent to the front-end")

@socketio.on("server_save_graph")
def save_graph(path):
    '''
        Saves the graph to the 'saved' folder in the same relative folder as this script.
    '''
    #TODO: Allow for custom paths
    print("Save requested")
    path = os.path.join("/saved",path)
    #Ensure the filename has the correct file extension
    if path[-6:] != ".graph":
        path += ".graph"
    path = script_dir + path
    path = os.path.normpath(path)
    graph.save_graph(path)

@socketio.on("server_load_graph")
def load_graph(path):
    path = os.path.join("/saved",path)
    #Ensure the filename has the correct file extension
    if path[-6:] != ".graph":
        path += ".graph"
    path = script_dir + path
    path = os.path.normpath(path)
    graph.load_graph(os.path.normpath(path))
    get_graph_data() #update the front end using the pre-configured function to update the UI with a new graph

@socketio.on("server_set_subgraph_data")
def set_subgraph_data(json):
    print("New subgraph data received")
    graph.set_subgraph_from_json(json)

@socketio.on("server_get_subgraph_data")
def get_subgraph_data():
    socketio.emit("ui_set_subgraph_data", graph.sub_graph.get_json_representation())

@socketio.on("server_dilate_graph")
def dilate_graph():
    print("Dilating graph...")
    graph.operation_results = [] #Reset the operation results
    new_graph = graph.dilate()
    socketio.emit("ui_show_operation_results", new_graph.get_json_representation())

@socketio.on("server_erode_graph")
def erode_graph():
    print("Eroding graph...")
    graph.operation_results = [] #Reset the operation results
    new_graph = graph.erode()
    socketio.emit("ui_show_operation_results", new_graph.get_json_representation())

@socketio.on("server_close_graph")
def close_graph():
    print("Closing graph...")
    graph.operation_results = [] #Reset the operation results
    new_graph = graph.close()
    socketio.emit("ui_show_operation_results", new_graph.get_json_representation())

@socketio.on("server_open_graph")
def open_graph():
    print("Opening graph...")
    graph.operation_results = [] #Reset the operation results
    new_graph = graph.open()
    socketio.emit("ui_show_operation_results", new_graph.get_json_representation())
def new_graph():
    graph = Graph() #create a new graph object
#Start the application
if __name__ == "__main__":
    socketio.run(app)
