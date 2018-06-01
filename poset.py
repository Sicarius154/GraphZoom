class Poset:
    '''Represents a poset for the graph '''
    def __init__(self):
        self.objects[]

    def addObject(self, obj):
        '''Add an object to the Poset
           obj: a tuple (typeofObject, id, x-cord, y-cord)
        '''
        if len(obj) != 6:
            raise Exception("Invalid tuple supplied for poset")
        else:
            self.objects.append(obj)

    def getEdges(self):
        '''Returns a list of the edges in the poset '''
        values = []
        for e in self.objects:
            if(e[0] == 1):
                values.append(e)
        return values
    def getVertices(self):
        '''Returns a list of the vertex in the poset '''
        values = []
        for v in self.objects:
            if(e[0] == 0):
                values.append(v)
        return values
