from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change this in production for security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Load the trained model
model = joblib.load('Obesity_Risk_Model')

label_encoder = LabelEncoder()
label_encoder.classes_ = pd.read_pickle('label_encoder')

# Define the request body model
class ObesityRiskRequest(BaseModel):
    age: int
    selectedGender: str
    veggies: int
    waterIntake: int
    mainMeals: int
    exercise: int
    technologicalDevices: int
    bmi: float

# Function to preprocess the input and predict the obesity level
def preprocess_input(data: ObesityRiskRequest):
    # Create a DataFrame to match the model's expected input
    input_data = pd.DataFrame({
        'Age': [data.age],
        'Gender': [data.selectedGender],  # Default to 0 if gender is unknown
        'FCVC': [data.veggies],  # Frequency of vegetable consumption
        'NCP': [data.mainMeals],  # Number of main meals
        'CH2O': [data.waterIntake],  # Water intake (as per your dataset)
        'FAF': [data.exercise],  # Physical activity frequency
        'TUE': [data.technologicalDevices],  # Use of technological devices
        'BMI': [data.bmi],  # BMI value
    })
    
    return input_data

@app.post("/predict_obesity_risk/")
def predict_obesity_level(data: ObesityRiskRequest):
    print("Received payload:", data)

    # Preprocess the input data
    input_data = preprocess_input(data)
    print(input_data)
    
    # Make prediction
    predictions = model.predict(input_data)
    result = {"bmi": data.bmi, "obesity_level": label_encoder.inverse_transform(predictions)[0]}
    print("Sending response:", result)
    return result
    # Return the result in a formatted response
    # return {"bmi": data.bmi, "obesity_level": label_encoder.inverse_transform(predictions)[0]}


