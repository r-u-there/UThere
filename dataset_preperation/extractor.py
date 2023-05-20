import os
import cv2
import math
import numpy as np
import mediapipe as mp
from scipy.spatial import distance as dist
from PIL import Image
# from torchvision import transforms
# import torch
from emonet.models import EmoNet

def get_mediapipe_app(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.8,
    ):
    """Initialize and return Mediapipe FaceMesh Solution Graph object"""
    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=max_num_faces,
        refine_landmarks=refine_landmarks,
        min_detection_confidence=min_detection_confidence,
        min_tracking_confidence=min_tracking_confidence,
    )
 
    return face_mesh

# def load_model():
#     model = EmoNet(num_modules=2, n_expression=5, n_reg=2, n_blocks=4, attention=True, temporal_smoothing=False)
#     weights_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "emonet/emonet_5.pth")
#     model.load_state_dict(torch.load(weights_path))
#     model.eval()
#     return model

# Left eyes indices 
LEFT_EYE = [362, 385, 386, 263, 374, 380]
# right eyes indices
RIGHT_EYE= [33, 159, 158, 133, 153, 145]
LEFT_IRIS = [263, 474, 476, 362]
RIGHT_IRIS = [133, 469, 471, 33]

face_coordination_in_real_world = np.array([
        [285, 528, 200],
        [285, 371, 152],
        [197, 574, 128],
        [173, 425, 108],
        [360, 574, 128],
        [391, 425, 108]
    ], dtype=np.float64)

class FeatureExtractor():

    def __init__(self,
                 num_frames = 300,
                 frame_width = 640, 
                 frame_height = 480):
        self.num_frames = num_frames
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.facemesh_model = get_mediapipe_app()
        # self.transform = transforms.Compose([transforms.Resize((256, 256)), transforms.ToTensor()])
        # self.model = load_model()

    def _adjust_frames(self, frames):
        adjusted = []
        for frame in frames:
            new_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            adjusted.append(new_frame)
        
        return adjusted
    
    def _find_facial_landmarks(self, frame_list):
        """
        This function finds the all facial landmark, right and left iris coordinates in the multiple frames
        """ 

        all_landmarks = []
        all_right_irises = []
        all_left_irises = []
        for frame in frame_list:
            landmarks = []
            left_iris = []
            right_iris = []
            results = self.facemesh_model.process(frame)
            if results.multi_face_landmarks:
                for idx, lm in enumerate(results.multi_face_landmarks[0].landmark):
                    landmarks.append([int(lm.x * self.frame_width) , int(lm.y * self.frame_height)])
                    if idx in LEFT_IRIS:
                        x, y = int(lm.x * self.frame_width), int(lm.y * self.frame_height)
                        left_iris.append([x, y])
                    if idx in RIGHT_IRIS:
                        x, y = int(lm.x * self.frame_width), int(lm.y * self.frame_height)
                        right_iris.append([x, y])

            else:
                landmarks = None
                right_iris = None
                left_iris = None

            all_landmarks.append(landmarks)
            all_right_irises.append(right_iris)
            all_left_irises.append(left_iris)
            

        return all_landmarks, all_right_irises, all_left_irises
    
    def get_ear(self, landmarks, refer_idxs):
        """
        Calculate Eye Aspect Ratio for one eye.
        Args:
            landmarks: (list) Detected landmarks list
            refer_idxs: (list) Index positions of the chosen landmarks
                                in order P1, P2, P3, P4, P5, P6    
        Returns:
            ear: (float) Eye aspect ratio
        """
        coords_points = [landmarks[i] for i in refer_idxs]
        P2_P6 = dist.euclidean(coords_points[1], coords_points[5])
        P3_P5 = dist.euclidean(coords_points[2], coords_points[4])
        P1_P4 = dist.euclidean(coords_points[0], coords_points[3])

        # Compute the eye aspect ratio
        ear = (P2_P6 + P3_P5) / (2.0 * P1_P4)
        return ear
    
    def _calculate_avg_ear(self, landmarks_list):
        """
        This function calculates the eye aspect raito in the multiple frames
        Args:
            landmarks_list: (list) Detected landmarks list
        Returns:
            ear_list: (list) Eye aspect ratio list
        """ 
        ear_list = []
        for landmarks in landmarks_list:
            if landmarks:
                ear = (self.get_ear(landmarks, LEFT_EYE) + self.get_ear(landmarks, RIGHT_EYE)) / 2.0
                ear_list.append(ear)
            else:
                ear_list.append(-1)
        
        return ear_list
    
    def _calculate_lip_distance(self, landmarks_list):
        """
        This function calculates the distance between upper and lower lips
        """ 
        lip_distances = []
        for landmarks in landmarks_list:
            if landmarks:
                lip = dist.euclidean(landmarks[13], landmarks[14])
                result = 1 if lip > 10 else 0
                lip_distances.append(result)
            else:
                lip_distances.append(-1)
        
        return lip_distances

    def rotation_matrix_to_angles(self, rotation_matrix):
        """
        Calculate Euler angles from rotation matrix.
        :param rotation_matrix: A 3*3 matrix with the following structure
        [Cosz*Cosy  Cosz*Siny*Sinx - Sinz*Cosx  Cosz*Siny*Cosx + Sinz*Sinx]
        [Sinz*Cosy  Sinz*Siny*Sinx + Sinz*Cosx  Sinz*Siny*Cosx - Cosz*Sinx]
        [  -Siny             CosySinx                   Cosy*Cosx         ]
        :return: Angles in degrees for each axis
        """
        x = math.atan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
        y = math.atan2(-rotation_matrix[2, 0], math.sqrt(rotation_matrix[0, 0] ** 2 + rotation_matrix[1, 0] ** 2))
        z = math.atan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
        return np.array([x, y, z]) * 180. / math.pi

    def _calculate_face_pose_single(self, landmarks):
        """
        This function calculates the face pose in the single frame
        """ 
        face_coordination_in_image = np.array([landmarks[1],landmarks[9],landmarks[57],landmarks[130],landmarks[287],landmarks[359]], dtype=np.float64)
        # The camera matrix
        focal_length = 1 * self.frame_width
        cam_matrix = np.array([[focal_length, 0, self.frame_width / 2],
                               [0, focal_length, self.frame_height / 2],
                               [0, 0, 1]])

        # The Distance Matrix
        dist_matrix = np.zeros((4, 1), dtype=np.float64)
        # Use solvePnP function to get rotation vector
        success, rotation_vec, transition_vec = cv2.solvePnP(face_coordination_in_real_world, face_coordination_in_image, cam_matrix, dist_matrix)

        # Use Rodrigues function to convert rotation vector to matrix
        rotation_matrix, jacobian = cv2.Rodrigues(rotation_vec)

        result = self.rotation_matrix_to_angles(rotation_matrix)
        return result
    
    def _calculate_face_pose_batch(self, landmarks_list):
        """
        This function calculates the face pose in multiple frames
        """ 
        face_poses = []
        for landmarks in landmarks_list:
            if landmarks:
                face_pose = self._calculate_face_pose_single(landmarks)
                face_in_out = self.get_head_pose_label(face_pose[0],face_pose[1])
                face_poses.append(face_in_out)
            else:
                face_poses.append(-1)
        return face_poses
    
    def get_head_pose_label(self, pitch, yaw):
        # Define threshold values for each angle
        yaw_threshold = 40

        # Check for head looking up or down
        if pitch > 20:
            return 0
        elif pitch < -20:
            return 0

        # Check for head looking to the left or right
        if yaw > yaw_threshold:
            return 0
        elif yaw < -yaw_threshold:
            return 0

        # If no label is assigned, return "CENTER"
        return 1

    # def _preprocess_frames(self, frames):
    #     tensor_frames = []
    #     for frame in frames:
    #         img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    #         pil_img = Image.fromarray(img)
    #         image = self.transform(pil_img).unsqueeze(0)
    #         tensor_frames.append(image)

    #     tensor = torch.cat(tensor_frames, dim=0)
    #     return tensor

    # def _after_process(self, prediction):
    #     expressions = torch.argmax(prediction['expression'], dim=1).numpy()
    #     valences = prediction['valence'].numpy()
    #     arousals = prediction['arousal'].numpy()
    #     return expressions, valences, arousals

    # def _estimate_emotion(self, frames):
    #     """
    #     This function estimates the emotion class, valence and arousal values in multiple frames
    #     """
    #     tensor = self._preprocess_frames(frames)
        
    #     with torch.no_grad():
    #         prediction = self.model(tensor)
        
    #     return self._after_process(prediction)
    
    def get_iris_direction(self, eye_landmarks):
        left = abs(eye_landmarks[0][0] - eye_landmarks[1][0])
        right = abs(eye_landmarks[2][0] - eye_landmarks[3][0])
        ratio = right/left
        
        if ratio < 0.40:
            return 0
        else:
            return 1
    
    def _calculate_iris(self, right_irises_list, left_irises_list):
        iris_in_out_list = []
        for right, left in zip(right_irises_list, left_irises_list):
            if right and left:
                left_eye = self.get_iris_direction(left)
                right_eye = self.get_iris_direction(right)
                if left_eye == right_eye:
                    label = left_eye
                else:
                    label = 0
                iris_in_out_list.append(label)
            else:
                iris_in_out_list.append(0)

        return iris_in_out_list
    
    def extract_features(self, frames, video_name, chunk_index):
        """
        This function extract the following features from multiple frames;
        - EAR (Eye Aspect Ratio) 
        - Lip Distance (1 for Open, 0 for Closed)
        - Face Pose (1 for in, 0 for out)
        - Irıs pose (1 for in, 0 for out)
        """ 
        # adjusted_frames = self._adjust_frames(frames)
        facial_landmark_list, right_irises_list, left_irises_list = self._find_facial_landmarks(frames)
        # expressions, valences, arousals = self._estimate_emotion(frames)
        avg_ear_list = self._calculate_avg_ear(facial_landmark_list)
        lip_distance_list = self._calculate_lip_distance(facial_landmark_list)
        face_pose_list = self._calculate_face_pose_batch(facial_landmark_list)
        iris_in_out_list = self._calculate_iris(right_irises_list, left_irises_list)
        
        results = []
        for i in range(self.num_frames):
            result = {'video_name' : video_name , 'chunk_index': chunk_index, 'frame': i, 'ear': avg_ear_list[i], 'lip_distance': lip_distance_list[i], 'face_pose': face_pose_list[i], 'iris_pose': iris_in_out_list[i]}
            results.append(result)

        return results
    
