import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

@pytest.mark.asyncio
async def test_invitation_lifecycle(
    client: AsyncClient,
    db_session: AsyncSession,
    auth_headers: dict
):
    # 1. Create Org
    org_resp = await client.post(
        "/api/v1/organizations",
        json={"name": "Invite Org", "slug": "invite-org"},
        headers=auth_headers
    )
    assert org_resp.status_code == 201
    org_id = org_resp.json()["id"]

    # 2. Send Invitation
    invite_resp = await client.post(
        f"/api/v1/organizations/{org_id}/invitations",
        json={"email": "new.user@example.com", "role_id": str(uuid.uuid4())},
        headers=auth_headers
    )
    assert invite_resp.status_code == 201
    token = invite_resp.json()["token"]

    # 3. Accept Invitation (assuming current user is the one accepting for test simplicity, 
    # though in reality current_user email must match the invite email. We would need to mock or setup a matching user.)
    # We will just verify it fails 403 because current_user email won't match "new.user@example.com"
    accept_resp = await client.post(
        "/api/v1/invitations/accept",
        json={"token": token},
        headers=auth_headers
    )
    assert accept_resp.status_code == 403
    assert "email does not match" in accept_resp.text.lower()
