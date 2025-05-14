from sqlalchemy.orm import Session

from db.models.user import User


def get_or_create_user(db: Session, tg_id: int, username: str | None = None):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if user:
        return user
    user = User(
        telegram_id=tg_id,
        username=username,
        is_registered=False,
        first_name="",
        second_name="",
        avatar="",
        rank=0,
        city="",
        birth_date=None,
        loyalty_id=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
