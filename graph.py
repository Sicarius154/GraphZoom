import networkx as nx
from poset import Poset
import matplotlib.pyplot as plt
import random

class Graph:
    '''The class that will hold all edges, vertices and other information pertaining to the drawing of a graph '''
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.positions = {}
        self.graphObj = nx.MultiGraph()
        limits=plt.axis('off')

    def dilate(self):
        pass

    def erode(self):
        pass

    def draw(self):
        '''Used to draw the graph'''
        #add nodes and edges
        for v in self.nodes:
            self.graphObj.add_node(v)
        for e in self.edges:
            self.graphObj.add_edge(e[0], e[1])

        # draw graph
        pos = nx.path_graph(self.graphObj)
        nx.draw_networkx(self.graphObj, pos=self.positions)

        #show the graph
        plt.show()

    def addVertex(self, vertex):
        '''Add a node to the graph
           vertex: takes a tuple: (id, x-cord, y-cord)
        '''
        self.nodes.append(vertex[0])
        self.positions[vertex[0]] = (vertex[1], vertex[2])

    def addEdge(self, edge):
        '''Add an edge to the graph
           edge: takes a tuple: (id, endPoint1, endPoint2)
        '''
        self.edges.append((edge[0], edge[1]))

    def addFromPoset(self, poset):
        '''This will take a poset as input. The function the adds all vertices to the
           graph, creates vertices to represent edges and plots them, then grabs all of the
           Vertices connected to each edge and stores them in a dictionary'''
        print("Adding elements from a partially ordered set")
        vertices = poset.getVertices()
        edges = poset.getEdges()
        edgeConnections = {} #this will store the list of edges and the nodes they're connected to

        for edge in edges:
            #create the links between edgeVertices and normal vertices
            if edgeConnections.get("ve" + edge[0]) != None:
                edgeConnections["ve" + edge[0]] += edge[1]
            else:
                edgeConnections["ve" + edge[0]] = edge[1]
            self.addVertex(("ve" + edge[0], int(edge[0]) + 2, 4))
            print("Added edge vertex ", "ve" + edge[0])
        for vertexEdge in edgeConnections:
            for connectedVertex in edgeConnections[vertexEdge]:
                self.addEdge((vertexEdge, "v" + connectedVertex))

        for vertex in vertices:
            self.addVertex(("v" + vertex[0],vertex[1], vertex[2]))
            print("Added vertex ", "v" + vertex[0])


p = Poset()
g = Graph()

#add 1000 vertices
for i in range(100):
    p.addObject((0, str(i), i + 1, 1))
for i in range(50):
    p.addObject((1, str(i), [str(random.randint(1,99)), str(random.randint(1,99)), str(random.randint(1,99))]))
'''
p.addObject((0, '1', 1, 1))
p.addObject((0, '2', 3, 1))
p.addObject((0, '3', 5, 1))
p.addObject((0, '4', 7, 1))
p.addObject((0, '5', 9, 1))

p.addObject((1, '1', ['1', '2', '5']))
p.addObject((1, '2', ['2']))
p.addObject((1, '3', ['3', '4']))
p.addObject((1, '4', ['5', '2', '4']))
'''
g.addFromPoset(p)
print("Drawing...")

g.draw()
