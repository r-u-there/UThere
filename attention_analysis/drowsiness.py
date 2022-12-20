import cv2
import time
import numpy as np
import mediapipe as mp
import utils
from mediapipe.python.solutions.drawing_utils import _normalized_to_pixel_coordinates as denormalize_coordinates

CET_FRAMES = 3 # closed eyes threshold frames
TOTAL_BLINKS = 0 # total blinks counter 
CLOSED_EYES_FRAMAE_COUNTER = 0 # count frames while the eyes are closed.
# Left eyes indices 
LEFT_EYE =[ 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385,384, 398 ]

# right eyes indices
RIGHT_EYE=[ 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161 , 246 ]  

mp_facemesh = mp.solutions.face_mesh
mp_drawing  = mp.solutions.drawing_utils
denormalize_coordinates = mp_drawing._normalized_to_pixel_coordinates
 
def distance(point_1, point_2):
    """Calculate l2-norm between two points"""
    dist = sum([(i - j) ** 2 for i, j in zip(point_1, point_2)]) ** 0.5
    return dist

def get_ear(landmarks, refer_idxs, frame_width, frame_height):
    """
    Calculate Eye Aspect Ratio for one eye.
 
    Args:
        landmarks: (list) Detected landmarks list
        refer_idxs: (list) Index positions of the chosen landmarks
                            in order P1, P2, P3, P4, P5, P6
        frame_width: (int) Width of captured frame
        frame_height: (int) Height of captured frame
 
    Returns:
        ear: (float) Eye aspect ratio
    """
    try:
        # Compute the euclidean distance between the horizontal
        coords_points = []
        for i in refer_idxs:
            lm = landmarks[i]
            coord = denormalize_coordinates(lm.x, lm.y, 
                                             frame_width, frame_height)
            coords_points.append(coord)
 
        # Eye landmark (x, y)-coordinates
        P2_P6 = distance(coords_points[1], coords_points[5])
        P3_P5 = distance(coords_points[2], coords_points[4])
        P1_P4 = distance(coords_points[0], coords_points[3])
 
        # Compute the eye aspect ratio
        ear = (P2_P6 + P3_P5) / (2.0 * P1_P4)
 
    except:
        ear = 0.0
        coords_points = None
 
    return ear, coords_points

def calculate_avg_ear(landmarks, left_eye_idxs, right_eye_idxs, image_w, image_h):
    """Calculate Eye aspect ratio"""
 
    left_ear, left_lm_coordinates = get_ear(
                                      landmarks, 
                                      left_eye_idxs, 
                                      image_w, 
                                      image_h
                                    )
    right_ear, right_lm_coordinates = get_ear(
                                      landmarks, 
                                      right_eye_idxs, 
                                      image_w, 
                                      image_h
                                    )
    Avg_EAR = (left_ear + right_ear) / 2.0
 
    return Avg_EAR, (left_lm_coordinates, right_lm_coordinates),(landmarks[0].x * image_w,landmarks[0].y*image_h),(landmarks[17].x*image_w,landmarks[17].y*image_h)

def get_mediapipe_app(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    ):
    """Initialize and return Mediapipe FaceMesh Solution Graph object"""
    face_mesh = mp.solutions.face_mesh.FaceMesh(
        max_num_faces=max_num_faces,
        refine_landmarks=refine_landmarks,
        min_detection_confidence=min_detection_confidence,
        min_tracking_confidence=min_tracking_confidence,
    )
 
    return face_mesh
 
def plot_landmarks(frame, left_lm_coordinates,
                       right_lm_coordinates,  mouth_bottom, mouth_top, color
                       ):
    for lm_coordinates in [left_lm_coordinates, right_lm_coordinates]:
        if lm_coordinates:
            for coord in lm_coordinates:
                cv2.circle(frame, coord, 2, color, -1)
    #plot mouth landmarks
    cv2.circle(frame, (int(mouth_bottom[0]), int(mouth_bottom[1])), 2, (100, 100, 0), -1)
    cv2.circle(frame, (int(mouth_top[0]) , int(mouth_top[1])), 2, (100, 100, 0), -1)
    return frame
 
 
def plot_text(image, text, origin, 
              color, font=cv2.FONT_HERSHEY_SIMPLEX, 
              fntScale=0.8, thickness=2
              ):
    image = cv2.putText(image, text, origin, font, fntScale, color, thickness)
    return image

def distance_points(point_1, point_2):
    """Calculate l2-norm between two points"""
    dist = ((point_2.x - point_1.x)** 2 + (point_2.y - point_1.y)** 2) ** 0.5
    return dist
def get_mesh_cords(results, img_width,img_height):
       mesh_cord_point = [ (int(p.x*img_width) , int(p.y*img_height)) for p in results.multi_face_landmarks[0].landmark]
       return mesh_cord_point

def blinkRatio(img, landmark,right_eye, left_eye):
    
    # width of eye,in pixels or horizontal line.
    
    # Right Eye 
    right_hx, right_hy = landmark[right_eye[0]]
    right_hx1, right_hy1 = landmark[right_eye[8]]
    right_eye_pixel_width = right_hx1-right_hx
    
    # Left Eyes
    left_hx, left_hy = landmark[left_eye[0]]
    left_hx1, left_hy1 = landmark[left_eye[8]]
    left_eye_pixel_width = left_hx1-left_hx

    # ---------------------------------------
    # vertical line or height of eyes
    
    # Right Eyes 
    right_vx, right_vy = landmark[right_eye[12]]
    right_vx1, right_vy1 = landmark[right_eye[4]]
    right_eye_pixel_height = right_vy1 - right_vy
    
    # Left Eye
    left_vx, left_vy = landmark[left_eye[12]]
    left_vx1, left_vy1 = landmark[left_eye[4]]
    left_eye_pixel_height = left_vy1 - left_vy
    # ---------------------------------------
    right_ratio = 0
    left_ratio = 0
    if right_eye_pixel_height != 0:
        right_ratio = right_eye_pixel_width/right_eye_pixel_height
    if left_eye_pixel_height != 0:
        left_ratio = left_eye_pixel_width/left_eye_pixel_height
    eyes_ratio = (left_ratio + right_ratio) / 2
    return eyes_ratio

class VideoFrameHandler:
    def __init__(self):
        """
        Initialize the necessary constants, mediapipe app
        and tracker variables
        """
        # Left and right eye chosen landmarks.
        self.eye_idxs = {
            "left": [362, 385, 387, 263, 373, 380],
            "right": [33, 160, 158, 133, 153, 144],
        }
 
        # Used for coloring landmark points.
        # Its value depends on the current EAR value.
        self.RED = (0, 0, 255)  # BGR
        self.GREEN = (0, 255, 0)  # BGR
 
        # Initializing Mediapipe FaceMesh solution pipeline
        self.facemesh_model = get_mediapipe_app()
 
        # For tracking counters and sharing states in and out of callbacks.
        self.state_tracker = {
            "start_time": time.perf_counter(),
            "DROWSY_TIME": 0.0,  # Holds time passed with EAR < EAR_THRESH
            "COLOR": self.GREEN,
        }
 
        self.EAR_txt_pos = (10, 30)

    def process(self, frame: np.array, thresholds: dict):
        """
        This function is used to implement our Drowsy detection algorithm.
 
        Args:
            frame: (np.array) Input frame matrix.
            thresholds: (dict) Contains the two threshold values
                               WAIT_TIME and EAR_THRESH.
 
        Returns:
            The processed frame and a boolean flag to
            indicate if the alarm should be played or not.
        """
 
        # To improve performance,
        # mark the frame as not writeable to pass by reference.
        frame.flags.writeable = False
        frame_h, frame_w, _ = frame.shape
        DROWSY_TIME_txt_pos = (10, int(frame_h // 2 * 1.7))
        ALM_txt_pos = (10, int(frame_h // 2 * 1.85))
 
        results = self.facemesh_model.process(frame)
        mouth_distance = 0
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            mesh_cords = get_mesh_cords(results, frame_w,frame_h)
            eyes_ratio =blinkRatio(frame,mesh_cords, RIGHT_EYE, LEFT_EYE)
            EAR, coordinates, mouth_bottom, mouth_top = calculate_avg_ear(landmarks,
                                                 self.eye_idxs["left"], 
                                                 self.eye_idxs["right"], 
                                                 frame_w, 
                                                 frame_h
                                                 )
            frame = plot_landmarks(frame, 
                                       coordinates[0], 
                                       coordinates[1],
                                       mouth_bottom,
                                       mouth_top,
                                       self.state_tracker["COLOR"]
                                       )
            mouth_distance = distance_points(landmarks[0], landmarks[17])
 
            if EAR < thresholds["EAR_THRESH"]:
 
                # Increase DROWSY_TIME to track the time period with 
                # EAR less than the threshold
                # and reset the start_time for the next iteration.
                end_time = time.perf_counter()
 
                self.state_tracker["DROWSY_TIME"] += end_time - self.state_tracker["start_time"]
                self.state_tracker["start_time"] = end_time
                self.state_tracker["COLOR"] = self.RED
 
                if self.state_tracker["DROWSY_TIME"] >= thresholds["WAIT_TIME"]:
                    plot_text(frame, "WAKE UP! WAKE UP", 
                              ALM_txt_pos, self.state_tracker["COLOR"])
 
            else:
                self.state_tracker["start_time"] = time.perf_counter()
                self.state_tracker["DROWSY_TIME"] = 0.0
                self.state_tracker["COLOR"] = self.GREEN
 
            EAR_txt = f"EAR: {round(EAR, 2)}"
            DROWSY_TIME_txt = f"DROWSY: {round(self.state_tracker['DROWSY_TIME'], 3)} Secs"
            plot_text(frame, EAR_txt, 
                      self.EAR_txt_pos, self.state_tracker["COLOR"])
            plot_text(frame, DROWSY_TIME_txt, 
                      DROWSY_TIME_txt_pos, self.state_tracker["COLOR"])
 
        else:
            self.state_tracker["start_time"] = time.perf_counter()
            self.state_tracker["DROWSY_TIME"] = 0.0
            self.state_tracker["COLOR"] = self.GREEN
        
        return frame, mouth_distance, eyes_ratio

# Play
cap = cv2.VideoCapture(0)

EAR_THRESH = 0.18
WAIT_TIME = 1.0

thresholds = {
    "EAR_THRESH": EAR_THRESH,
    "WAIT_TIME": WAIT_TIME,
}

frameHandler = VideoFrameHandler()
iterator = 0
prev_distance = 0
while cap.isOpened():
    success, frame = cap.read()
    res, mouth_distance, eyes_ratio = frameHandler.process(frame, thresholds)
    if iterator == 0:
        prev_distance = mouth_distance
    else:
        if mouth_distance != 0 and abs(mouth_distance-prev_distance) > 0.01:
            cv2.putText(img=res, text='Talking', org=(150, 250), fontFace=cv2.FONT_HERSHEY_TRIPLEX, fontScale=3, color=(0, 255, 0),thickness=3)
        prev_distance = mouth_distance
    iterator = iterator + 1

    if eyes_ratio>5:
        CLOSED_EYES_FRAMAE_COUNTER +=1
    else:
        if CLOSED_EYES_FRAMAE_COUNTER >CET_FRAMES:
            CLOSED_EYES_FRAMAE_COUNTER =0
            TOTAL_BLINKS +=1
            print(TOTAL_BLINKS)
    total_blink_text = 'total blinks: ' + str(TOTAL_BLINKS)
    cv2.putText(img=res, text=total_blink_text, org=(60, 50), fontFace=cv2.FONT_HERSHEY_TRIPLEX, fontScale=1, color=(0, 0, 0),thickness=2)
    cv2.imshow('Drowsiness Detection', res)

    if cv2.waitKey(5) & 0xFF == 27:
        break

cv2.destroyAllWindows()
cap.release()