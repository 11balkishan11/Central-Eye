import asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.core.config import settings
from app.models.user import User, UserStatus
from app.models.tenant import Tenant, TenantStatus, TenantTier
from app.auth.password_service import PasswordService
from sqlalchemy import select

async def seed_db():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        email = "socialmediaexecutive3@gmail.com"
        
        # Check if user already exists
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            print(f"User {email} already exists!")
            return

        # Create a default tenant
        tenant = Tenant(
            name="Default Organization",
            slug="default-org",
            status=TenantStatus.active,
            tier=TenantTier.enterprise
        )
        session.add(tenant)
        await session.flush()

        # Create the user
        password = "password123"
        hashed_pw = PasswordService.get_password_hash(password)

        user = User(
            email=email,
            password_hash=hashed_pw,
            first_name="Admin",
            last_name="User",
            status=UserStatus.active,
            is_superuser=True,
            tenant_id=tenant.id
        )
        session.add(user)
        
        await session.commit()
        print(f"Successfully seeded user: {email} with password: {password}")

if __name__ == "__main__":
    asyncio.run(seed_db())
