from graph import Graph
from PyQt5 import QtCore, QtGui, QtWidgets, uic
import uiMainWindow
import relation
import graph
vertices = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
edges = [(5,8)]
g = graph.Graph()
for v in vertices:
    g.addNode(v)
for e in edges:
    g.addEdge(e)
g.draw()

'''
#Start the application
if __name__ == '__main__':
    import sys
    app = QtWidgets.QApplication(sys.argv  )
    window = uiMainWindow.MainWindow()
    window.show()
    sys.exit(app.exec_())
'''
