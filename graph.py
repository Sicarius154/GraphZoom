from poset import Poset
import random
import json

class Graph:
    '''The class that will hold all edges, vertices and other information pertaining to the drawing of a graph '''
    def __init__(self):
        self.nodes = []
        self.edges = []

    def dilate(self):
        pass

    def erode(self):
        pass

    def getjJSONRepresentation(self):
        '''This method will return the entire graph as a JSON object.
           This is the representation the front-end should seeself.
        '''

        nodes = []
        edges = []

        #convert all of the nodes in the graph to a json representation that the UI framework can deal with
        for node in self.nodes:
            jsonNode = {}
            data = {}
            position = {}
            data['id'] = node[0]
            data['label'] = node[3]
            position['x'] = node[1]
            position['y'] = node[2]
            jsonNode['data'] = data
            jsonNode['position'] = position
            jsonNode = json.dumps(data)
            nodes.append(jsonNode)
        #convert all of the edges in the graph to a json representation that the UI framework can deal with
        for edge in self.edges:
            jsonNode = {}
            data = {}
            data['id'] = edge[0]
            data['label'] = edge[3]
            data['source'] = edge[1]
            data['target'] = edge[2]
            jsonNode['data'] = data
            jsonNode = json.dumps(jsonNode)
            edges.append(jsonNode)
        return (nodes, edges)
    def addVertex(self, vertex):
        '''Add a node to the graph
           vertex: takes a tuple: (id, x-cord, y-cord, lbl)
        '''
        self.nodes.append(vertex)

    def addEdge(self, edge):
        '''Add an edge to the graph
           edge: takes a tuple: (id, endPoint1, endPoint2, lbl)
        '''
        self.edges.append(edge)

    def addFromPoset(self, poset):
        '''self will take a poset as input. The function the adds all vertices to the
           graph, creates vertices to represent edges and plots them, then grabs all of the
           Vertices connected to each edge and stores them in a dictionary'''
        print("Adding elements from a partially ordered set")
        vertices = poset.getVertices()
        edges = poset.getEdges()
        edgeConnections = {} #this will store the list of edges and the nodes they're connected to

        for edge in edges:
            #create the links between edgeVertices and normal vertices
            if edgeConnections.get("e" + edge[0]) != None:
                edgeConnections["e" + edge[0]] += edge[1]
            else:
                edgeConnections["e" + edge[0]] = edge[1]
            self.addVertex(("e" + edge[0], int(edge[0]) + 2, 4, edge[3]))
        for vertexEdge in edgeConnections:
            for connectedVertex in edgeConnections[vertexEdge]:
                self.addEdge((vertexEdge, "n" + connectedVertex))

        for vertex in vertices:
            self.addVertex(("n" + vertex[0],vertex[1], vertex[2], vertex[3]))
