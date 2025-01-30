from transformers import pipeline
import speech_recognition as sr
from flask import Flask, request, jsonify, render_template

def create_chatbot():
    chatbot_pipeline = pipeline("text-generation", model="microsoft/DialoGPT-medium")
    recognizer = sr.Recognizer()
    
    def get_response(user_input):
        response = chatbot_pipeline(user_input, max_length=1000, pad_token_id=50256)
        return response[0]['generated_text']
    
    return recognizer, get_response

app = Flask(__name__)
recognizer, get_response = create_chatbot()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"response": "Please provide a message."})
    response = get_response(user_input)
    return jsonify({"response": response})

@app.route('/voice', methods=['POST'])
def voice():
    with sr.Microphone() as source:
        print("Listening...")
        try:
            audio = recognizer.listen(source)
            user_input = recognizer.recognize_google(audio)
            response = get_response(user_input)
            return jsonify({"response": response})
        except sr.UnknownValueError:
            return jsonify({"response": "Sorry, I could not understand. Try again."})
        except sr.RequestError:
            return jsonify({"response": "Could not request results. Check your internet connection."})

if __name__ == "__main__":
    app.run(debug=True)
