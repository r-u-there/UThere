import cv2
import math
import csv

video_num = input("Enter video number: ") 
cap = cv2.VideoCapture(f'videos/{video_num}.avi')

# Check if camera opened successfully
if (cap.isOpened()== False): 
    print("Error opening video stream or file")
else:
    frames = [] 
    # Read until video is completed
    while(cap.isOpened()):
        ret, frame = cap.read()
        if ret == True:
            frames.append(frame)
        else: 
            break

    cap.release()

    labels = {}
    chunk_index = 0
    label = -1
    print(len(frames))
    while chunk_index < math.floor(len(frames)/100):
        chunk_frames = frames[chunk_index*100:(chunk_index+1)*100]
        for i in range(0,100):
        
            cv2.imshow('Frame',chunk_frames[i])
            # Press Q on keyboard to  exit
            key = cv2.waitKey(25)
            if key & 0xFF == ord('1'):
                print(f'Video Chunk {chunk_index}: low attention selected')
                label = 1
            elif key & 0xFF == ord('2'):
                print(f'Video Chunk {chunk_index}: middle attention selected')
                label = 2
            elif key & 0xFF == ord('3'):
                print(f'Video Chunk {chunk_index}: high attention selected')
                label = 3
            elif key == 3:
                labels[chunk_index] = label
                print(f'Video Chunk {chunk_index}: {label} saved')
                chunk_index += 1
                break
            elif key == 2:
                labels[chunk_index] = label
                print(f'Video Chunk {chunk_index}: {label} saved')
                if chunk_index > 0:
                    chunk_index -= 1
                    break

    cv2.destroyAllWindows()
    print(labels)

    with open("labels.csv", mode="a", newline="") as csvfile:
        # Create a CSV writer object
        writer = csv.writer(csvfile)
        for key, value in labels.items():
            row = [video_num, key, value]
            writer.writerow(row)

    print("Results saved in labels.csv")
    print("Done!")

