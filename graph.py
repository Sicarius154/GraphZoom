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
        self.next_node_id = 0 #the next id number for elements
        self.next_edge_id = 0 #the next id number for elements
        self.nodes = []
        self.edges = []
        self.relation = []
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
        self.relation = []
        self.operation_results = {}
        self.sub_graph = SubGraph()
        json_string = json.loads(json_string) #convert the JSON string to a python dict

        for node in json_string["nodes"]:
            self.add_node([node["data"]["id"], node["data"]["label"],node["position"]["x"], node["position"]["y"]])

        for edge in json_string["edges"]:
            self.add_edge([edge["id"], edge["label"], edge["source"], edge["target"]])

        self.relation = json_string["relation"]

        self.sub_graph = SubGraph()
        self.sub_graph.nodes = json_string["sub_graph"]
        self.next_node_id = json_string["next_node_id"]
        self.next_edge_id = json_string["next_edge_id"]

    def add_relation_from_json(self, json_string):
        json_vals = json.loads(json_string)
        relation = None
        self.relation = []

        for element in json_vals:
            self.relation.append(element)

    def dilate(self):
        '''
            Performs dilation on the graph G given a relation R and subset S
            :return: Return a new graph G' such that the subset/subgraph of G' is the result of dilation on G
        '''
        #iterate over ordered pair in the relation
        for relation_edge in self.relation:
            #If the source (first element in the pair) is in the subset, add the target to the new subset
            if relation_edge[0] in self.sub_graph.nodes:
                self.operation_results.append(relation_edge[1])
        new_graph = Graph()
        new_graph.sub_graph.nodes = self.operation_results
        return new_graph


    def erode(self):
        '''
            Performs erosion on the graph G given a relation R and subset S
            :return: Return a new graph G' such that the subset/subgraph of G' is the result of erosion on G
        '''
        for relation_edge in self.relation:
            if relation_edge[0] not in self.sub_graph.nodes:
                pass
            elif relation_edge[0] not in self.sub_graph.nodes:
                pass
    def get_json_representation(self):
        '''
            Returns the graph as a JSON object, as the front-end expects it
        '''
        nodes = []
        edges = []
        subgraph_nodes = []
        relation = []
        subgraphNodes = []
        json_string = {"nodes":[], "edges":[], "relation":[], "sub_graph":[], "next_node_id": self.next_node_id, "next_edge_id": self.next_edge_id}
        #convert all of the nodes in the graph to a json representation that the UI framework can deal with
        for node in self.nodes:
            data = {"id":"", "label":""}
            position = {"x":0, "y":0}
            jsonNode = {"data": data, "position": position}
            data["id"] = node[0]
            data["label"] = node[1]
            position["x"] = node[2]
            position["y"] = node[3]
            jsonNode["data"] = data
            jsonNode["position"] = position
            nodes.append(jsonNode)
        #convert all of the edges in the graph to a json representation that the UI framework can deal with
        for edge in self.edges:
            jsonEdge = {"id":"", "label":"", "source":"", "target":""}
            jsonEdge["id"] = edge[0]
            jsonEdge["label"] = edge[1]
            jsonEdge["source"] = edge[2]
            jsonEdge["target"] = edge[3]
            edges.append(jsonEdge)


        subgraph_nodes = self.sub_graph.nodes
        relation = self.relation

        json_string["nodes"] = nodes;
        json_string["edges"] = edges
        json_string["relation"] = relation
        json_string["sub_graph"] = subgraph_nodes
        json_string = json.dumps(json_string)

        #returns a string of nodes and edges, Cytoscape infers which are edges and ndoes based on their data values
        return json_string

    def add_node(self, node):
        '''
            Add a node to the graph
            :param vertex: takes a tuple: (id, lbl, x-cord, y-cord)
        '''
        self.nodes.append(node)

    def add_edge(self, edge):
        '''Add an edge to the graph
           :param edge: takes a tuple: (id, lbl, endPoint1, endPoint2)
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
        try:
            with open(path, "w") as file:
                graph_to_save = self.get_json_representation()
                file.write(str(graph_to_save))
                print("Graph written to file: ", path)
        except FileExistsError:
            print("File already exists and could not be overwritten!")
    def load_graph(self, path):
        '''
            Reads the file in the directory given. Will read back as JSON and then set the graph to the graph loaded
            :param path: Path of the file to load
        '''
        if path[-6:] != ".graph":
            raise ValueError("Invalid filename, must end in .graph")

        print("Loading graph from: ", path)
        graph_json = None
        try:
            with open(path, "r") as file:
                graph_json = file.read()
                import html
                html.unescape(graph_json)
                self.set_graph_from_json(graph_json)
            print("Graph loaded...")
        except FileNotFoundError:
            print("File not found!")

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
        for node in json_string:
            sub_graph.add_node(node)

        self.sub_graph = sub_graph

    def get_sub_graph_as_json(self):
        '''
            Returns the sub-graph as JSON string
        '''
        return self.sub_graph.get_json_representation()
