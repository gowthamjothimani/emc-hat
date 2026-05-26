from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from db import Base

class TestLog(Base):
    __tablename__ = "test_logs"

    id = Column(Integer, primary_key=True, index=True)
    pcb_serial = Column(String, index=True)
    model = Column(String)
    project = Column(String)
    qc_status = Column(String)

    raw_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
