import itertools
class Relation:
    def __init__(self, vertices = None, edges = None):
        self.vertices = vertices
        self.edges = edges
        self.stable = False #will be set to True after being generated

    def add_node(self, x):
        self.vertices.append(x)

    def add_edge(self, nodex, nodey):
        self.vertices.append((nodex, nodey))

    #This will generate a relation using two sets, which could
    #be the same or distinct. This will use the entire cart. product for the relation
    def generate_from_two_sets(self, setx, sety):
        self.setx = setx
        self.sety = sety

        #Obtain cart. product of the two sets and append each
        #distinct tuple
        for element in itertools.product(setx, sety):
            self.edges.append(element)

    def is_stable_with(self, otherR):
        #TODO: Create the function to check a relation is stable
        vertices = []
        if edges is None:
            return False

        #Iterate over all of the edges to obtain every unique vertex in the relation
        for v in self.edges:
             if v not in vertices:
                 vertices.append(v)

        #Grab combinations of 4 elements, then check that the logic for a stable relation holds
        #TODO: Improve the efficiency of the nested if statements
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

    def is_empty(self):
        #if there are no vertices in the relation then it is empty
        if self.vertices is None:
            return True
        else:
            return False
