import itertools
class Relation:
    def __init__(self, vertices, edges):
        self.vertices = vertices
        self.edges = edges
    def addNode(self, x):
        self.vertices.append(x)
    def addEdge(self, nodex, nodey):
        self.vertices.append((nodex, nodey))
    def generateFromTwoSets(self, setx, sety):
        #Obtain cart. product of the two sets and append each
        #distinct tuple
        for element in itertools.product(setx, sety):
            self.edges.append(element)
    def isStable(self):
        #TODO: Create the function to check a relation is stable
        pass
    def isEmpty(self):
        #if there are no vertices in the relation then it is empty
        if self.vertices is None:
            return True
        else:
            return False
