"""
Test script to submit feedback directly to the API
"""
import requests
import json

# Base URL of your Django server
BASE_URL = "http://127.0.0.1:8000"

# Endpoint for feedback submission
FEEDBACK_URL = f"{BASE_URL}/api/complaints/feedback/"

# Sample feedback data
feedback_data = {
    "complaint_id": "TEST123",
    "category": "Service Quality",
    "subcategory": "Staff Behavior",
    "feedback_message": "The service was excellent and the staff was very helpful.",
    "rating": 5,
    "name": "Test User",
    "email": "test@example.com"
}

# Submit feedback
try:
    response = requests.post(FEEDBACK_URL, json=feedback_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("Feedback submitted successfully!")
    else:
        print(f"Error submitting feedback: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
