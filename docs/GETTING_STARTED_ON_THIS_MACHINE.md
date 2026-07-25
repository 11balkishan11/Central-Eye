# Getting Started on This Machine

This guide is specific to the NS3 Central repository. It will get you up and running quickly if you change laptops, reinstall your environment, or onboard a new developer.

## Prerequisites
- **Node.js**: v18+ (for Vite & React)
- **Python**: v3.11+
- **uv**: The ultra-fast Python package installer (`pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Docker**: For running PostgreSQL and Redis (future) locally.

## 1. Environment Setup

### Database
Start a local PostgreSQL instance via Docker:
```bash
docker run --name ns3-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ns3_central -p 5432:5432 -d postgres:15
```

### Backend `.env`
Create a `.env` file in `backend/`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ns3_central
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 2. Backend Initialization

1. **Install Dependencies**
   Navigate to the `backend/` directory and use `uv` to sync the environment:
   ```bash
   cd backend
   uv sync
   ```
   *This creates the `.venv` folder automatically.*

2. **Run Migrations**
   Initialize the database schema:
   ```bash
   uv run alembic upgrade head
   ```

3. **Seed the Database**
   You must run these scripts to create the default tenant, admin user, and demo devices.
   ```bash
   uv run python seed.py
   uv run python seed_demo.py
   ```
   *Note: This creates the user `socialmediaexecutive3@gmail.com` with password `password123`.*

4. **Start the Backend**
   ```bash
   uv run uvicorn app.main:app --reload
   ```
   The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

## 3. Frontend Initialization

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Frontend**
   ```bash
   npm run dev
   ```
   The UI will be available at `http://localhost:5173`.

## 4. Common Troubleshooting
- **IDE Python Errors**: If your IDE complains about missing modules (e.g., `sqlalchemy`), point your Python interpreter to the `backend/.venv` folder.
- **Database Connection Errors**: Ensure Docker is running and the port 5432 is exposed.
- **Login Failing**: Ensure you ran `seed.py` to create the default tenant and user.

## 5. Daily Git & Development Workflow
1. **Branching**: Create a branch for your feature (`feature/add-snmp-discovery`).
2. **Backend**: Add your route in `api/v1/endpoints/`, your business logic in `services/`, and register it in `api.py`.
3. **Frontend**: Create your hook in `features/<domain>/hooks/`, your UI in `pages/`, and register the route in `App.tsx`.
4. **Commit**: Keep commits atomic. Ensure `uv run pytest` (when added) passes.
