from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "postgresql://postgres:system@localhost/Scam"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

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