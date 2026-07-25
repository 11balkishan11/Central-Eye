# Operational Handbook (Batch 11)

This handbook provides the necessary protocols for day-to-day development, deployment, and troubleshooting of NS3 Central.

---

## 1. Local Development Setup
Please refer to `GETTING_STARTED_ON_THIS_MACHINE.md` for the exact steps to initialize your local `uv` python environment, PostgreSQL Docker container, and Vite frontend.

## 2. Git Workflow & Branch Strategy
We follow a simplified **Trunk-Based Development** model.
- **Main Branch**: `main`. Must always be deployable.
- **Feature Branches**: Branch off `main` using the format `feature/<name>` (e.g., `feature/snmp-discovery`).
- **Bugfix Branches**: `fix/<name>` (e.g., `fix/login-timeout`).
- **Commits**: Keep commits atomic. A single commit should not mix a frontend UI tweak with a backend database migration.

## 3. Database Migrations
We use **Alembic** to manage PostgreSQL schema changes.
- **Creating a Migration**:
  When you modify a model in `backend/app/models/`, generate a migration script:
  ```bash
  uv run alembic revision --autogenerate -m "added_alert_model"
  ```
- **Applying a Migration**:
  ```bash
  uv run alembic upgrade head
  ```
- **Rule**: Never manually modify the database schema. Always use Alembic.

## 4. Seeding Data
- `seed.py`: Creates the foundational `Default Organization` and the initial admin user. **Required for login.**
- `seed_demo.py`: Generates 500+ fake devices for UI testing. **Do not run in production.**

## 5. Environment Variables
The `.env` file is heavily relied upon by `backend/app/core/config.py`.
- `DATABASE_URL`: The asyncpg connection string.
- `SECRET_KEY`: Used to sign JWTs. Must be exactly 32 bytes in production.
- `ALGORITHM`: Usually `HS256`.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Typically `30`.

## 6. Troubleshooting Guide
### Issue: "Invalid Token" or "Not Authenticated" immediately after login.
- **Cause**: The `SECRET_KEY` in your `.env` changed, or the backend was restarted without a persistent `.env` file, invalidating previous tokens.
- **Fix**: Clear your browser's `localStorage` and log in again.

### Issue: "relation 'organizations' does not exist"
- **Cause**: You started the backend but forgot to run Alembic migrations.
- **Fix**: Run `uv run alembic upgrade head`.

### Issue: Missing Modules in VS Code / PyCharm
- **Cause**: Your IDE is using the global Python interpreter instead of the `uv` virtual environment.
- **Fix**: Set your IDE interpreter to `backend/.venv/Scripts/python.exe` (Windows) or `backend/.venv/bin/python` (Mac/Linux).
