import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_maker
from app.models.tenant import Tenant, TenantTier, TenantStatus, TenantMembership
from app.models.rbac import Role
from app.models.user import User, UserStatus
from app.auth.password_service import PasswordService
import uuid

async def create_admin():
    async with async_session_maker() as session:
        # Check if user exists
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == "admin@ns3.local"))
        user = result.scalar_one_or_none()
        
        if not user:
            pw_service = PasswordService()
            user = User(
                id=uuid.uuid4(),
                email="admin@ns3.local",
                password_hash=pw_service.hash_password("admin123"),
                first_name="Admin",
                last_name="User",
                status=UserStatus.ACTIVE,
                is_superuser=True,
                email_verified=True
            )
            session.add(user)
            
            # Create a default tenant
            tenant = Tenant(
                id=uuid.uuid4(),
                name="Acme Corp",
                slug="acme-corp",
                tier=TenantTier.ENTERPRISE,
                status=TenantStatus.ACTIVE
            )
            session.add(tenant)
            
            # Create membership
            membership = TenantMembership(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                user_id=user.id,
                role_id=uuid.uuid4(), # Dummy role ID for now
                status="ACTIVE"
            )
            session.add(membership)
            
            await session.commit()
            print("Created admin@ns3.local with password 'admin123'")
        else:
            print("Admin already exists.")

if __name__ == "__main__":
    asyncio.run(create_admin())
