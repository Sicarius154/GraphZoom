class Poset:
    '''Represents a poset for the graph '''
    def __init__(self):
        self.objects = []

    def addObject(self, obj):
        '''Add an object to the Poset
           obj for vertex: a tuple (0, id, x-cord, y-cord)
           obj for edge: a tuple (1, id, x-cord, y-cord, endPoint1, endPoint2)
        '''

        self.objects.append(obj)

    def getEdges(self):
        '''Returns a list of the edges in the poset
           Returns (id/label, [nodes connected to edge])'''
        values = []
        for e in self.objects:
            if(e[0] == 1):
                values.append((e[1], e[2])) #Return id and list of nodes the edge connects
        return values
    def getVertices(self):
        '''Returns a list of the vertex in the poset
           Returns (id/label, xcord, ycord)'''
        values = []
        for v in self.objects:
            if(v[0] == 0):
                values.append((v[1], v[2], v[3])) #Return the node ID/label("-" if none provided) x and y cords of the vertex
        return values
