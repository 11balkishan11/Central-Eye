import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_maker
from app.models.tenant import Tenant, TenantTier, TenantStatus, TenantMembership, TenantMembershipStatus
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
                password_hash=pw_service.get_password_hash("admin123"),
                first_name="Admin",
                last_name="User",
                status=UserStatus.active,
                is_superuser=True,
                email_verified=True
            )
            session.add(user)
            
            # Create a default tenant
            tenant = Tenant(
                id=uuid.uuid4(),
                name="Acme Corp",
                slug="acme-corp",
                tier=TenantTier.enterprise,
                status=TenantStatus.active
            )
            session.add(tenant)
            
            # Create a role
            role = Role(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                name="Admin",
                description="Administrator role"
            )
            session.add(role)
            
            # Create membership
            membership = TenantMembership(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                user_id=user.id,
                role_id=role.id,
                status=TenantMembershipStatus.active
            )
            session.add(membership)
            
            await session.commit()
            print("Created admin@ns3.local with password 'admin123'")
        else:
            print("Admin already exists.")

if __name__ == "__main__":
    asyncio.run(create_admin())
