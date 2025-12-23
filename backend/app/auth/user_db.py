from sqlalchemy.orm import Session
from app.database import UserModel

def get_user(db: Session, email: str):
    """Retrieve a user from the database by email."""
    return db.query(UserModel).filter(UserModel.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    """Retrieve a user from the database by ID."""
    return db.query(UserModel).filter(UserModel.id == user_id).first()

def create_user(db: Session, email: str, full_name: str, hashed_password: str):
    """Create a new user in the database."""
    # Check if user already exists
    existing_user = get_user(db, email)
    if existing_user:
        return None
    
    db_user = UserModel(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        disabled=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user with email and password."""
    from .auth_utils import verify_password
    
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def update_user(db: Session, user_id: int, **kwargs):
    """Update user information."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    for key, value in kwargs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user
