/*
  All functions in this file interact with the server in some way. They either send data, request data or handle incoming data
*/

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
  console.log("Sending relation data to the server");
  dataToSend = {nodes: [], edges:[]};
  relationData.forEach(function(ele){
    dataToSend.nodes.push(ele[0]);
    dataToSend.nodes.push(ele[1]);
    dataToSend.edges.push(ele[0]+ele[1]+"_connection", ele[0], ele[1], "");
  });
  socket.emit('server_set_new_relation', JSON.stringify(relationData));
}
function sendSubGraphDataToServer(){
  console.log("Sending subgraph data to server")
  socket.emit("server_set_subgraph_data", JSON.stringify(subGraphData));
}
  //  document.getElementById("subgraphElementsTextArea").value += element.id() + ","

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
