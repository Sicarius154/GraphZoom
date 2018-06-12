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
      }
    ]
  }
);

  //Add event handlers
  cy.on('tap', 'node', nodeSelectedEvt);
  cy.on('tap', 'edge', edgeSelectedEvt);

  //Manipulate the UI to set it up as we expect it to be
  document.getElementById("optionsShowNodeLabelsCheckbox").checked = true; //this needs to be checked by default
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
  if(document.getElementById("optionsShowNodeLabelsCheckbox").checked){
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
}

/*
  This will delete any selected element(s), edge or node.
*/
function deleteElement(){
  selectedElements = cy.$(':selected');
  cy.remove(selectedElements);
}

/*
  Assigns a new ID to the element
*/
function assignLabel(id, newLabel){
  cy.$('#' + id).data.label = newLabel;
  cy.$('#' + id).select();
  console.dir(cy.$('#' + id));
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
  console.log(nodes);
  console.log(edges);

  nodes.forEach(function(node){
    addNode(node);
  });
  edges.forEach(function(edge){
    addEdge(edge);
  });

  /*for(element in nodes){
    addNode(element[0], element[1], element[2], element[3]);
  }

  for(edge in edges){
    addEdge(edge[0], edge[1], edge[2], edge[3]);
  }*/
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
  Called when the textarea showing label information has its value changed
*/
function labelAreaChangedEvt(){
  var id = document.getElementById("idArea").innerHTML;
  var label = document.getElementById("labelInputArea").value;
  console.log("Label found: " + label);
  assignLabel(id, label);
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
*/
//TODO: Make this more efficient, maybe modify existing elements rather than remove and redraw them?
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

function testFunc(){
  //getGraphFromServer();
/*  var node = {
    data:
    {
      id: "n" + nextNodeId,
      parent: 'n1 , n2',
      label: "No Label"
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
  nextNodeId++;*/
  nodes = [];
  edges = [];
  nodes.push(["n1", 100, 300, "None"]);
  nodes.push(["n2", 300, 300, "None"]);
  nodes.push(["e1", 100, 100, "None"]);
  edges.push(["c1", "n1", "e1", "None"]);
  edges.push(["c2", "n2", "e1", "None"]);
  drawPoset(nodes, edges);
}
