from flask import Flask, render_template, jsonify
import sqlite3

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('demo.html')  # this is your HTML file

@app.route('/get_places')
def get_places():
    connection = sqlite3.connect('places.db')
    cursor = connection.cursor()
    cursor.execute("SELECT name, location, category FROM places")
    rows = cursor.fetchall()
    connection.close()

    places = []
    for row in rows:
        places.append({
            "name": row[0],
            "location": row[1],
            "category": row[2]
        })
    return jsonify(places)

if __name__ == '__main__':
    app.run(debug=True)




# from flask import Flask, render_template, jsonify, request
# import json

# app = Flask(__name__)

# @app.route('/')
# def home():
#     return render_template('demo.html')

# @app.route('/search', methods=['POST'])
# def search():
#     data = request.get_json()
#     location = data.get('location', '').lower()
#     place_type = data.get('place_type', '').lower()

#     with open('data/places.json', 'r', encoding='utf-8') as f:
#         data = json.load(f)
#         all_places = data["places"]

#     # Filter logic
#     filtered = [
#         p for p in all_places
#         if location in p["address"].lower() or location in p["name"].lower()
#     ]

#     # If place_type is given, further filter by it
#     if place_type:
#         filtered = [p for p in filtered if p["type"].lower() == place_type]

#     return jsonify({"places": filtered})

# if __name__ == '__main__':
#     app.run(debug=True)
