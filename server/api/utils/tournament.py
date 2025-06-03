from datetime import datetime
from zoneinfo import ZoneInfo

from db.models.tournament import Tournament


def is_tournament_finished(tournament: Tournament) -> bool:
    """
    Check if a tournament is finished based on its end_time or start_time.

    Args:
        tournament: Tournament object to check

    Returns:
        bool: True if tournament is finished, False otherwise
    """
    now = datetime.now(ZoneInfo("Europe/Moscow"))
    naive_now = now.replace(tzinfo=None)

    # If end_time is specified, use it; otherwise use start_time
    finish_time = tournament.end_time if tournament.end_time else tournament.start_time

    return finish_time < naive_now
