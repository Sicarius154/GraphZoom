//these two values will be integers that store the next value to be used as an ID
var nextNodeId = 0;
var nextEdgeId = 0;
//User to communicate with the Python server
var io = require("socket.io")(80);
var socket = null;
//The graph object
var cy = null;

/*
  Called once the <body> of the index.html loads. Sets up the graph object and assigns
  event handlers
*/
function start(){
  //Before we do anything else we need to connect to the python server
  connectToServer()
  //create the cytoscape objct and set the div with the corresponding ID to be the display area for the graph
  cy = cytoscape(
    {
      container: document.getElementById('graph-display-area'),
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
          "curve-style": "bezier"
        }
      }
    ]
  }
);

  //Add event handlers
  cy.on('tap', 'node', nodeSelectedEvt);
  cy.on('tap', 'edge', edgeSelectedEvt);
  var area = document.getElementById("labelInputArea").addEventListener('input', labelAreaChangedEvt, false);
}

/*
  Connects to the python server
*/
function connectToServer(){
  socket = io.connect('http://' + document.domain + ':' + location.port);
  socket.on('connect', function(){
    alert("connected to server");
  });
  socket.emit('TestEvent');
}


/*
  This is called once a node has been selected. It displays the information of the most
  recently selected node
*/
function showSelectedNodeData(node){
  //Update the information part of the information panel
  document.getElementById("idArea").innerHTML = node.id();
  document.getElementById("labelInputArea").value =  node.data.label;
  console.log("Displaying element data with label " + node.data.label);
}

/*
  This is called once an edge has been selected. It displays the information of the most
  recently selected edge
*/
function showSelectedEdgeData(edge){
  //Update the information part of the information panel
  document.getElementById("idArea").innerHTML = edge.id();
  document.getElementById("labelInputArea").value =  edge.data.label;
  console.log("Displaying element data with label " + edge.data.label);
}

/*
  Adds a node to the graph with a random ID number. It then selects the new node
*/
function addNode(){
  var node = {
    data:
    {
      id: "n" + nextNodeId,
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
  nextNodeId++;
}

/*
  Adds an edge between the first two elements in the selected nodes of the graph
*/
function addEdge(){
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

function drawPoset(nodes, edges){
  for(element in nodes){
    cy.add({data:{id: element[0]}, position:{x:element[1], y:element[2]}});
  }

  for(edge in edges){
    cy.add({data:{id: edge[0], source: edge[1], target: edge[2]}});
  }
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
