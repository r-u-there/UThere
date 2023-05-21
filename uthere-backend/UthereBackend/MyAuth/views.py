import os
import cv2
import math
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from MyAuth.models import AttentionEmotionScore, User, Meeting
from Features.extractor import FeatureExtractor
import time
from statistics import mode
from deepface import DeepFace
from datetime import datetime
import imageio.v3 as iio
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Debug messages silenced
import tensorflow as tf
from tensorflow.keras.models import load_model

# Load the saved model
upp = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(upp, 'attention_model/model_5second2.h5')
model = load_model(model_path)

feature_extractor = FeatureExtractor(num_frames=100)


@csrf_exempt
def upload_video(request):
    try:
        start = time.time()
        global feature_extractor
        global model

        timestamp = request.POST.get('timestamp')
        user_id = request.POST.get('user_id')
        meeting_id = request.POST.get('meeting_id')

        print(f'Got the frames from time: {timestamp}')
        file = request.FILES['file']
        file_bytes = file.read()
        frames = iio.imread(file_bytes, index=None, format_hint=".webm")

        # Pad the frames to 100
        selected_frames = []
        if len(frames) > 100:
            i = 0
            while int(math.ceil(i)) < len(frames):
                ind = int(math.ceil(i))
                selected_frames.append(frames[ind])
                i += len(frames) / 100
        elif len(frames) == 100:
            selected_frames = frames
        else:
            num_frames = len(frames)
            num_to_pad = 100 - num_frames
            values = np.linspace(0, len(frames) - 1, num_to_pad, dtype=int)
            for i, frame in enumerate(frames):
                selected_frames.append(frame)
                if i in values:
                    selected_frames.append(frame)

        print(f'Frames padded, new frames count: {len(selected_frames)}')
        selected_frames = [cv2.cvtColor(frame, cv2.COLOR_RGB2BGR) for frame in selected_frames]

        # Extract the features from the frames
        height, width, channels = frames[0].shape
        feature_extractor.frame_height = height
        feature_extractor.frame_width = width
        features = feature_extractor.extract_features(selected_frames, timestamp)
        print('Features extracted')
        pred_scores = model.predict(features, verbose=0)
        pred_class = np.argmax(pred_scores) + 1
        print(f'Got prediction for frames: {pred_class}')

        emotions = []
        for i in range(0, 100, 10):
            result = DeepFace.analyze(selected_frames[i], actions=['emotion'], detector_backend="mediapipe",
                                      silent=True)
            emotions.append(result[0]['dominant_emotion'])

        most_common_emotion = mode(emotions)
        print(most_common_emotion)
        EMOTION_ENUM = {'sad': 0, 'angry': 1, 'surprise': 2, 'fear': 3, 'happy': 4, 'disgust': 5, 'neutral': 6}
        emotion_id = EMOTION_ENUM[most_common_emotion]

        user = User.objects.get(id=user_id)
        meeting = Meeting.objects.get(id=meeting_id)
        att_score = AttentionEmotionScore(user=user, meeting=meeting,
                                           time=datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%S.%fZ'),
                                           attention_score=pred_class, emotion=emotion_id)
        att_score.save()
        end = time.time()
        print(f'Execution time: {end - start}')

        return JsonResponse({"message": "Video uploaded successfully."})

    except Exception as e:
        print(e)
        return JsonResponse({"message": "Video file not found."})
