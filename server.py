'''
    Wrriten by Chris London

    This file is called by Flask and will serve as the main event manager for the UI
'''
from flask import Flask, render_template
from flask_socketio import SocketIO
from graph import Graph
app = Flask(__name__)
app.config['SECRET_KEY'] = 'key123'
app.config['DEBUG'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True
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
    graph.set_graph_from_json(json)

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

'''
    This shows that the client-side has now connected to the server; once this happens
    the server will shutdown
'''
@socketio.on('disconnect')
def disconnect():
    print("Client disconnected to the server!")
    #TODO: Shut downt the server

@socketio.on('saveNewRelation')
def save_new_relation(json):
    graph.add_relation_from_json(json)

#Start the application
if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.config.update(DEBUG=True, TEMPLATES_AUTO_RELOAD=True)
    from werkzeug.debug import DebuggedApplication
    app.wsgi_app = DebuggedApplication(app.wsgi_app, True)
    env.cache = None
    socketio.run(app, TEMPLATES_AUTO_RELOAD=True, DEBUG=True)
