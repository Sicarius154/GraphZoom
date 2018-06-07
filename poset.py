class Poset:
    '''Represents a poset for the graph '''
    def __init__(self):
        self.objects = []

    def addObject(self, obj):
        '''Add an object to the Poset
           obj for node: a tuple (0, id, x-cord, y-cord, lbl)
           obj for edge: a tuple (1, id, endPoint1, endPoint2, lbl)
        '''

        self.objects.append(obj)

    def getEdges(self):
        '''Returns a list of the edges in the poset
           Returns (id, [nodes connected to edge], lbl)'''
        values = {}
        for e in self.objects:
            values[e] = []
            values[e].append(e[1])
            values[e].append(e[2])
        for e in self.objects:
            if(e[0] == 1):
                values.append((e[1], e[2])) #Return id and list of nodes the edge connects
        return values
    def getVertices(self):
        '''Returns a list of the node in the poset
           Returns (id/label, xcord, ycord)'''
        values = []
        for v in self.objects:
            if(v[0] == 0):
                values.append((v[1], v[2], v[3], v[4])) #Return the node ID/label("-" if none provided) x and y cords of the node
        return values
