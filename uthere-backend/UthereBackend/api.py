import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "UthereBackend.settings")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Debug messages silenced
import tensorflow as tf
from tensorflow.keras.models import load_model

# Configure Django
django.setup()

from fastapi import FastAPI, File, UploadFile, Form
import imageio.v3 as iio
import uvicorn
import cv2
from fastapi.middleware.cors import CORSMiddleware
import math
import numpy as np
from MyAuth.models import AttentionScore, User
from asgiref.sync import sync_to_async
from Features.extractor import FeatureExtractor
import time
from statistics import mode
from deepface import DeepFace

# Load the saved model
model = load_model('attention_model/my_model.h5')

feature_extractor = FeatureExtractor(num_frames=200)

app = FastAPI(title="Image Process", version="1.0")
# Set up CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/upload-video/')
async def upload_video(file: UploadFile = File(...), timestamp: str = Form(...), user_id: str = Form(...)):
    try:
        start = time.time()
        global feature_extractor
        global model

        print(f'Got the frames from time: {timestamp}')
        bytes = file.file.read()
        frames = iio.imread(bytes, index=None, format_hint=".webm")

        # Pad the frames to 200
        selected_frames = []
        if len(frames) > 200:
            i = 0
            while int(math.ceil(i)) < len(frames):
                ind = int(math.ceil(i))
                selected_frames.append(frames[ind])
                i += len(frames)/200 
        elif len(frames) == 200:
            selected_frames = frames
        else:
            num_frames = len(frames)
            num_to_pad = 200 - num_frames
            values = np.linspace(0, len(frames)-1, num_to_pad, dtype=int)
            for i, frame in enumerate(frames):
                selected_frames.append(frame)
                if i in values:
                    selected_frames.append(frame)

        print(f'Frames padded, new frames count:{len(selected_frames)}')
        selected_frames = [cv2.cvtColor(frame, cv2.COLOR_RGB2BGR) for frame in selected_frames]
         # Extract the features from the frames
        height, width, channels = frames[0].shape
        feature_extractor.frame_height = height
        feature_extractor.frame_width = width
        features = feature_extractor.extract_features(selected_frames, timestamp)
        print('Features extracted')
        pred_scores = model.predict(features, verbose=0)
        pred_class = np.argmax(pred_scores)+ 1
        print(f'Got prediction for frames: {pred_class}')

        emotions = []
        for i in range(0, 200, 20):
            result = DeepFace.analyze(selected_frames[i], actions = ['emotion'], detector_backend = "mediapipe", silent = True)
            emotions.append(result[0]['dominant_emotion'])
        
        # emotion = result['emotion']['dominant']
        # print(f'Got prediction for emotion: {emotion}')
        most_common_emotion = mode(emotions)
        print(emotions)
        print(most_common_emotion)
        user = await sync_to_async(User.objects.get)(id=user_id)
        att_score = AttentionScore(user= user, time=timestamp,score = pred_class)
        await sync_to_async(att_score.save)()
        end = time.time()
        print(f'Execution time: {end - start}')
    except Exception as e:
        print(e)
        return {"message": "Video file not found."}

if __name__ == '__main__':
    uvicorn.run(app, port=8008, host="0.0.0.0")