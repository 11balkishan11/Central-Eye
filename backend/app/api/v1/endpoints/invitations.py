import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.auth.authorization_dependencies import RequirePermission, extract_tenant_id
from app.models.user import User
from app.schemas.invitation import InvitationCreate, InvitationAccept
from app.services.invitation_service import InvitationService

router = APIRouter()

def get_invitation_service(db: AsyncSession = Depends(get_db)) -> InvitationService:
    return InvitationService(db)

@router.post("/organizations/{org_id}/invitations", status_code=status.HTTP_201_CREATED)
async def invite_user(
    org_id: uuid.UUID,
    invite_in: InvitationCreate,
    tenant_id: uuid.UUID = Depends(extract_tenant_id),
    current_user: User = Depends(get_current_user),
    invitation_service: InvitationService = Depends(get_invitation_service),
    _=Depends(RequirePermission("invitations:create"))
):
    # Returns the raw token string for Phase 6 testing simplicity.
    # In production, this returns a generic success message and emails the token.
    token = await invitation_service.invite_user(org_id, tenant_id, invite_in, current_user.id)
    return {"message": "Invitation sent successfully", "token": token}

@router.post("/invitations/accept", status_code=status.HTTP_200_OK)
async def accept_invitation(
    accept_in: InvitationAccept,
    current_user: User = Depends(get_current_user),
    invitation_service: InvitationService = Depends(get_invitation_service)
):
    # Accept doesn't strictly need RequirePermission as the token itself is the authorization
    # However, it requires an authenticated user who matches the invited email.
    await invitation_service.accept_invitation(accept_in.token, current_user)
    return {"message": "Invitation accepted successfully"}
