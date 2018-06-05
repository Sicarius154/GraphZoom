//TODO: Fix the select/unselect logic of nodes
//TODO: Create functionality for multiedges
//TODO: Update the information panel with more meaningful data
//TODO:

//these two values will be integers that store the next value to be used as an ID
var nextNodeId = 0;
var nextEdgeId = 0;

var cy = null;

function start(){
  //create the cytoscape objct and set the div with the corresponding ID to be the display area for the graph
  cy = cytoscape({container: document.getElementById('graph-display-area')});

  //Set a function to handle when a node is selected
  cy.on('tap', 'node', nodeSelectedEvt);
}


/*
  selects a node and logs the relevant info to the console, will then update the information area
  node: a JSON object matching the representation of nodes for cytoscape
*/
function selectNode(node){
  //push node into the list of selected nodes
  cy.getElementById(node.id).select();

  //Update the information part of the information panel
  document.getElementById("InformationArea").innerHTML =
  "Node ID: " + node.data.id + "<br>" + "Is connected to: ";
  console.log("Node selected with ID: " + node.data.id);
}

/*
  Adds a node to the graph with a random ID number. It then selects the new node
*/
function addNode(){
  var node = {data:{id: 'n' + nextNodeId}, posiiton:{x:0, y:0}};
  cy.add(node);

  //for(e in cy.$(':selected')){
  //  cy.$(e.id).unselect();
  //}

  //Select the new node
  cy.getElementById(node.data.id).select();
  nextNodeId++;
}

/*
  Adds an edge between the first two elements in the selected nodes of the graph
*/
function addEdge(){
  selectedNodes = cy.$('node:selected');

  //if the second index is null assume that this is intended to be a loop
  if(typeof selectedNodes[1] == 'undefined' && typeof selectedNodes[0] != 'undefined'){
    selectedNodes[1] = selectedNodes[0];
  }
  console.log("Source for edge: " + selectedNodes[0].id());
  console.log("Target for edge: " + selectedNodes[1].id());


  cy.add({data:{id: 'e' + nextEdgeId, source: selectedNodes[0].id(), target: selectedNodes[1].id()}});
  console.log("Added edge");
  nextEdgeId++;
}

/*

  Event handlers. These functions should only be called by the cytoscape event handler
  They act as a wrapper to call the proper functions defined above and simply handle the event paramater passed

*/

/*
  Called when a node is tapped/clicked. This will select the node and unselect any previous nodes that were selected.
*/
function nodeSelectedEvt(evt){
  node = cy.getElementById(evt.target.data().id);
  selectNode(node);
}
