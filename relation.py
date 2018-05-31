import itertools
class Relation:
    def __init__(self, vertices = None, edges = None):
        self.vertices = vertices
        self.edges = edges
        self.stable = False #will be set to True after being generated
        self.setx = None
        self.sety = None
    def addNode(self, x):
        self.vertices.append(x)
    def addEdge(self, nodex, nodey):
        self.vertices.append((nodex, nodey))
    def generateFromTwoSets(self, setx, sety):
        self.setx = setx
        self.sety = sety

        #Obtain cart. product of the two sets and append each
        #distinct tuple
        for element in itertools.product(setx, sety):
            self.edges.append(element)
        self.stable = isStable()
    def isStableWith(self, otherR):
        #TODO: Create the function to check a relation is stable
        vertices = []
        if edges is None:
            return False

        #Iterate over all of the edges to obtain every unique vertex in the relation
        for v in self.edges:
             if v not in vertices:
                 vertices.append(v)

        #Grab sets of 4 unique elements, create unique 2-tuples of them and ensure
        #that the relation satisfies the rules for a stable relation
        uniqueVertices = itertools.combinations(vertices, 4)
        for group in uniqueVertices:
            if (group[0], group[1]) in self.edges:
                if (group[1], group[2]) in otherR.edges:
                    if (group[2], group[3]) in self.edges:
                        if (group[0], group[3]) in otherR.edges:
                                break
            self.isStable = True
            return True

        self.isStable = False
        return False

    def isEmpty(self):
        #if there are no vertices in the relation then it is empty
        if self.vertices is None:
            return True
        else:
            return False
