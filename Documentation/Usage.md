The Interface
=============
The main interface is comprised of a single webpage. This webpage has 3 notable regions, the menu bar, the information panel
and the graph area. The menu bar contains the tools required to perform operations on graphs, adjust options, find help and the GitHub repo and saving and loading of graphs. The information panel is where information on selected elements is displayed, relations can be added and subgraphs can be added. The graph is where the graph is seen.

The Graph area
================
This section of the UI is where the graph is actually drawn, when you add a node it will appear in this area. The graph can be manipulated with the mouse. Below is a list of possible interactions:
- Click & drag on background
  * Pans the graph
- Click & drag on node
    * Moves the node
- Scroll wheel
  * Zoom (+\-)
- CTRL + Click & drag
  * Select multiple elements - __Only use this for deleting elements__[See Bug](https://github.com/Sicarius154/GraphZoom/issues/1)
- CTRL + Click on element
  * Selects multiple elements, use this for selecting nodes for an edge, adding pairs to a relation, deleting multiple elements, and so forth

The Information Panel
=====================
The information panel has various uses. Positioned to the left of the graph area it allows you to see information on the different elements you are selecting (Information will be displayed on the last element you clicked on) and edit some of that information.

The top 3 buttons are used to add a node, edge and delete an element from the graph. Below this you can switch between graph and partially ordered set mode. Switching to graph mode is not yet fully operational [See Feature Improvement](https://github.com/Sicarius154/GraphZoom/issues/2). When adding a node, it will be placed on the origin (0,0) which is __not__ in the centre of the graph, the node will be selected (appear blue) when it is added to the graph. There is no way to tell if a node is on top of another [See Feature Improvement](https://github.com/Sicarius154/GraphZoom/issues/3) as of yet.

In the _Information Area_ you will find two components, the Element ID and Label text boxes. When an element is selected, these will be updated with the corresponding data for that element. At present, you __can not__ edit the id of an element, but you __can__ edit the label of an element. Simply select the element in question, once the label area is updated, click on the text box, input the label and press enter.

Adding a Relation
-----------------
Adding a relation is simple, and uses the information panel area. To create an ordered pair to be added to a relation, simply select two elements in the order you wish to create the pair (Or simply select one element to create a (n1, n1) pair) and press the "Add" button in the relation area of the information panel. The data on the relation in a graph is updated every time a new pair is added. To remove data from the relation you must clear the entire relation using the "Clear" button, so ensure you are adding the correct pairs [See Feature Improvement](https://github.com/Sicarius154/GraphZoom/issues/4).

Adding a Subgraph
-----------------
Subgraphs are handled much like relations in the sense that you can add elements(nodes) to them, and can only clear the entire subgraph [See Feature Improvement](https://github.com/Sicarius154/GraphZoom/issues/5). At present, only nodes can be added; this forces you to use the partially ordered set mode (default mode) when using subgraphs. Adding elements is as simmple as selecting an element, and pressing the "Add" button. Because when you select an element for the subgraph, it is simply added and order does not matter, you can select as many nodes as you like and press "Add"; this also works with drag to select.

The Menu Bar
=============
