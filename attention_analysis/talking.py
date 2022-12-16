import cv2
import mediapipe as mp
import time

# Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh()

def distance(point_1, point_2):
    """Calculate l2-norm between two points"""
    dist = ((point_2.x - point_1.x)** 2 + (point_2.y - point_1.y)** 2) ** 0.5
    return dist

cap = cv2.VideoCapture(0)
i = 0
prev_distance = 0
while cap.isOpened():
    ret, image = cap.read()
    height, width, _ = image.shape
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Facial landmarks
    result = face_mesh.process(rgb_image)
    facial_landmarks = result.multi_face_landmarks[0]
    pt0 = facial_landmarks.landmark[0]
    x0 = int(pt0.x * width)
    y0 = int(pt0.y * height)
    pt17 = facial_landmarks.landmark[17]
    x17 = int(pt17.x * width)
    y17 = int(pt17.y * height)
    dist = distance(pt0,pt17)
    #print("distance is " + str(dist))
    if i == 0:
        prev_distance = dist
        #print("prev_distance is " + str(prev_distance))
    else:
        #print("difference between the distances " + str(abs(dist-prev_distance)))
        if abs(dist-prev_distance) > 0.01:
            cv2.putText(img=image, text='Talking', org=(150, 250), fontFace=cv2.FONT_HERSHEY_TRIPLEX, fontScale=3, color=(0, 255, 0),thickness=3)
        prev_distance = dist
    cv2.circle(image, (x0, y0), 2, (100, 100, 0), -1)
    cv2.circle(image, (x17 ,y17), 2, (100, 100, 0), -1)
    i = i + 1
    #cv2.putText(image, str(i), (x, y), 0, 1, (0, 0, 0)
    cv2.imshow("Image", image)
    cv2.waitKey(1)