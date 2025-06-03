"""Repository layer for database operations"""

from repositories.admin_user import AdminUserRepository
from repositories.base import BaseRepository
from repositories.club import ClubRepository
from repositories.loyalty import LoyaltyRepository
from repositories.payment import PaymentRepository
from repositories.registration import RegistrationRepository
from repositories.tournament import TournamentRepository
from repositories.user import UserRepository
from repositories.waitlist import WaitlistRepository

# Initialize repository instances
user_repository = UserRepository()
tournament_repository = TournamentRepository()
registration_repository = RegistrationRepository()
payment_repository = PaymentRepository()
admin_user_repository = AdminUserRepository()
club_repository = ClubRepository()
loyalty_repository = LoyaltyRepository()
waitlist_repository = WaitlistRepository()

__all__ = [
    "BaseRepository",
    "UserRepository",
    "TournamentRepository",
    "RegistrationRepository",
    "PaymentRepository",
    "AdminUserRepository",
    "ClubRepository",
    "LoyaltyRepository",
    "WaitlistRepository",
    # Repository instances
    "user_repository",
    "tournament_repository",
    "registration_repository",
    "payment_repository",
    "admin_user_repository",
    "club_repository",
    "loyalty_repository",
    "waitlist_repository",
]
