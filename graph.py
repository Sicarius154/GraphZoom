from poset import Poset
import random
import json

class Graph:
    '''The class that will hold all edges, vertices and other information pertaining to the drawing of a graph '''
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.relations = []

    def set_graph_from_json(self, json):
        ''' This method will set the entire graph from a JSON object.
            This is the representation the front-end should see.
            It's expected that nodes will be of the format:
            (id, x, y, label)
            and edges of the format:
            (id, source, target, label)
        '''

        pass
    def save_new_relation_from_json(json):
        pass

    def dilate(self):
        pass

    def erode(self):
        pass

    def get_json_representation(self):
        ''' Returns the graph as a JSON object, as the front-end expects it
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
            jsonNode = json.dumps(jsonNode)
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
        #returns a string of nodes and edges, Cytoscape infers which are edges and ndoes based on their data values
        return nodes + edges

    def add_node(self, vertex):
        '''Add a node to the graph
           vertex: takes a tuple: (id, x-cord, y-cord, lbl)
        '''
        self.nodes.append(vertex)

    def add_edge(self, edge):
        '''Add an edge to the graph
           edge: takes a tuple: (id, endPoint1, endPoint2, lbl)
        '''
        self.edges.append(edge)

    def get_nodes(self):
        '''
            Returns the nodes in the graph
        '''
        return self.nodes

    def get_edges(self):
        '''
            Returns the edges in the graph
        '''
        return self.edges
    def add_from_poset(self, poset):
        '''self will take a poset as input. The function the adds all vertices to the
           graph, creates vertices to represent edges and plots them, then grabs all of the
           Vertices connected to each edge and stores them in a dictionary
           :param poset: The partially ordered set to be converted to a graph
         '''
        print("Adding elements from a partially ordered set")
        vertices = poset.get_nodes()
        edges = poset.get_edges()
        edgeConnections = {} #this will store the list of edges and the nodes they're connected to

        for edge in edges:
            #create the links between edgeVertices and normal vertices
            if edgeConnections.get("e" + edge[0]) != None:
                edgeConnections["e" + edge[0]] += edge[1]
            else:
                edgeConnections["e" + edge[0]] = edge[1]
            self.add_node(("e" + edge[0], int(edge[0]) + 2, 4, edge[3]))
        for vertexEdge in edgeConnections:
            for connectedVertex in edgeConnections[vertexEdge]:
                self.add_edge((vertexEdge, "n" + connectedVertex))

        for vertex in vertices:
            self.add_node(("n" + vertex[0],vertex[1], vertex[2], vertex[3]))
