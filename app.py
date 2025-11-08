from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('demo.html') 

@app.route('/get_places')
def get_places():
    with open('static/places.json', 'r', encoding='utf-8') as f:
        places = json.load(f)
    return jsonify(places)

if __name__ == '__main__':
    app.run(debug=True)
