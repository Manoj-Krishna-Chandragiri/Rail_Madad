import requests

url = "http://localhost:8000/api/accounts/profile/"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hbm9qa3Jpc2huYWNoYW5kcmFnaXJpQGdtYWlsLmNvbSIsInVpZCI6IjdOdm1HaUJkeXNZN2FiQ2R0REpYa3V6WFpjTzIiLCJ1c2VyX2lkIjoiN052bUdpQmR5c1k3YWJDZHRESlhrdXpYWmNPMiIsImlhdCI6MTc2Njc2MDEwMiwiZXhwIjoxNzY2NzYzNzAyfQ.6SijIZ14hwUzIBjepfFPNXPBc9jQG5X4Z7VxTzSHGPs"

headers = {"Authorization": f"Bearer {token}"}

try:
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
