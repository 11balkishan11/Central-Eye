"""auth_models

Revision ID: 6c8ced684665
Revises: c067382bd166
Create Date: 2026-07-20 18:18:01.728774

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '6c8ced684665'
down_revision: Union[str, Sequence[str], None] = 'c067382bd166'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create new tables
    op.create_table('login_attempts',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=True),
    sa.Column('tenant_id', sa.UUID(), nullable=True),
    sa.Column('ip_address', postgresql.INET(), nullable=True),
    sa.Column('user_agent', sa.String(), nullable=True),
    sa.Column('was_successful', sa.Boolean(), nullable=False),
    sa.Column('failure_reason', sa.Enum('INVALID_PASSWORD', 'LOCKED', 'UNKNOWN_USER', 'MFA_FAILED', 'TOKEN_REUSE', 'PASSWORD_EXPIRED', name='loginfailurereason'), nullable=True),
    sa.Column('attempted_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    
    op.create_table('tenant_memberships',
    sa.Column('tenant_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('role_id', sa.UUID(), nullable=False),
    sa.Column('status', sa.Enum('active', 'suspended', name='tenantmembershipstatus'), nullable=False),
    sa.Column('invited_by', sa.UUID(), nullable=True),
    sa.Column('invited_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('joined_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('tenant_id', 'user_id', name='uq_tenant_membership_tenant_user')
    )

    # 2. Add nullable columns & type changes
    sessionstatus = postgresql.ENUM('ACTIVE', 'REVOKED', 'EXPIRED', 'COMPROMISED', name='sessionstatus')
    sessionstatus.create(op.get_bind(), checkfirst=True)
    
    op.add_column('user_sessions', sa.Column('tenant_id', sa.UUID(), nullable=True))
    op.add_column('user_sessions', sa.Column('membership_id', sa.UUID(), nullable=True))
    op.add_column('user_sessions', sa.Column('refresh_token_hash', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('family_id', sa.Uuid(), nullable=True))
    op.add_column('user_sessions', sa.Column('current_jti', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('status', sa.Enum('ACTIVE', 'REVOKED', 'EXPIRED', 'COMPROMISED', name='sessionstatus'), nullable=True))
    op.add_column('user_sessions', sa.Column('device_id', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('device_name', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('platform', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('browser', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('os', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('last_activity_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.add_column('user_sessions', sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('user_sessions', sa.Column('revoke_reason', sa.String(), nullable=True))
    op.add_column('user_sessions', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('user_sessions', sa.Column('deleted_by', sa.UUID(), nullable=True))
    
    op.alter_column('user_sessions', 'user_id', existing_type=sa.UUID(), nullable=True)
    op.alter_column('user_sessions', 'ip_address', existing_type=sa.VARCHAR(), type_=postgresql.INET(), postgresql_using='ip_address::inet', existing_nullable=True)
    
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('last_password_change_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('failed_login_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True))

    # 3. Backfill
    # Revoke legacy sessions to preserve audit data while satisfying NOT NULL constraints.
    op.execute("UPDATE user_sessions SET refresh_token_hash = 'legacy_' || id::text, family_id = id, status = 'REVOKED', revoked_at = NOW(), revoke_reason = 'migration', deleted_at = NOW() WHERE refresh_token_hash IS NULL")

    # 4. Create indexes
    op.create_index('ix_login_attempts_attempted_at', 'login_attempts', ['attempted_at'], unique=False)
    op.create_index(op.f('ix_login_attempts_email'), 'login_attempts', ['email'], unique=False)
    op.create_index('ix_login_attempts_email_attempted_at', 'login_attempts', ['email', sa.literal_column('attempted_at DESC')], unique=False)
    op.create_index(op.f('ix_login_attempts_ip_address'), 'login_attempts', ['ip_address'], unique=False)
    op.create_index('ix_login_attempts_ip_attempted_at', 'login_attempts', ['ip_address', sa.literal_column('attempted_at DESC')], unique=False)
    op.create_index('ix_login_attempts_user_attempted_at', 'login_attempts', ['user_id', sa.literal_column('attempted_at DESC')], unique=False)

    op.create_index(op.f('ix_tenant_memberships_id'), 'tenant_memberships', ['id'], unique=False)
    op.create_index(op.f('ix_tenant_memberships_role_id'), 'tenant_memberships', ['role_id'], unique=False)
    op.create_index(op.f('ix_tenant_memberships_tenant_id'), 'tenant_memberships', ['tenant_id'], unique=False)
    op.create_index('ix_tenant_memberships_tenant_status', 'tenant_memberships', ['tenant_id', 'status'], unique=False)
    op.create_index(op.f('ix_tenant_memberships_user_id'), 'tenant_memberships', ['user_id'], unique=False)
    op.create_index('ix_tenant_memberships_user_status', 'tenant_memberships', ['user_id', 'status'], unique=False)

    op.drop_index(op.f('ix_user_sessions_id'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_refresh_token'), table_name='user_sessions')
    op.create_index(op.f('ix_user_sessions_current_jti'), 'user_sessions', ['current_jti'], unique=False)
    op.create_index('ix_user_sessions_expires_at', 'user_sessions', ['expires_at'], unique=False)
    op.create_index(op.f('ix_user_sessions_family_id'), 'user_sessions', ['family_id'], unique=False)
    op.create_index('ix_user_sessions_family_status', 'user_sessions', ['family_id', 'status'], unique=False)
    op.create_index(op.f('ix_user_sessions_membership_id'), 'user_sessions', ['membership_id'], unique=False)
    op.create_index(op.f('ix_user_sessions_refresh_token_hash'), 'user_sessions', ['refresh_token_hash'], unique=True)
    op.create_index('ix_user_sessions_status', 'user_sessions', ['status'], unique=False)
    op.create_index(op.f('ix_user_sessions_tenant_id'), 'user_sessions', ['tenant_id'], unique=False)
    op.create_index('ix_user_sessions_tenant_status', 'user_sessions', ['tenant_id', 'status'], unique=False)
    op.create_index('ix_user_sessions_user_status', 'user_sessions', ['user_id', 'status'], unique=False)

    # 5. Create FKs
    op.create_foreign_key('fk_login_attempts_tenant', 'login_attempts', 'tenants', ['tenant_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_login_attempts_user', 'login_attempts', 'users', ['user_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_tenant_memberships_invited_by', 'tenant_memberships', 'users', ['invited_by'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_tenant_memberships_role', 'tenant_memberships', 'roles', ['role_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_tenant_memberships_tenant', 'tenant_memberships', 'tenants', ['tenant_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_tenant_memberships_user', 'tenant_memberships', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    
    op.drop_constraint('user_sessions_user_id_fkey', 'user_sessions', type_='foreignkey')
    op.create_foreign_key('fk_user_sessions_tenant_id', 'user_sessions', 'tenants', ['tenant_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_user_sessions_membership_id', 'user_sessions', 'tenant_memberships', ['membership_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_user_sessions_user_id', 'user_sessions', 'users', ['user_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_user_sessions_deleted_by', 'user_sessions', 'users', ['deleted_by'], ['id'], ondelete='SET NULL')

    # 6. Drop old columns
    op.drop_column('user_sessions', 'is_revoked')
    op.drop_column('user_sessions', 'refresh_token')

    # 7. Set NOT NULL
    op.alter_column('user_sessions', 'refresh_token_hash', existing_type=sa.String(), nullable=False)
    op.alter_column('user_sessions', 'family_id', existing_type=sa.Uuid(), nullable=False)
    op.alter_column('user_sessions', 'status', existing_type=sa.Enum('ACTIVE', 'REVOKED', 'EXPIRED', 'COMPROMISED', name='sessionstatus'), nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'failed_login_count')
    op.drop_column('users', 'last_password_change_at')
    op.drop_column('users', 'email_verified_at')
    op.add_column('user_sessions', sa.Column('refresh_token', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.add_column('user_sessions', sa.Column('is_revoked', sa.BOOLEAN(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'user_sessions', type_='foreignkey')
    op.drop_constraint(None, 'user_sessions', type_='foreignkey')
    op.drop_constraint(None, 'user_sessions', type_='foreignkey')
    op.drop_constraint(None, 'user_sessions', type_='foreignkey')
    op.create_foreign_key(op.f('user_sessions_user_id_fkey'), 'user_sessions', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.drop_index('ix_user_sessions_user_status', table_name='user_sessions')
    op.drop_index('ix_user_sessions_tenant_status', table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_tenant_id'), table_name='user_sessions')
    op.drop_index('ix_user_sessions_status', table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_refresh_token_hash'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_membership_id'), table_name='user_sessions')
    op.drop_index('ix_user_sessions_family_status', table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_family_id'), table_name='user_sessions')
    op.drop_index('ix_user_sessions_expires_at', table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_current_jti'), table_name='user_sessions')
    op.create_index(op.f('ix_user_sessions_refresh_token'), 'user_sessions', ['refresh_token'], unique=True)
    op.create_index(op.f('ix_user_sessions_id'), 'user_sessions', ['id'], unique=False)
    op.alter_column('user_sessions', 'ip_address',
               existing_type=postgresql.INET(),
               type_=sa.VARCHAR(),
               existing_nullable=True)
    op.alter_column('user_sessions', 'user_id',
               existing_type=sa.UUID(),
               nullable=False)
    op.drop_column('user_sessions', 'deleted_by')
    op.drop_column('user_sessions', 'deleted_at')
    op.drop_column('user_sessions', 'revoke_reason')
    op.drop_column('user_sessions', 'revoked_at')
    op.drop_column('user_sessions', 'last_activity_at')
    op.drop_column('user_sessions', 'os')
    op.drop_column('user_sessions', 'browser')
    op.drop_column('user_sessions', 'platform')
    op.drop_column('user_sessions', 'device_name')
    op.drop_column('user_sessions', 'device_id')
    op.drop_column('user_sessions', 'status')
    op.drop_column('user_sessions', 'current_jti')
    op.drop_column('user_sessions', 'family_id')
    op.drop_column('user_sessions', 'refresh_token_hash')
    op.drop_column('user_sessions', 'membership_id')
    op.drop_column('user_sessions', 'tenant_id')
    op.drop_index('ix_tenant_memberships_user_status', table_name='tenant_memberships')
    op.drop_index(op.f('ix_tenant_memberships_user_id'), table_name='tenant_memberships')
    op.drop_index('ix_tenant_memberships_tenant_status', table_name='tenant_memberships')
    op.drop_index(op.f('ix_tenant_memberships_tenant_id'), table_name='tenant_memberships')
    op.drop_index(op.f('ix_tenant_memberships_role_id'), table_name='tenant_memberships')
    op.drop_index(op.f('ix_tenant_memberships_id'), table_name='tenant_memberships')
    op.drop_table('tenant_memberships')
    op.drop_index('ix_login_attempts_user_attempted_at', table_name='login_attempts')
    op.drop_index('ix_login_attempts_ip_attempted_at', table_name='login_attempts')
    op.drop_index(op.f('ix_login_attempts_ip_address'), table_name='login_attempts')
    op.drop_index('ix_login_attempts_email_attempted_at', table_name='login_attempts')
    op.drop_index(op.f('ix_login_attempts_email'), table_name='login_attempts')
    op.drop_index('ix_login_attempts_attempted_at', table_name='login_attempts')
    op.drop_table('login_attempts')
    # ### end Alembic commands ###
