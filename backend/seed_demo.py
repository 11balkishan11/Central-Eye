import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy import select
from app.core.config import settings
from app.models.tenant import Tenant, Organization, Site
from app.models.device import Device, DeviceLifecycleState, DeviceAdminState, DeviceOperState, DeviceHealth

async def seed_demo():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        # Find the default tenant
        result = await session.execute(select(Tenant).where(Tenant.slug == "default-org"))
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            print("Run python seed.py first to create the default tenant!")
            return

        print(f"Seeding Demo Workspace for Tenant: {tenant.name}")

        # 1. Create Organizations
        orgs_data = [
            {"name": "India Operations", "slug": "india-ops"},
            {"name": "US Operations", "slug": "us-ops"},
            {"name": "Europe Operations", "slug": "europe-ops"}
        ]
        
        orgs = []
        for o_data in orgs_data:
            result = await session.execute(select(Organization).where(Organization.slug == o_data["slug"]))
            org = result.scalar_one_or_none()
            if not org:
                org = Organization(tenant_id=tenant.id, name=o_data["name"], slug=o_data["slug"])
                session.add(org)
                await session.flush()
            orgs.append(org)

        # 2. Create Sites
        sites_data = [
            {"org": "india-ops", "name": "Delhi DC", "code": "del-dc"},
            {"org": "india-ops", "name": "Mumbai DC", "code": "mum-dc"},
            {"org": "india-ops", "name": "Bangalore Office", "code": "blr-off"},
            {"org": "us-ops", "name": "New York DC", "code": "ny-dc"},
            {"org": "us-ops", "name": "US West Office", "code": "usw-off"},
            {"org": "europe-ops", "name": "London DC", "code": "lon-dc"},
            {"org": "europe-ops", "name": "Berlin Office", "code": "ber-off"}
        ]

        sites = {}
        for s_data in sites_data:
            org = next(o for o in orgs if o.slug == s_data["org"])
            result = await session.execute(select(Site).where(Site.code == s_data["code"]))
            site = result.scalar_one_or_none()
            if not site:
                site = Site(organization_id=org.id, name=s_data["name"], code=s_data["code"])
                session.add(site)
                await session.flush()
            sites[s_data["code"]] = site

        # 3. Create 512 Devices
        # Check current device count
        result = await session.execute(select(Device).where(Device.tenant_id == tenant.id))
        existing_devices = len(result.scalars().all())
        
        needed = 512 - existing_devices
        if needed > 0:
            print(f"Generating {needed} devices...")
            
            vendors = ["Cisco", "Juniper", "HP", "Linux", "Windows", "Dell", "F5"]
            types = ["Core Router", "Distribution Switch", "Firewall", "Server", "UPS", "Wireless Controller", "NAS", "Printer"]
            
            site_list = list(sites.values())
            for i in range(needed):
                site = random.choice(site_list)
                vendor = random.choice(vendors)
                d_type = random.choice(types)
                
                # Distribution of health
                health_rand = random.random()
                if health_rand < 0.94:
                    health = DeviceHealth.good
                elif health_rand < 0.98:
                    health = DeviceHealth.warning
                else:
                    health = DeviceHealth.critical

                dev = Device(
                    tenant_id=tenant.id,
                    site_id=site.id,
                    hostname=f"{site.code}-{vendor.lower()}-{i:04d}",
                    management_ip=f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
                    vendor=vendor,
                    model=f"{d_type} {random.randint(1000, 9000)}",
                    lifecycle_state=DeviceLifecycleState.active,
                    admin_state=DeviceAdminState.enabled,
                    oper_state=DeviceOperState.up if health != DeviceHealth.critical else DeviceOperState.down,
                    health=health,
                    last_seen=datetime.utcnow() - timedelta(minutes=random.randint(0, 60))
                )
                session.add(dev)
                
                if i % 100 == 0:
                    await session.flush()
            
            await session.commit()
            print("Successfully populated 512 devices.")
        else:
            print("Database already has 512+ devices.")

if __name__ == "__main__":
    asyncio.run(seed_demo())
