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
//User to communicate with the Python server
//var io = require("socket.io")(80);
var socket = null;
//The graph object
var cy = null;
//Determines if the graph is a poset
var isPoset = true;
var posetNodeYCord = 100;
var posetEdgeYCord = 400;

//this will be used to store the elements of a relation whilst it is being created
var relationData = [];

/*
Called once the <body> of the index.html loads. Sets up the graph object and assigns
event handlers
*/
function start(){
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
      }
    ]
  }
);

//set up the grid layout and enable snap-to-grid plugin
cy.layout({
  name: 'grid',
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
  //document.getElementById("labelInputArea").value =  node.data.label;
  console.log("Displaying element data with label " + node.data.label);
}

/*
This is called once an edge has been selected. It displays the information of the most
recently selected edge
*/
function showSelectedEdgeData(edge){
  //Update the information part of the information panel
  document.getElementById("idInputTextArea").value = edge.id();
  //document.getElementById("labelInputArea").value =  edge.data.label;
  console.log("Displaying element data with label " + edge.data.label);
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
  sendGraphToServer(); //update the graph on the serverside
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
    },
    position:
    {
      x:0,
      y:0
    }
  };
  cy.add(node);

  //Select the new node and increment the next ID available
  cy.getElementById(node.data.id).select();
  console.log("Added node " + 'n' + nextNodeId + " at position " + node.position.x + node.position.y);
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
  selectedElements = cy.$(':selected');
  cy.remove(selectedElements);
  sendGraphToServer(); //update the graph on the serverside
}

/*
Assigns a new ID to the element
*/
function assignLabel(id, newLabel){
  cy.$('#' + id).data.label = newLabel;
  cy.$('#' + id).select();
  console.dir(cy.$('#' + id));
  sendGraphToServer(); //update the graph on the serverside
}

/*
Draw a hypergraph node, the first element in the array should be the edge value; all other elements are presumed to be nodes
*/
function drawHyperGraphNode(edgeNode, nodes){
  var node = {
    data:
    {
      id: 'n' + nextNodeId,
      label: "No Label",
      parent: 'n1'
    },
    position:
    {
      x:0,
      y:0
    }
  };

  //draw the edge node on the graph
  cy.add(edgeNode);

  //add all of the children/inner nodes
  for(node in nodes){
    cy.add({data:{id: 'n' + nextNodeId, label: "No Label", parent: edgeNode.data.id}, position:{x:0, y:0}});
  }
  console.log("Added node " + 'n' + nextNodeId + " at position " + node.position.x + node.position.y + " with parent " + edgeNode.data.id);
  nextNodeId++;
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

/*  var movedNode = cy.$('#' + evt.target.id());
  for(node in cy.nodes()){
    console.log("PINT")
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
  This takes a collection of the elements of a graph. NOT a graph object itself. The child window will then fetch this variable and itterate over it
*/
function ShowGraphInNewWindow(graphResults){
  //create the window object, we assume a size of 800x800 is enough.
  var w = window.open("",'Graph results', width=800, height=800);

  w.graphData = graphResults;
}
/*
Called when the textarea showing label information has its value changed
*/
function labelAreaChangedEvt(){
  var id = document.getElementById("idArea").innerHTML;
  var label = document.getElementById("labelInputArea").value;
  console.log("Label found: " + label);
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
Connects to the python server
*/
function connectToServer(){
  socket = io.connect('http://' + document.domain + ':' + location.port);
  socket.on('connect', function(){
    console.log("Connected to the main server");
  });
  //Now lets set all of the event handlers
  socket.on('NewGraphData', setGraphReceivedFromServer);
}

/*
Request graph data to be sent to the client
*/
function getGraphFromServer(){
  socket.emit('GetGraphData');
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

  //TODO: Neither nodes or edges have their labels grabbed propperly, this needs to be fixed
  //Itterate over all of the graph elements and extract the data we care about
  rawNodeData.forEach(function(element){
    nodeData.push([element.id(), element.position('x'), element.position('y'), element.label]);
  });

  //TODO: Stop relation edges from being sent as they hold no significance to the graph itself
  rawEdgeData.forEach(function (element){
    edgeData.push([element.id(), element.position('x'), element.position('y'), element.label]);
  });

  //construct a JSON object and send it to the server
  var graph = {nodes: nodeData, edges: edgeData};
  socket.emit('SetGraphData', JSON.stringify(graph));
}

/*
Sends a JSON representation of the array containing the relation pairs.
This function first sends the graph data to the server to ensure both are up to date
*/
function sendRelationDataToServer(){
  console.log("Sending relation data to the server, setting the current relation for this graph to the currently selected one")
  sendGraphToServer(); //update the graph on the server side
  socket.emit('saveNewRelation', JSON.stringify(relationData));
}

/*
Adds the 2 most recently clicked elements to relation data once the add button is clicked.
//TODO: Fix the order that the elements are grabbed
*/
function addPairToRelationData(){
  var selected = cy.$(':selected');
  var pair = [selected[0].id(), selected[1].id()];
  relationData.push(pair);
  document.getElementById("relationPairsTextArea").value += "(" + pair +"),";

  //Make the node red by setting this edge as an edge that signifies a relation
  cy.$('#'+selected[0].id()).addClass("relationNode");
  cy.$('#'+selected[1].id()).addClass("relationNode");

  //Now draw an arrow between the elements
  cy.add({data:{id: selected[0].id() + selected[1].id(), source: selected[0].id(), target: selected[1].id()}, classes: 'relationEdge'});
  sendGraphToServer(); //update the graph on the serverside
}

/*
This takes all of the pairs currently in the relationData, the name given and then saves the relation with a name to the Server
The user can then recall this relation from the server. The relation is saved along with the graph data.
*/
function saveRelationData(){
  console.log("Updating the server and saving data")
}

/*
Just for testing purposes
*/
function testFunc(){
/*  nodes = [];
  edges = [];
  nodes.push(["n1", 100, 300, "Node 1"]);
  nodes.push(["n2", 300, 300, "Node 2"]);
  nodes.push(["n3", 500, 300, "Node 3"]);
  nodes.push(["e1", 100, 100, "Edge 1"]);
  nodes.push(["e2", 300, 100, "Edge 2"]);
  nodes.push(["e3", 500, 100, "Edge 3"]);
  edges.push(["c1", "n1", "e1", "Connection 1"]);
  edges.push(["c3", "n3", "e3", "Connection 3"]);
  edges.push(["c4", "n1", "e2", "Connection 4"]);
  edges.push(["c5", "n2", "e1", "Connection 5"]);
  edges.push(["c6", "n3", "e1", "Connection 6"]);
  drawPoset(nodes, edges);*/
  var eles = cy.$("*");
  var elementsToShow = null;

  //Itterate over all of the graph elements and extract the data we care about
  eles.forEach(function(element){
    elementsToShow.add([element.data.label, element.position.x, element.position.y, element.data.label]);
  });
  console.log(eles);
  ShowGraphInNewWindow(eles);
}
