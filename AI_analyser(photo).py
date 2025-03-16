import os
import cv2
import numpy as np
import matplotlib.pyplot as plt

def detect_category(contour, area, circularity, mean_intensity):
    if area > 5000 and circularity < 0.2:
        return "Pothole" 
    elif 1000 < area <= 5000 and 0.2 <= circularity < 0.5:
        return "Littering"  
    elif 50 < area <= 1000 and circularity > 0.7 and mean_intensity < 100:
        return "Infestation of Pests" 
    elif area > 2000 and circularity > 0.8:
        return "Power Outage"  
    return "Other"  

def process_image(image_path):
   
    if not os.path.exists(image_path):
        print(f"Error: Image file '{image_path}' not found.")
        return ["Other"]

    try:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not load image")

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        )
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        detected_categories = []
        for contour in contours:
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            circularity = 4 * np.pi * (area / (perimeter * perimeter)) if perimeter > 0 else 0

            mask = np.zeros(gray.shape, np.uint8)
            cv2.drawContours(mask, [contour], -1, (255), thickness=cv2.FILLED)
            mean_intensity = cv2.mean(gray, mask=mask)[0]

            category = detect_category(contour, area, circularity, mean_intensity)
            if category != "Other":
                detected_categories.append(category)
                # for green contour
                cv2.drawContours(image, [contour], -1, (0, 255, 0), 2)

        plt.figure(figsize=(8, 6))
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        plt.title(f"Detected Regions in {os.path.basename(image_path)}")
        plt.axis("off")
        plt.show()

        return list(set(detected_categories)) if detected_categories else ["Other"]
    except Exception as e:
        print(f"Error processing image: {e}")
        return ["Other"]
#ui
def interactive_image_classification():
    """
    Run an interactive tool to classify and visualize images.
    """
    print("Welcome to the Image Classification Tool!")
    print("Enter an image file path to classify and visualize detected regions.")
    print("Type 'exit' to stop.")
    
    while True:
        image_path = input("\nEnter image file path: ").strip()
        if image_path.lower() == "exit":
            print("Goodbye!")
            break
        
        image_path = image_path.strip('"').strip("'")
        image_path = os.path.normpath(image_path)
        
        if not os.path.isfile(image_path):
            print(f"Error: '{image_path}' is not a valid file. Please try again.")
            continue
        
        print(f"\nProcessing image: {image_path}")
        categories = process_image(image_path)
        print(f"Detected Categories: {', '.join(categories)}")
        print("--------------------------")
#dont change the below code
if __name__ == "__main__":
    interactive_image_classification()
