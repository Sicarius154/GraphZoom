/*
  Code in this file is intedned to act upon different events and handle them accordingly
*/

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
