import httpx

def get_client(config):
    return httpx.AsyncClient(base_url=config['central_url'], timeout=10.0)