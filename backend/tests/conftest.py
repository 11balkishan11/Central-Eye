import pytest
import pytest_asyncio
from testcontainers.postgres import PostgresContainer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import asyncio

from app.main import app
from app.db.base_class import Base
from app.db.session import get_db

import os
import warnings

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB, INET

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

@compiles(INET, "sqlite")
def compile_inet_sqlite(type_, compiler, **kw):
    return "VARCHAR"

@pytest.fixture(scope="session")
def postgres_container():
    if os.getenv("DATABASE_URL"):
        yield None
        return

    try:
        with PostgresContainer("postgres:17", driver="asyncpg") as postgres:
            yield postgres
    except Exception as e:
        warnings.warn(f"Could not start Postgres container (Docker missing?): {e}. Falling back to SQLite.")
        yield None

@pytest.fixture(scope="session")
def engine(postgres_container):
    url = os.getenv("DATABASE_URL")
    if not url:
        if postgres_container:
            url = postgres_container.get_connection_url()
            url = url.replace("postgresql+psycopg2://", "postgresql+asyncpg://")
        else:
            url = "sqlite+aiosqlite:///:memory:"

    engine = create_async_engine(url, echo=False)
    yield engine
    engine.sync_engine.dispose()

@pytest.fixture(scope="session")
def session_maker(engine):
    return async_sessionmaker(engine, expire_on_commit=False)

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database(engine):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Teardown: use a fresh connection to avoid "another operation in progress"
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    except Exception:
        pass  # Best-effort cleanup

@pytest_asyncio.fixture
async def db_session(engine):
    """
    Each test gets its own connection with a SAVEPOINT-based transaction.
    The outer transaction is rolled back after the test, ensuring full isolation.
    Services that call commit() will commit the savepoint, not the outer txn.
    """
    async with engine.connect() as conn:
        txn = await conn.begin()
        session = AsyncSession(bind=conn, expire_on_commit=False)
        # Begin a nested (SAVEPOINT) transaction that services will commit to
        nested = await session.begin_nested()

        # Intercept commit to restart the savepoint instead of committing the outer txn
        _original_commit = session.commit

        async def _savepoint_commit(*args, **kwargs):
            nonlocal nested
            await session.flush()
            await nested.commit()
            nested = await session.begin_nested()

        session.commit = _savepoint_commit  # type: ignore[assignment]

        yield session

        # Rollback the outer transaction — all test data is wiped
        await session.close()
        await txn.rollback()

@pytest.fixture(autouse=True)
def override_get_db(db_session):
    async def _override():
        yield db_session
    app.dependency_overrides[get_db] = _override
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
