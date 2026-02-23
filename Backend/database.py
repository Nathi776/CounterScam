import os
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


"""Database configuration.

To make local setup easy:
1) Prefer DATABASE_URL from the environment.
2) Fall back to a local SQLite database (../test.db).

If you want Postgres, set e.g.:
  DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/Scam
"""

BASE_DIR = os.path.dirname(__file__)
DEFAULT_SQLITE_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "test.db"))

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    # Needed for SQLite when used in multi-threaded FastAPI.
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class URLCheck(Base):
    __tablename__ = 'url_checks'
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    flagged = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)

class MessageCheck(Base):
    __tablename__ = 'message_checks'
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    flagged = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)

class ReportContent(Base):
    __tablename__ = 'report_contents'
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    reported_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)