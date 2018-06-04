from poset import Poset
import random

class Graph:
    '''The class that will hold all edges, vertices and other information pertaining to the drawing of a graph '''
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.positions = {}

    def dilate(self):
        pass

    def erode(self):
        pass

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
#            print("Added edge vertex ", "ve" + edge[0])
        for vertexEdge in edgeConnections:
            for connectedVertex in edgeConnections[vertexEdge]:
                self.addEdge((vertexEdge, "v" + connectedVertex))

        for vertex in vertices:
            self.addVertex(("v" + vertex[0],vertex[1], vertex[2]))
#            print("Added vertex ", "v" + vertex[0])
