import networkx as nx
from poset import Poset
import matplotlib.pyplot as plt

class Graph:
    '''The class that will hold all edges, vertices and other information pertaining to the drawing of a graph '''
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.graphObj = nx.MultiGraph()

    def dilate(self):
        pass

    def erode(self):
        pass

    def draw(self):
        '''Used to draw the graph'''
        #add nodes and edges
        for v in self.nodes:
            self.graphObj.add_node(v[0], pos = (v[1], v[2]))
        for e in self.edges:
            self.graphObj.add_edge(e[3], e[4], pos=(e[1], e[2]))

        # draw graph
        pos = nx.path_graph(self.graphObj)
        nx.draw_networkx(self.graphObj)

        #show the graph
        plt.show()

    def addVertex(self, vertex):
        '''Add a node to the graph
           vertex: takes a tuple: (id, x-cord, y-cord)
        '''
        self.nodes.append(vertex)

    def addEdge(self, edge):
        '''Add an edge to the graph
           edge: takes a tuple: (id, x-cord, y-cord, endPoint1, endPoint2)
        '''
        self.edges.append(edge)

    def addFromPoset(self, poset):
        for e in poset.getEdges():
            self.addEdge(e)
        for v in poset.getVertices():
            self.addVertex(v)

p = Poset()

for i in range(10):
    p.addObject((0, i, i + 1, 2))
for i in range(5):
    p.addObject((1, i+10, i + 11, 5, i + 1, i + 2))

g = Graph()
g.addFromPoset(p)

g.draw()
