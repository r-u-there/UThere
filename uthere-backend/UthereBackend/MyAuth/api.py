from pydantic import BaseModel
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Form
import imageio.v3 as iio
import uvicorn
import cv2
from fastapi.middleware.cors import CORSMiddleware
import math
import numpy as np
# from models import AttentionScore, User


frame_count = 0

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
async def upload_video(file: UploadFile = File(...), time: str = Form(...), user_id: str = Form(...)):
    try:
        global frame_count
        print(file.filename)
        print(time)
        print(user_id)
        bytes = file.file.read()
        frames = iio.imread(bytes, index=None, format_hint=".webm")
        frames = frames[:200]
        print(len(frames))

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

        print(len(selected_frames))
        # for frame in frames:
        #     #write frame_uint8 to file using cv2
        #     bgr_image = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        #     cv2.imwrite(f'frames/result_{frame_count}.png', bgr_image)
        #     frame_count += 1
        # bgr_image = cv2.cvtColor(frames[0], cv2.COLOR_RGB2BGR)
        # cv2.imwrite(f'frames/result_{frame_count}.png', bgr_image)
        # frame_count += 1
        # user = User.objects.get(id=user_id)
        # print(user)
        # att_score = AttentionScore(User= user, time=time)
        # print(att_score)
        # att_score.save()
    except Exception as e:
        print(e)
        return {"message": "Video file not found."}

if __name__ == '__main__':
    uvicorn.run(app, port=8008, host="0.0.0.0")
    