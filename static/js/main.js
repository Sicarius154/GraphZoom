/*
This file contains all logic that involves interacting with the elements of the page,
displaying data and so forth.
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
var relationData = {nodes:[], edges:[]};
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
This is called once a node has been selected. It displays the information of the most
recently selected node
*/
function showSelectedNodeData(node){
  //Update the information part of the information panel
  document.getElementById("idInputTextArea").value = node.id();
  document.getElementById("labelTextInputArea").value = node.data('label');
  //document.getElementById("labelInputArea").value =  node.data.label;
  console.log("Displaying element data with label " + node.data('label'));
}

/*
This is called once an edge has been selected. It displays the information of the most
recently selected edge
*/
function showSelectedEdgeData(edge){
  //Update the information part of the information panel
  document.getElementById("idInputTextArea").value = edge.id();
  document.getElementById("labelTextInputArea").value = edge.data('label');
  console.log("Displaying element data with label " + edge.data('label'));
}

/*
Changes wether labels are drawn on nodes or not depending on the user input
*/
function changeNodeLabelSettings(){
  if(document.getElementById("optionsShowNodeLabelsCheckbox").checked){
    cy.style().selector('node').style({"label": ""}).update();
  }else{
    cy.style().selector('node').style({"label": "data(label)"}).update();
  }
}

/*
Changes wether labels are drawn on edges or not depending on the user input
*/
function changeEdgeLabelSettings(){
  if(document.getElementById("optionsShowEdgeLabelsCheckbox").checked){
    cy.style().selector('edge').style({"label": ""}).update();
  }else{
    cy.style().selector('edge').style({"label": "data(label)"}).update();
  }
}

/*
Adds a node to the graph that has already been assigned all of the needed data. The param should be a subscriptable object with 4 values
*/
function addNode(node){
  cy.add({
    data:{
      id: node[0],
      label: node[3]
    },
    position:
    {
      x:node[1],
      y:node[2]
    }
  });
  console.log("Node added with ID: " + node[0] + " Label: " + node[3] + " Position x:" + node[1] + " y:" + node[2]);
  aphToServer(); //update the graph on the serverside
}

/*
Adds an edge to the graph that has already been assigned all of the needed data. The param should be a subscriptable object with 4 values
*/
function addEdge(edge){
  cy.add({
    data:{
      id: edge[0],
      label: edge[3],
      source: edge[1],
      target: edge[2]
    }
  });
  console.log("Edge added with ID: " + edge[0] + " Source: " + edge[1] + " Target: " + edge[2] + " Label:" + edge[3]);
  sendGraphToServer(); //update the graph on the serverside
}

/*
Adds a new node to the graph with a random ID number. It then selects the new node
*/
function addNewNode(){
  var node = {
    data:
    {
      id: "n" + nextNodeId,
      label: ""
    }
  };
  cy.add(node);

  //Select the new node and increment the next ID available
  cy.getElementById(node.data.id).select();
//  console.log("Added node " + 'n' + nextNodeId + " at position " + node.position.x + node.position.y);
  nextNodeId++;
  sendGraphToServer(); //update the graph on the serverside
}

/*
Adds a new edge between the first two elements in the selected nodes of the graph
*/
function addNewEdge(){
  //get the collection of all selected nodes, only the first two will be used
  selectedNodes = cy.$('node:selected');

  //if the second index is null assume that this is intended to be a loop
  if(typeof selectedNodes[1] == 'undefined' && typeof selectedNodes[0] != 'undefined'){
    selectedNodes[1] = selectedNodes[0];
  }

  //add the edge to the graph and log this in the console; increment the next id
  cy.add({data:{id: "e" + nextEdgeId, source: selectedNodes[0].id(), target: selectedNodes[1].id()}});
  console.log("Added edge " + 'e' + nextEdgeId + " with source: " + selectedNodes[0].id() + " and target: " + selectedNodes[1].id());
  nextEdgeId++;
  sendGraphToServer(); //update the graph on the serverside
}

/*
This will delete any selected element(s), edge or node.
*/
function deleteElement(){
  selectedNodes = []
  selectedElements = cy.$(':selected');
  cy.remove(selectedElements);
  sendGraphToServer(); //update the graph on the serverside
}

/*
Assigns a new ID to the element
*/
function assignLabel(id, newLabel){
  var node = cy.$('#' + id);
  cy.$('#' + id).data('label', newLabel);
  sendGraphToServer(); //update the graph on the serverside
}

/*
This will draw a poset. It takes two lists/arrays. The first should be all of the nodes,
INCLUDING the nodes that represent an array. It then takes a list of edges that show a connection between the nodes and edges
*/
function drawPoset(nodes, edges){
  nodes.forEach(function(node){
    addNode(node);
  });
  edges.forEach(function(edge){
    addEdge(edge);
  });
}

/*
Called when a node is tapped/clicked. This will select the node
*/
function nodeSelectedEvt(evt){
  console.log("Tapped on " + evt.target.id());
  showSelectedNodeData(cy.$('#' + evt.target.id()));
  var id = evt.target.id();
  //Now we want to keep track of the two most recently selected elements, so we add it to the array
  selectedForPair.push(id)
  //if the number of nodes being tracked is greater than 2 then remove the oldest element
  if(selectedForPair.length > 2){
    selectedForPair.shift()
  }
}

/*
Called when a edge is tapped/clicked. This will select the edge
*/
function edgeSelectedEvt(evt){
  console.log("Tapped on " + evt.target.id());
  showSelectedEdgeData(cy.$('#' + evt.target.id()));
}

/*
Called when a node changes position. Will check to see if the position is alreayd occupied by a node,
If the position is already occcupied then color this node YELLOW to indicate this to the user
//TODO: Fix this. It doesn't work.
*/
function nodePositionChangeEvt(evt){
/*
  var movedNode = cy.$('#' + evt.target.id());
  for(node in cy.nodes()){
    console.log("POINT")
    if(movedNode.position() == node.position){
      console.log("Node " + evt.target.id() + "with position "+ movedNode.position() + " is overlapping with another node with position" + node.position()+"Highliting node yellow");
      movedNode.addClass('overlappingNode');
      break;
    }else{
      movedNode.removeClass('overlappingNode');
    }
  }*/
}

/*
  Shows a graph in a new window. Ideal for showing results of operations on a graph without altering the
  original.
  The child window will grab the graphOperationResults variable declared at the top of this script. Ensure this has been updated before calling this function
*/
function ShowGraphInNewWindow(){
  //create the window object, we assume a size of 800x800 is enough.
  var w = window.open(scriptFolder+"graphresult.html", "Graph results", "height=500, width=800");
}

/*
Called when the textarea showing label information has its value changed
//TODO: Assigning labels does not work
*/
function labelAreaChangedEvt(){
  var id = document.getElementById("idInputTextArea").value;
  var label = document.getElementById("labelTextInputArea").value;
  console.log("Assigning label to " + id);
  assignLabel(id, label);
  sendGraphToServer(); //update the graph on the serverside
}

/*
Called when a node changes position in the graph; if the graph is
representing a poset then ensure the node is on one of two rows by snapping it to one of
the Y co-ordinates
//TODO: The function is called hundreds of times per node, need to check if this is a bug of mine or a library quirk
*/
function nodeFreeEvt(evt){
  var node = cy.$('#' + evt.target.id());
  if(isPoset == true){
    if(node.position('y') <= posetNodeYCord){
      cy.$('#' + node.id()).position("y", posetNodeYCord);
    }
    else{
      cy.$('#' + node.id()).position("y", posetEdgeYCord);
    }
  }
  return;
}

/*
Called when one of the radio buttons that determine the type of graph we are dealing with is changed
This will either enable/disable poset mode
//TODO: Need to ensure that two nodes don't snap ontop of each other
*/
function graphRadioChanged(){
  if(document.getElementById("isPosetRadio").checked == true){
    isPoset = true;
    cy.snapToGrid('snapOn');
  }else{
    isPoset = false;
    cy.snapToGrid('snapOff');
  }

  //Now we force the 'free' event to be triggered on every node in the graph,
  //so this triggers the nodeFreeEvt() functions to snap everything into place
  cy.$('node').emit('free');
}

/*
When called from the UI this will take the ID and Label input by the user. It will then 'select' all of the elements matching said criteria.
*/
function searchForElements(){
  var id  = document.getElementById("findElementIdTextArea").value;
  var label = document.getElementById("findElementlabelTextArea").value;
  if(id == "" || id == null) id = "*";
  if(label == "" || label == null) label = "*";
  console.log("Searching for elements with data:\
  id: " + id +
  "label: " + label);
  cy.$id(id).filter("[label=\"" + label +"\"]").select();

  //Clear up the search area
  document.getElementById("findElementlabelTextArea").value = "";
  document.getElementById("findElementIdTextArea").value = "";
}

/*
Connects to the python server
*/
function connectToServer(){
  socket = io.connect('http://' + document.domain + ':' + location.port);
  socket.on('server_connect', function(){
    console.log("Connected to the main server");
  });
  //Now lets set all of the event handlers
  socket.on('ui_set_graph_data', setGraphReceivedFromServer);
}

/*
Request graph data to be sent to the client
*/
function getGraphFromServer(){
  socket.emit('server_get_graph_data');
  console.log("Requesting graph from the server");
}

/*
This is called when the server send the graph data to the client
//TODO: Make this more efficient, maybe modify existing elements rather than remove and redraw them?
*/
function setGraphReceivedFromServer(json){
  console.log("Server has sent new graph data");

  //Delete all graph elements
  cy.$('*').select();
  deleteElement();
  console.log(json);
  //Add all of the new elements
  for(jsonElement in json){
    console.log("Adding " + jsonElement[0]);
    cy.add(jsonElement);
  }
}

/*
Creates a JSON representation of the graph and sends it to the server
*/
function sendGraphToServer(){
  console.log("Sending graph data to the server");
  //grab the edge and node data from the graph
  var rawNodeData = cy.nodes();
  var rawEdgeData = cy.edges();
  var nodeData = [];
  var edgeData = [];

  //Itterate over all of the graph elements and extract the data we care about
  rawNodeData.forEach(function(element){
    nodeData.push([element.id(), element.position('x'), element.position('y'), element.data('label')]);
  });

  rawEdgeData.forEach(function (element){
    //We only want to send edges that aren't relation edges
    if(!element.hasClass("relationEdge")){
      edgeData.push([element.id(), element.data('source'), element.data('target'), element.data('label')]);
    }
  });

  //construct a JSON object and send it to the server
  var graph = {nodes: nodeData, edges: edgeData, relations: relationData};
  socket.emit('server_set_graph_data', JSON.stringify(graph));
}

/*
Sends a JSON representation of the array containing the relation pairs.
This function first sends the graph data to the server to ensure both are up to date
*/
function sendRelationDataToServer(){
  console.log("Sending relation data to the server, setting the current relation for this graph to the currently selected one")
  dataToSend = {nodes: [], edges:[]};
  relationData.forEach(function(ele){
    dataToSend.nodes.push(ele[0]);
    dataToSend.nodes.push(ele[1]);
    dataToSend.edges.push(ele[0]+ele[1]+"_connection", ele[0], ele[1], "");
  });
  socket.emit('server_set_new_relation', JSON.stringify(relationData));
}

/*
Adds the 2 most recently clicked elements to relation data once the add button is clicked.
*/
function addPairToRelationData(){
  relationData.nodes.push(selectedForPair);
  relationData.edges.push([selectedForPair[0]+selectedForPair[1],selectedForPair[0],selectedForPair[1], ""]);//add the connection between the ordered pair
  document.getElementById("relationPairsTextArea").value += "(" + selectedForPair +"),";
  console.log("Adding pair (" + selectedForPair + ") to relation data");

  //Now draw an arrow between the elements
  cy.add({data:{id: selectedForPair[0] + selectedForPair[1], source: selectedForPair[0], target: selectedForPair[1]}, classes: 'relationEdge'});
  sendGraphToServer();
  sendRelationDataToServer();
}

/*
  Clears the relation data from the graph
*/
function clearRelationData(){
  console.log("Clearing relation data");
  relationData = {nodes:[], edges:[]};
  document.getElementById("relationPairsTextArea").value = "";
  sendGraphToServer();
  sendRelationDataToServer();

}

function sendSubGraphDataToServer(){
  console.log("Sending subgraph data to server")
  socket.emit("server_set_subgraph_data", JSON.stringify(subGraphData));
}

function addElementToSubgraph(){
  console.log("Adding element to subgraph");
  var elements = cy.$("node:selected");
  elements.forEach(function(element){
    elements.addClass("subgraphNode");
    document.getElementById("subgraphElementsTextArea").value += element.id() + ","
    subGraphData.nodes.push(element)
  });
}

function clearSubgraphData(){
  console.log("Clearing subgraph data");
  subGraphData = {nodes:[]}
  sendGraphToServer();
  sendSubGraphDataToServer();
  document.getElementById("subgraphElementsTextArea").value = "";
}

/*
Save the graph to a file.
*/
function saveGraph(){
  console.log("Saving graph");
  //get the filename desired
  filename = prompt("Enter a name for the file. If the file already exists it WILL be over-written", "");
  if(filename == ""){
    console.log("Invalid filename input to save graph");
    alert("Invalid filename. Graph not saved");
  }else{
    socket.emit("server_save_graph", filename);
  }
}

/*
Load a graph to a file.
*/
function loadGraph(){
  console.log("Loading graph");
  //get the filename desired
  filename = prompt("Enter a file to load. If the file does not exist a new one will be created and a new graph will start", "");
  if(filename == ""){
    console.log("Invalid filename input");
    alert("Invalid filename. Graph not loaded");
  }else{
  socket.emit("server_load_graph", filename);
  }
}

/*
Shuts down the server. The server side will save all of the data that it already has as an autossave file. This will not overwrite any previously saved file
*/
function shutdownServer(){
  socket.emit('server_shutdown');
  socket.close();
  window.close(); //shut the current tab as without the server working there is no use for the tab
}

/*
Just for testing purposes
*/
function testFunc(){
  ShowGraphInNewWindow();
}
