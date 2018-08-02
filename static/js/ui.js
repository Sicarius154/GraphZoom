/*
  This file contains all logic relating to interacting with the UI, setting text in information sections,
  searching for elements, adding elements and so forth
*/

/*
This is called when the server sends the graph data to the client
//TODO: Make this more efficient, maybe modify existing elements rather than remove and redraw them?
*/
function setGraphReceivedFromServer(json){
  console.log("Server has sent new graph data");
  clearGraph();
  json = json.replace(/\\/g, ""); // We had to escape all of the quotation marks on the Python sie, so remove them here
  json = json.replace(/\\\\/g, ""); // We had to escape all of the quotation marks on the Python sie, so remove them here
  json = JSON.parse(json);
  setNextAvailableId(json["next_node_id"], json["next_edge_id"]);

  json["nodes"].forEach(function(ele){
    cy.add({data:{id:ele.data.id, label:ele.data.label}, position:{x:ele.position.x, y:ele.position.y}});

    //This is a really weird fix that is required; see bugs in the documentation
    cy.$("#" + ele.data.id).emit("free");
  });
  json["edges"].forEach(function(ele){
    cy.add({data:{id: ele.id, label: ele.label, source: ele.source, target: ele.target}});
  });

  json["sub_graph"].forEach(function(node){
      subGraphData.push(node);
  });

  json["relation"].forEach(function(pair){
      relationData.push(pair);
  });

  if(relationData != undefined){
    relationData.forEach(function(pair){
      addRelationPairToUi(pair);
    });
  }
  if(subGraphData != undefined){
    subGraphData.forEach(function(element){
      addSubgraphElementToUi(element)
    });
  }
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
Changes whether labels are drawn on nodes or not depending on the user input
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
      label: " "
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
  cy.add({data:{id: "e" + nextEdgeId, label: " ", source: selectedNodes[0].id(), target: selectedNodes[1].id()}});
  console.log("Added edge " + 'e' + nextEdgeId + " with source: " + selectedNodes[0].id() + " and target: " + selectedNodes[1].id());
  nextEdgeId++;
  sendGraphToServer(); //update the graph on the serverside
}

/*
  Removes a relation pair from the data and the UI
*/
function removeRelationPairFromData(elementPair){
    //removes the pair from the relation data array
    relationData.forEach(function(pair){
      if(elementPair[0]==pair[0] && elementPair[1]==pair[1]){
        relationData.splice(relationData.indexOf(pair), 1)
      }
    });
    //Replace the string value with nothing
    document.getElementById("relationPairsTextArea").value =
      document.getElementById("relationPairsTextArea").value.replace("(" + elementPair +")", "").replace(",,", ","); //reset the text
}

/*
  Removes an element from the subgraph data and removes the UI references to it
*/
function removeSubgraphElementData(ele){
  //Delete the ele
  subGraphData.filter(function(item){
    return item !== ele;
  });

  //remove it from the UI
  document.getElementById("subgraphElementsTextArea").value =
    document.getElementById("subgraphElementsTextArea").value.replace(ele+",", "");

  //Now we need to see if the subgraph element was a node, and if it is we need to remove all of the
  //relation pairs associated with it
  relationData.forEach(function(pair){
    if(pair[0] == ele || pair[1] == ele){
      relationData.splice(relationData.indexOf(pair), 1)
    }
  });
}

/*
This will delete any selected element(s), edge or node.
*/
function deleteElement(){
  selectedElements = cy.$(':selected');

  //we also want to remove the data the user sees in relation to this element. If the node was a part of the sub-graph, remove that, same for relations
  selectedElements.forEach(function(ele){
    if(ele.hasClass("relationEdge")){
      elementPair = [ele.data("source"), ele.data("target")];
      removeRelationPairFromData(elementPair)

    }else if(ele.hasClass("subgraph")){
      removeSubgraphElementData(ele.id());
    }
  });

  cy.remove(selectedElements);

  //update the server
  fullyUpdateServer();
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
function ShowGraphInNewWindow(graphAsJson){
  //create the window object, we assume a size of 800x800 is enough.
  var w = window.open(scriptFolder+"graphresult.html", "Graph results", "height=500, width=800");
  //sessionStorage.seItem("JSON", graphAsJson)
  w.json = graphAsJson;
}

/*
Adds the 2 most recently clicked elements to relation data once the add button is clicked.
*/
function addPairToRelationData(){
  //if there is only one element in the variable then we want to add a loop
  if(selectedForPair[1] == undefined){
    selectedForPair.push(selectedForPair[0]);
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
  addRelationPairToUi(selectedForPair);

  //Now draw an arrow between the elements
  sendRelationDataToServer();
  cy.$("node").unselect();
  selectedForPair = []; //clear the relation data
}

function addRelationPairToUi(pair){
  cy.add({data:{id: pair[0] + pair[1], source: pair[0], target: pair[1]}, classes: 'relationEdge'});
  document.getElementById("relationPairsTextArea").value += "(" + pair +"),";
  console.log("Adding pair (" + pair + ") to relation data");
}


/*
  Clears the relation data from the graph
*/
function clearRelationData(){
  console.log("Clearing relation data");
  cy.$(".relationEdge").remove();
  relationData = [];
  selectedForPair = [];
  document.getElementById("relationPairsTextArea").value = " ";
  sendRelationDataToServer();

}
/*
  Adds an element to the array containing ID's of subgraph nodes. Also marks the node as green and updates the server
*/
function addElementToSubgraph(){
  console.log("Adding element to subgraph");
  var elements = cy.$("node:selected");
  elements.forEach(function(element){
    addSubgraphElementToUi(element.id());
    subGraphData.push(element.id());

    if(element.position("y") == posetEdgeYCord){
      console.log("Node added to subgraph is on edge row. Adding other nodes...")
      var edges = element.connectedEdges();

      edges.forEach(function(edge){
        if(edge.hasClass(".relationEdge")){
          console.log("Edge was a relation edge, skipping...")
          return;
        }else{
        if(cy.$("#" + edge.data("source")).position("y") == posetNodeYCord){
          addSubgraphElementToUi(edge.data("source"));
          subGraphData.push(edge.data("source"));
        }else if(cy.$("#" + edge.data("target")).position("y") == posetNodeYCord){
          addSubgraphElementToUi(edge.data("target"));
          subGraphData.push(edge.data("target"));
        }}
      });
    }
  });
  sendSubGraphDataToServer();
}

function addSubgraphElementToUi(element){
  cy.$("#" + element).addClass("subgraph");
  document.getElementById("subgraphElementsTextArea").value += element + ","
}

/*
  Clears the array containing subgraph data; also updates the server
*/
function clearSubgraphData(){
  console.log("Clearing subgraph data");
  cy.$(".subgraph").removeClass("subgraph");
  subGraphData = []
  sendGraphToServer();
  sendSubGraphDataToServer();
  document.getElementById("subgraphElementsTextArea").value = "";
}

/*
  This will convert the representation of the graph as a partially ordered set to a standard graph.
  This may not be possible for all partially ordered sets!
*/
function posetToGraph(){
  //Loop through every 'edge' node, ensure it has exactly two edges. If it does, create a new edge with the two nodes as endpoints
  cy.edges().forEach(function(edge){

  });
}
