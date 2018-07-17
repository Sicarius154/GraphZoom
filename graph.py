import random
import datetime
import json
import os
import io
from subgraph import SubGraph

class Graph:
    '''
        The class that will hold all edges, vertices and other information pertaining to the drawing of a graph
    '''
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.relations = {"nodes": [], "edges": []}
        self.operation_results = [] #will represent a set of edges and nodes, with labels etc. This will be the result of an erosion, dilation etc
        self.sub_graph = SubGraph() #this is used to store a new Graph object that represents a selected sub-graph of the main graph for use with operations

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

        #self.relations = json_string['relation']

    def add_relation_from_json(self, json_string):
        json_vals = json.loads(json_string)
        relation = None
        self.relations = {"nodes": [], "edges": []}

        for element in json_vals['nodes']:
            self.relations["nodes"].append(element)
        for element in json_vals['edges']:
            self.relations["edges"].append(element)
        print("The current relation is")

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

    def get_operation_results_as_json(self):
        '''
            Returns the results of an operation such as dilation or erosion as JSON
            :returns: JSON representation containing edges and nodes. {nodes: {(...),(...)}, edges:{(...),(...)}}
        '''
        return self.operation_results

    def save_graph(self, path):
        '''
            Saves the current graph in its JSON representation. If the file already exists it will be overwritten
            :param path: Path in which to store the graph
        '''
        with open(path, "w") as file:
            graph_to_save = self.get_json_representation()
            file.write(str(graph_to_save))
            print("Graph written to file. \"%s\"", path)

    def load_graph(self, path):
        '''
            Reads the file in the directory given. Will read back as JSON and then set the graph to the graph loaded
            :param path: Path of the file to load
        '''
        if path[-6:] != ".graph":
            raise ValueError("Invalid filename, must end in .graph")

        print("Loading graph from %s", path)
        graph_json = None
        with open(path, "r") as file:
            graph_json = file.read()
            self.set_graph_from_json(graph_json)
        print("Graph loaded...")

    def set_subgraph_from_json(self, json_string):
        '''
            This method is very similar to the set_graph_from_json method. It simply
            Takes a JSON string and adds the elements to the subgraph
        '''
        #TODO: Split this into two seperate functions that add edges and nodes independently
        #TODO: Perform integrity check on the relation data
        #we need to clear the current data from the graph as they are all going to be set again
        sub_graph = SubGraph()

        json_string = json.loads(json_string) #convert the JSON string to a python dict

        #itterate over the elements and add them to the graph
        for node in json_string['nodes']:
            sub_graph.add_node(node)

        self.sub_graph = sub_graph
        print("The current sub-graph is:")

    def get_sub_graph_as_json(self):
        '''
            Returns the sub-graph as JSON string
        '''
        return self.sub_graph.get_json_representation()
