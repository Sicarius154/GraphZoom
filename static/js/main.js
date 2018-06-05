//these two values will be integers that store the next value to be used as an ID
var nextNodeId = 0;
var nextEdgeId = 0;

//The graph object
var cy = null;

/*
  Called once the <body> of the index.html loads. Sets up the graph object and assigns
  event handlers
*/
function start(){
  //create the cytoscape objct and set the div with the corresponding ID to be the display area for the graph
  cy = cytoscape({container: document.getElementById('graph-display-area'), style: [{selector: 'edge', style:{'curve-style': 'bezier'}}]});

  //Set a function to handle when a node is selected
  cy.on('tap', 'node', nodeSelectedEvt);
}


/*
  This is called once a node has been selected. It displays the information of the most
  recently selected node
*/
function showSelectedNodeData(){
  selectedNodes = cy.$('node:selected');
  node = selectedNodes[0];
  //Update the information part of the information panel
  document.getElementById("InformationArea").innerHTML =
  "Node ID: " + node.id() + "<br>" + "Is connected to: ";
  console.log("Node selected with ID: " + node.id());
}

/*
  Adds a node to the graph with a random ID number. It then selects the new node
*/
function addNode(){
  var node = {data:{id: 'n' + nextNodeId}, position:{x:0, y:0}};
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
  cy.add({data:{id: 'e' + nextEdgeId, source: selectedNodes[0].id(), target: selectedNodes[1].id()}});
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
  Called when a node is tapped/clicked. This will select the node and unselect any previous nodes that were selected.
*/
function nodeSelectedEvt(evt){
//  showSelectedNodeData();
}
