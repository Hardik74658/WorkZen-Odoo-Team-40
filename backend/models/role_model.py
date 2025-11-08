from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from config.database import Base

class Role(Base):
    __tablename__ = "roles"

    rid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)

    # users = relationship("User", back_populates="role") 

