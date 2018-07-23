/*
Code in this file is responsible for starting the graph object with Cytoscape; it contains all variables that will be used by other functions
todolist:
//TODO: Store the JSON objects used to construct elements and settings for cytoscape in JSON files
//TODO: Move some logic to a new file, specifically the logic needed for interacting with the server
*/

//these two values will be integers that store the next value to be used as an ID
var nextNodeId = 0;
var nextEdgeId = 0;

//Used to communicate with the Python server
var socket = null;

//The graph object
var cy = null;

//Determines if the graph is a poset
var isPoset = true;
var posetNodeYCord = 100;
var posetEdgeYCord = 400;

//This is used to store the 2 most recently selected elements, in the order they were selected.
//We use this and not the inbuilt CytoScape functions as they return the selected elements, but not in the order they were selected. Which we need for relations
var selectedForPair = new Array();
//this will be used to store the elements of a relation whilst it is being created
var relationData = [];
//Used to reference other files with absolute path
var scriptFolder = null;

//Used to keep track of the sub-graph data
var subGraphData = {nodes:[]}
/*
Called once the <body> of the index.html loads. Sets up the graph object and assigns
event handlers
*/
function start(){
  //Get the folder path of the script for later use when opening a new window
  var scriptEls = document.getElementsByTagName( 'script' );
  var thisScriptEl = scriptEls[scriptEls.length - 1];
  var scriptPath = thisScriptEl.src;
  scriptFolder = scriptPath.substr(0, scriptPath.lastIndexOf( '/' )+1 );

  //Before we do anything else we need to connect to the python server; this function returns the socket object we need
  connectToServer()

  //create the cytoscape objct and set the styling requirements
  cy = cytoscape(
    {
      container: document.getElementById('graph-area'),
      style: [
        {
          selector: "node",
          style :
          {"text-valign": "center",
          "text-halign": "center",
          "label": "data(label)"
        }
      },
      {
        selector: "edge",
        style:
        {
          "curve-style": "bezier",
          "label": "data(label)"
        }
      },
      {
        selector: ".relationEdge",
        style:
        {
          "line-color": "red",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
        }
      },
      {
        selector: ".relationNode",
        style:
        {
          "background-color": "red",
        }
      },
      {
        selector: ".overlappingNode",
        style:
        {
          "background-color" : "yellow",
        }
      },
      {
        selector: ".subgraphNode",
        style:
        {
          "background-color" : "green",
        }
      }
    ]
  }
  );

  //set up the grid layout and enable snap-to-grid plugin
  cy.layout({
    name: 'grid',
    fit: true,
    padding: 30,
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
    fit: true,
    rows: 2
  }).start();
  cy.snapToGrid({strokeStyle: "white", gridSpacing: 200, lineWidth: .5, lineDash: [10, 0], rows: 2});
  cy.snapToGrid("gridOn");

  //Add event handlers
  cy.on('tap', 'node', nodeSelectedEvt);
  cy.on('tap', 'edge', edgeSelectedEvt);
  cy.on('free', 'node', nodeFreeEvt);
  cy.on('position', 'node', nodePositionChangeEvt)
}

/*
Just for testing purposes
*/
function testFunc(){
  ShowGraphInNewWindow();
}

/*
  This will completely wipe the graph
*/
function clearGraph(){
  console.log("Clearing graph");
  //Reset all of the data being stored about the graph
  selectedForPair = new Array();
  relationData = [];
  subGraphData = []

  //Delete all elements
  cy.elements().remove();

  //clear any data being displayed on the UI
  document.getElementById("subgraphElementsTextArea").value = "";
  document.getElementById("relationPairsTextArea").value = "";
  document.getElementById("idInputTextArea").value = "";
  document.getElementById("labelTextInputArea").value = "";
  document.getElementById("findElementlabelTextArea").value = "";
  document.getElementById("findElementIdTextArea").value = "";
}

/*
  Wipes the graph and creates a new session
*/
function newGraph(){
  window.location.reload()
}
