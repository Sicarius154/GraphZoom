# Dependencies
Before installation read through all of the dependencies and ensure they are installed. After the description of the dependencies there is a brief step-by-step on how to install all of the necessary files and libraries. Most of this is done using pip.

Front end and UI
----------------

Many of the dependencies required for the UI are included automatically, and do not need updating. All of the files in _/static/js/dependencies_ should be left as they are, and not updated or altered; below is a list of included files and their uses:

- Bootstrap.*
  * Used for making the UI responsive and look nice.
- Cytoscape.js
  * Used for the rendering and management of graph elements. This is required for the drawing and manipulation of the graph
    and it is the main engine for the UI. [Link to the GitHub repository for Cytoscape JS](https://github.com/cytoscape/cytoscape.js?files=1)
- Cytoscape-Grid-Guide.js
  * Used for the snapping of Cytoscape elements to a grid, which is used for the partially ordered set functionality. [Link to the Github repository for Cytoscap-Grid-Guide](https://github.com/iVis-at-Bilkent/cytoscape.js-grid-guide)
- Jquery.*
  * A static version of JQuery used by Cytoscape, Bootstrap and the core functionality of the UI.
- Require.js
  * REDUNDANT - To be removed.
- Socket.io.js
  * Used for interacting with the Python Flask server. This is the backbone of the application, all data transmission is done through this. [Link to the website](https://socket.io/)

Back end and core
-----------------
The back end dependencies may need to be installed using pip. The libraries listed here are only the ones that you will need to install. The program makes use of various other standard modules such as _os, datetime, io_ which should already be included.

- Flask
  * This is used to allow the server to run. Flask is a micro-framework that allows for basic serving of webpages.
- Flask Socket IO
  * This is the library that goes on top of Flask to allow for interaction with web sockets. [Link to the Github repository](https://github.com/miguelgrinberg/Flask-SocketIO)
- Gevent
  * An additional dependency for Flask that replaces the development server

Installation
=============
You will require:
- Python 3.6 or higher
- PIP to be fully functional
- A modern browser such as Chrome

Follow these steps to install the application:
1. Download the GitHub repository as a ZIP folder
2. Extract the contents of the ZIP folder to a location of your choice (this is where the application will be 'installed')
3. Open a terminal/Powershell
4. Type `pip install flask`
5. Type `pip install flask_socketio`
6. Type `pip install gevent`
7. To verify the installation is complete, run the appropriate SH/.bat file for your OS `OS_start.xx`
8. Navigate to 127.0.0.1 in your browser. If you see the UI, the application is installed.
