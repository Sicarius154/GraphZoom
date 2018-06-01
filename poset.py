class Poset:
    '''Represents a poset for the graph '''
    def __init__(self):
        self.objects = []

    def addObject(self, obj):
        '''Add an object to the Poset
           obj: a tuple (typeofObject, id, x-cord, y-cord)
        '''

        self.objects.append(obj)

    def getEdges(self):
        '''Returns a list of the edges in the poset '''
        values = []
        for e in self.objects:
            if(e[0] == 1):
                values.append((e[1], e[2], e[3], e[4], e[5])) # (id, xcord, ycord, endPoint1, endPoint2)
        return values
    def getVertices(self):
        '''Returns a list of the vertex in the poset '''
        values = []
        for v in self.objects:
            if(v[0] == 0):
                values.append((v[1], v[2], v[3])) #(id, xcord, ycord)
        return values
