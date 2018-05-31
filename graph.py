import networkx as nx
import matplotlib.pyplot as plt

class Graph:
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.graphObj = nx.MultiGraph()

    def dilate(self):
        pass
    def erode(self):
        pass
    def draw(self):
        #TODO: change to use the edge and node objects in corresponding files
        #add nodes and edges
        for x in self.nodes:
            self.graphObj.add_node(x)
        for x in self.edges:
            self.graphObj.add_edge(*x)

        # draw graph
        pos = nx.path_graph(self.graphObj)
        nx.draw(self.graphObj)

        #show the graph
        plt.show()

    #TODO: change to use the node object
    #x is a tuple
    def addNode(self, x):
        self.nodes.append(x)

    #TODO: change to use the edge object
    #x is a tuple
    def addEdge(self, x):
        self.edges.append(x)
