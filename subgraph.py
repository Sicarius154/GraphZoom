class SubGraph:
    def __init__(self):
        self.nodes = []

    def add_node(self, node):
        '''
            Add a node to the graph
            :param vertex: takes a string that is the ID of the node
        '''
        self.nodes.append(node)
    def get_nodes(self):
        '''
            Returns a list of node ID's in the subgraph. The main graph has all further data relating
            to the nodes
        '''
        return self.nodes
