'''
    Wrriten by Chris London

    This file is called by Flask and will serve as the main event manager for the UI
'''
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def root():
    return render_template("index.html")

@app.route('/help')
def help():
    return render_template("help.html")



#Start the application
if __name__ == '__main__':
    app.run()
