Organization, structure and usage
=================================
The application has two core parts, the UI which is web based and the back-end which is Python based and is essentially a web server.

The UI
---------
The UI can be found inside of the _/templates/_ and _/static/_ folders.

Inside the _/templates/_ folder is a single HTML page, which is the main webpage served to the user whenever the application is accessed. The reason for the page being in this folder is because Flask requires the pages to be server by itself to be inside this folder. In theory, more pages could be added here in the future and server by Flask if the application were to be extended to be a multi-page affair (a settings page maybe?).

The _/static/_ folder is broken down further into _/css/_ (self explanatory) and _/js/_.

_/js/_ contains core application code and dependencies. Below is a breakdown of the core application code:

__events.js__. This file contains all of the JS code that is called because an event has occurred. Events such as when a node is tapped, the label area of the UI is changed (the user has input a label to be imposed on an element) and so forth is all included here. This is __not__ where code is called by the server.

__serverConnection.js__. The code in this file must fulfil one of two criterion:
- It must send a request or data to the server
- It handles requests or data by the server
