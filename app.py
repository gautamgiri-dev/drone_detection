import cv2
from flask import Flask, render_template, request, jsonify, make_response
from waitress import serve
from werkzeug.utils import secure_filename
import os
from tensorflow.keras.models import load_model
from uuid import uuid4
import numpy as np

TEMPLATE_PATH = os.path.join(os.getcwd(), 'templates')
MODEL_PATH = os.path.join(os.getcwd(), 'model', 'model.h5')
UPLOAD_PATH = os.path.join(os.getcwd(), 'static', 'uploads')
RESULTS_PATH = os.path.join(os.getcwd(), 'results')
REQUIRED_PATHS = [UPLOAD_PATH]
for path in REQUIRED_PATHS:
    os.makedirs(path, exist_ok=True)

model = load_model(MODEL_PATH)

app = Flask(__name__)
app.config['UPLOAD_PATH'] = UPLOAD_PATH

# Home Route
@app.route('/')
def index():
    return render_template('index.html')

# API Endpoint
@app.route('/api/detect', methods=['POST'])
def detect():
    if request.method == 'POST':
        file = request.files['file']
        filename = secure_filename(file.filename)
        FILENAME = uuid4().hex
        filename = os.path.join(app.config['UPLOAD_PATH'], FILENAME)
        file.save(filename)
        boxes, confidences = predict(filename)
        return make_response(jsonify({'image': FILENAME, 'boxes': boxes, 'confidences': confidences}), 200)
    else:
        return 'Method not allowed', 400

# Util Function
def predict(image, target_size=(300,300)):
    # preprocessing
    image = cv2.imread(image, 1)
    image = cv2.resize(image, target_size)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.astype("float") / 255.0
    image = np.expand_dims(image, axis=0)
    
    # prediction and post processing
    results = model.predict(image)
    boxes, confidences = results

    return boxes.tolist(), confidences.tolist()


if __name__ == '__main__':
    serve(app)
