Organization, structure and usage
=================================
The application has two core parts, the UI which is web based and the back-end which is Python based and is essentially a web server.

The UI
---------
The UI can be found inside of the _/templates/_ and _/static/_ folders.

Inside the _/templates/_ folder is a single HTML page, which is the main webpage served to the user whenever the application is accessed. The reason for the page being in this folder is because Flask requires the pages to be server by itself to be inside this folder. In theory, more pages could be added here in the future and served by Flask if the application were to be extended to be a multi-page affair (a settings page maybe?).

The _/static/_ folder is broken down further into _/css/_ (self explanatory) and _/js/_.

_/js/_ contains core application code and dependencies. Below is a breakdown of the core application code:

__events.js__. This file contains all of the JS code that is called because an event has occurred. Events such as when a node is tapped, the label area of the UI is changed (the user has input a label to be imposed on an element) and so forth is all included here. This is __not__ where code is called by the server.

__serverConnection.js__. The code in this file must fulfil one of two criterion:
- It must send a request or data to the server
- It handles requests or data sent by the server

The functions in this file are either used to send data to the server or are set as handlers for when data is incoming. The way the sockets work is that either the UI or server will emit a request, with a request name that will then be handled by a function. For example, the "ui_set_graph_data" event is called by the server and handled by the UI. (Note in the request names, the first word will be either "ui" or "server". This is the side that will handle the request). In short, any function that either sends or receives a request to the server is in here.

__ui.js__. This file contains all of the code that adds, removes, modifies or otherwise interacts with the Cytoscape graph, interacts with the webpage (updating the node ID label area for example) or contains any other function that will alter the UI in any way.

__data.js__. In here you will find any functions that alter the data being stored on the UI side in anyway. When a new ordered pair is added to a relation, the relationData variable will be altered and this should be done here. Any time an element is removed from the subgraph, the function to remove it from the array is in here.

__main.js__. In here you will find the first function that is called when the `body` has loaded which creates and styles the Cytoscap graph, all event handlers are initiated here too. All variables used throughout the program are also declared here. ID management, clearing of the graph and creating a new graph are done here too.
