function start(){
  //create the cytoscape objct and set the div with the corresponding ID to be the display area for the graph
  var cy = cytoscape({container: document.getElementById('graph-display-area')});

  //Set a function to handle when a node is selected
  cy.on('tap', 'node', nodeSelected);

  //randomly spawn some nodes
  for( i = 0; i < 100; i++){
    cy.add({data:{id: 'n' + i}, position: {x:Math.floor(Math.random() * 1000) + 1 , y:Math.floor(Math.random() * 1000) + 1 }});
  }

  //randomly spwan some edges
  for(i = 0; i < 200; i++){
    cy.add({data:{id: 'e' + i, source: Math.floor(Math.random() * 100) + 1, target: Math.floor(Math.random() * 100) + 1}});
  }
}

function nodeSelected(evt){
  //Update the information part of the control panel
  document.getElementById("InformationArea").innerHTML =
  "Node ID: " + evt.target.id() +
  "\nIs Connected to: " + evt.target.connectedNodes();
}
