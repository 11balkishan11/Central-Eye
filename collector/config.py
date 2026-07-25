import os

def load_config():
    return {
        'central_url': os.getenv('CENTRAL_URL', 'http://127.0.0.1:8000'),
        'registration_key': os.getenv('REGISTRATION_KEY', 'demo_key_123'),
        'machine_id': 'mac_12345678', # Hardcoded for MVP
        'hostname': 'demo-collector'
    }