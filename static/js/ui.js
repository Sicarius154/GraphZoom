/*
  This file contains all logic relating to interacting with the UI, setting text in information sections,
  searching for elements, adding elements and so forth
*/

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
  Shows a graph in a new window. Ideal for showing results of operations on a graph without altering the
  original.
  The child window will grab the graphOperationResults variable declared at the top of this script. Ensure this has been updated before calling this function
*/
function ShowGraphInNewWindow(){
  //create the window object, we assume a size of 800x800 is enough.
  var w = window.open(scriptFolder+"graphresult.html", "Graph results", "height=500, width=800");
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
Adds the 2 most recently clicked elements to relation data once the add button is clicked.
*/
function addPairToRelationData(){
  //if there is only one element in the variable then we want to add a loop
  if(selectedForPair[1] == undefined){
    selectedForPair.push(selectedForPair[0])
  }
  //we need to see if this relation already exists; we need to do this ourselves as cytoscape's API for this suck

  selectedForPairStringified = JSON.stringify(selectedForPair);

  var contains = relationData.some(function(ele){
    return JSON.stringify(ele) === selectedForPairStringified;
  });

  if(contains){
    console.log("Error! Attempt to create duplicate ordered pair for relaion");
    selectedForPair = [];
    cy.$("node").unselect();
    return;
  }

  relationData.push(selectedForPair);
  document.getElementById("relationPairsTextArea").value += "(" + selectedForPair +"),";
  console.log("Adding pair (" + selectedForPair + ") to relation data");

  //Now draw an arrow between the elements
  cy.add({data:{id: selectedForPair[0] + selectedForPair[1], source: selectedForPair[0], target: selectedForPair[1]}, classes: 'relationEdge'});
  sendGraphToServer();
  sendRelationDataToServer();
  cy.$("node").unselect();
  selectedForPair = []; //clear the relation data
}

/*
  Clears the relation data from the graph
*/
function clearRelationData(){
  console.log("Clearing relation data");
  relationData = {nodes:[], edges:[]};
  document.getElementById("relationPairsTextArea").value = " ";
  sendGraphToServer();
  sendRelationDataToServer();

}

function addElementToSubgraph(){
  console.log("Adding element to subgraph");
  var elements = cy.$("node:selected");
  elements.forEach(function(element){
    elements.addClass("subgraphNode");
    document.getElementById("subgraphElementsTextArea").value += element.id() + ","
    subGraphData.nodes.push(element.id());
  });
  sendGraphToServer();
  sendSubGraphDataToServer();
}

function clearSubgraphData(){
  console.log("Clearing subgraph data");
  subGraphData = {nodes:[]}
  sendGraphToServer();
  sendSubGraphDataToServer();
  document.getElementById("subgraphElementsTextArea").value = "";
}
