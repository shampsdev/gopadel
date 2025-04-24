from sqlalchemy.orm import Session

from ..models import User


def get_or_create_user(
    db: Session, tg_id: int, first_name: str, username: str | None = None
):
    user = db.query(User).filter(User.tg_id == tg_id).first()
    if user:
        return user
    user = User(tg_id=tg_id, first_name=first_name, username=username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
