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
  This will call all functions intending to send the current state of data to the server.
*/
function fullyUpdateServer(){
  sendGraphToServer();
  sendSubGraphDataToServer();
  sendRelationDataToServer();
}
/*
Request graph data to be sent to the client
*/
function getGraphFromServer(){
  socket.emit('server_get_graph_data');
  console.log("Requesting graph from the server");
}
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

  json["nodes"].forEach(function(ele){
    cy.add({data:{id:ele.data.id, label:ele.data.label}, position:{x:ele.position.x, y:ele.position.y}});
  });

  json["edges"].forEach(function(ele){
    cy.add({data:{id: ele.id, label: ele.label, source: ele.source, target: ele.target}});
  });

  json["sub_graph"].forEach(function(node){
      subGraphData.push(node);
  });

  json["relation"].forEach(function(pair){
      subGraphData.push(pair);
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
    node = {
      "data":{
        "id":element.id(),
        "label":element.data("label")
      },
      "position":{
        "x":element.position('x'),
        "y":element.position('y')
      }
    }
    nodeData.push(node);
  });

  rawEdgeData.forEach(function(element){
    //We only want to send edges that aren't relation edges
    if(!element.hasClass("relationEdge")){
      edge = {
        "id": element.id(),
        "label": element.data("label"),
        "source": element.data("source"),
        "target": element.data("target")
      }
      edgeData.push(edge);
    }
  });

  //construct a JSON object and send it to the server
  var graph = {"nodes": nodeData, "edges": edgeData, "relation": relationData, "sub_graph": subGraphData};
  socket.emit('server_set_graph_data', JSON.stringify(graph));
}
/*
Sends a JSON representation of the array containing the relation pairs.
This function first sends the graph data to the server to ensure both are up to date
*/
function sendRelationDataToServer(){
  console.log("Sending relation data to the server");
  dataToSend = [];
  relationData.forEach(function(ele){
    dataToSend.push(ele);
  });
  socket.emit('server_set_new_relation', JSON.stringify(dataToSend));
}
function sendSubGraphDataToServer(){
  console.log("Sending subgraph data to server");
  socket.emit("server_set_subgraph_data", JSON.stringify(subGraphData));
}
  //  document.getElementById("subgraphElementsTextArea").value += element.id() + ","

/*
Save the graph to a file.
*/
function saveGraph(){
  fullyUpdateServer();
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
