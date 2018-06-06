# GraphZoom

# Installation
<h2>Dependencies</h2>
To install the software, ensure the following dependencies are installed:

- Flask 1.0 or greater
- Python 3.3 or greater
- Numpy 1.14.3 or greater
- NetworkX 2.1 or greater

All dependencies required for the UI (JQuery, CytoScape and so forth are included already. <b>do not</b> alter these versions)

To run the UI use an updated, modern browser such as Chrome. 

<h2>Installing the program</h2>
Because the program consists of scripts mainly, there is no need to directly <i>install</i> anything. Simply download the provided zip folder, extract it to a desired location and run the script defined for your OS (run.bat for Windows, run.sh for Linux and Mac)

# Usage
Use the run script to start the program. This starts the Flask server, opens the UI, and initiates all of the code needed to start the program.
If you run the script but your browser does not automatically open the webpage/UI simply browse to 127.0.0.1:5000 in your browser. 
# Development and maintenance

<h2>The UI</h2>
The UI has been written with HTML, CSS and JS. All of the related files for the UI are in the <i>static</i> and <i>templates</i> folders. 
Cytoscape is used for drawing, manipulating and rendering the graph. Most of the code needed for rendering and interacting with the graph itself is included in main.js.
Code relating to interacting with the back-end of the software is included in BackConnect.js.
