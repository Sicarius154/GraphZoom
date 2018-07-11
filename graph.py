from poset import Poset
import random
import datetime
import json

class Graph:
    '''
        The class that will hold all edges, vertices and other information pertaining to the drawing of a graph
    '''
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.relations = {"nodes": [], "edges": []}
        self.operation_results = [] #will represent a set of edges and nodes, with labels etc. This will be the result of an erosion, dilation etc

    def set_graph_from_json(self, json_string):
        ''' This method will set the entire graph from a JSON object.
            This is the representation the front-end should see.
            It's expected that nodes will be of the format:
            (id, x, y, label)
            and edges of the format:
            (id, source, target, label)
        '''
        #TODO: Split this into two seperate functions that add edges and nodes independently
        #TODO: Perform integrity check on the relation data
        #we need to clear the current data from the graph as they are all going to be set again
        self.nodes = []
        self.edges = []
        self.relations = {"nodes": [], "edges": []}
        self.operation_results = {}
        json_string = json.loads(json_string) #convert the JSON string to a python dict

        #itterate over the elements and add them to the graph
        for node in json_string['nodes']:
            self.add_node(node)

        for edge in json_string['edges']:
            self.add_edge(edge)

        self.relations = json_string['relation']

    def add_relation_from_json(self, json_string):
        json_vals = json.loads(json_string)
        relation = None
        self.relations = {"nodes": [], "edges": []}

        for element in json_vals['nodes']:
            self.relations.add(element)
        for element in json_vals['edges']:
            self.relations.add(element)
    def dilate(self):
        pass

    def erode(self):
        pass

    def get_json_representation(self):
        '''
            Returns the graph as a JSON object, as the front-end expects it
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

    def add_node(self, node):
        '''
            Add a node to the graph
            :param vertex: takes a tuple: (id, x-cord, y-cord, lbl)
        '''
        self.nodes.append(node)

    def add_edge(self, edge):
        '''Add an edge to the graph
           :paran edge: takes a tuple: (id, endPoint1, endPoint2, lbl)
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
        '''
            self will take a poset as input. The function the adds all vertices to the
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
    def get_operation_results_as_json(self):
        '''
            Returns the results of an operation such as dilation or erosion as JSON
            :returns: JSON representation containing edges and nodes. {nodes: {(...),(...)}, edges:{(...),(...)}}
        '''
        return self.operation_results

    def save_graph(self, path="/saved/{date:%Y-%m-%d %H:%M:%S}.graph".format(date=datetime.datetime.now())):
        '''
            Saves the current graph in its JSON representation, or as a Python object using pickle. If the file already exists it will be overwritten
            :param path: Path in which to store the graph
        '''
        print("Saving graph as " + path)
        #Ensure the filename has the correct file extension
        if path[-6:] != ".graph":
            path += ".graph"

        with open(path, "w") as file:
            if use_json:
                graph_to_save = graph.get_json_representation()
                file.write(graph_to_save)
                print("Graph written to file.")

    def load_graph(self, path):
        '''
            Reads the file in the directory given. Will read back as JSON and then set the graph to the graph loaded
            :param path: Path of the file to load
        '''
        if filename[-6:] != ".graph":
            raise ValueError("Invalid filename, must end in .graph")
            pass

        print("Loading graph from " + dir+filename)
        graph_json = None
        with open(path, "r") as file:
            graph_json = file.read()
            self.set_graph_from_json(graph_json)
        print("Graph loaded...")
