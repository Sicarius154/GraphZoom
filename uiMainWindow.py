from PyQt5 import QtCore, QtGui, QtWidgets, uic

class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super(MainWindow, self).__init__()
        uic.loadUi('uiMainWindow.ui', self)
