import random
import datetime
import json
import os
import io
from subgraph import SubGraph

class Graph:
    '''
        Holds all data about a graph. Contains the methods to add, remove and modify nodes, edges, relation and subgraph data.
        Facilitates saving and loading of files, performs operations on itself.
    '''
    def __init__(self):
        self.next_node_id = 0 #the next id number for elements
        self.next_edge_id = 0 #the next id number for elements
        self.nodes = []
        self.edges = []
        self.relation = []
        self.operation_results = []
        self.sub_graph = SubGraph() #this is used to store a new Graph object that represents a selected sub-graph of the main graph for use with operations

    def set_graph_from_json(self, json_string):
        ''' This method will set the entire graph from a JSON object.
            This is the representation the front-end should see.
            It's expected that nodes will be of the format:
            (id, x, y, label)
            and edges of the format:
            (id, source, target, label)
            :param json_string: The string to set the graph from
        '''
        #we need to clear the current data from the graph as they are all going to be set again
        self.nodes = []
        self.edges = []
        self.relation = []
        self.operation_results = []
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

    def set_subgraph_from_json(self, json_string):
            '''
                This method is very similar to the set_graph_from_json method. It simply
                Takes a JSON string and adds the elements to the subgraph
                :param json_string: The string to set the subgraph from. Should be a list
            '''
            #we need to clear the current data from the graph as they are all going to be set again
            sub_graph = SubGraph()

            json_string = json.loads(json_string) #convert the JSON string to a python list

            #itterate over the elements and add them to the graph
            for node in json_string:
                sub_graph.add_node(node)

            self.sub_graph = sub_graph

    def add_relation_from_json(self, json_string):
        '''
            Adds new relation data
            :param json_string: The JSON string representing the relation [[x1,x2], [x3, x4], [x1, x4]...]
        '''
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
        print("Is relation stable:", self.is_stable())
        #iterate over ordered pair in the relation
        for relation_edge in self.relation:
            #If the source (first element in the pair) is in the subset, add the target to the new subset
            if relation_edge[0] in self.sub_graph.nodes:
                self.operation_results.append(relation_edge[1])
        new_graph = Graph()
        new_graph.set_graph_from_json(self.get_json_representation())
        new_graph.sub_graph.nodes = self.operation_results
        return new_graph

    def erode(self):
        '''
            Performs erosion on the graph G given a relation R and subset S. For an element to be in the erosion, it must meet one of two criteria:
            1) it goes nowehere in the relation
            2) it goes only to elements in the subgraph
            :return: Return a new graph G' such that the subset/subgraph of G' is the result of erosion on G
        '''
        print("Is relation stable:", self.is_stable())
        set_of_nodes = [] #This will hold all nodes in the erosion
        set_of_excluded_nodes = [] #Because we are checking across to criteria it makes sense to have this to hold all nodes that fail one or more criteria
        relation_source_nodes = [] # Stores all of the ndoes that go somewhere in the relation

        #loop over the entire relation, for every pair see if the source node only goes to node in the subgraph
        for pair in self.relation:
            if pair[1] in self.sub_graph.nodes:
                set_of_nodes.append(pair[0])
            else:
                set_of_excluded_nodes.append(pair[0])
            relation_source_nodes.append(pair[0])

        #now check for all for all of the nodes that go nowehere in the relation
        for node in self.nodes:
            if not node in relation_source_nodes:
                set_of_nodes.append(node[0])

        self.operation_results = list(set(set_of_nodes) - set(set_of_excluded_nodes))
        #Construct the new graph
        new_graph = Graph()
        new_graph.set_graph_from_json(self.get_json_representation())
        new_graph.sub_graph.nodes = self.operation_results
        return new_graph

    def open(self):
        '''
            Performs an opening on the graph (erode->dilate)
            :returns: A new graph on which an opening operation was performed
        '''
        print("Is relation stable:", self.is_stable())
        return self.erode().dilate()

    def close(self):
        '''
            Performs an closing on the graph (dilate->erode)
            :returns: A new graph on which an closing operation was performed
        '''
        print("Is relation stable:", self.is_stable())
        return self.dilate().erode()

    def is_stable(self):
        '''
            Determines if the relation is stable
            :return: True if stable, else False
        '''
        print(self.edges)
        print(self.edges[0][2], self.edges[0][3])
        edges_as_pairs = set([(edge[2], edge[3]) for edge in self.edges]) #get edges as pairs of id'
        #Create a composition in the form H composed R composed H
        comp = self.compose_sets(self.compose_sets(edges_as_pairs, self.relation), edges_as_pairs)
        if set(self.relation).issubset(comp):
            return True
        return False

    def compose_sets(self, set1, set2):
        '''
            This will compose two sets
            :param set1: The first set
            :param set2: The second set
            :return: A new set
        '''
        return set([()for pair1 in set1 for pair2 in set2 if pair1[1]==pair2[0]])

    def get_json_representation(self):
        '''
            Returns the graph as a JSON object
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
            :param json_string: The json_string containing a list of nodes to add to the subgraph
        '''
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
