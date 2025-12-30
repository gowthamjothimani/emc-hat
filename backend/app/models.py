from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True)
    device = Column(String)
    device_id = Column(String, unique=True)
    hostname = Column(String, unique=True)
    ip = Column(String)
    cpu_percent = Column(Float)
    uptime_sec = Column(Integer)
    status = Column(String)
    last_seen = Column(DateTime, default=datetime.utcnow)
