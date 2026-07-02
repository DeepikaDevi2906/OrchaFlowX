from uuid import uuid4
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from db.database import Base
from sqlalchemy import Column, Integer

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")
    steps = relationship(
        "Step",
        back_populates="workflow",
        cascade="all, delete"
    )
class Step(Base):
    __tablename__ = "steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")

    workflow_id = Column(
        UUID(as_uuid=True),
        ForeignKey("workflows.id"),
        nullable=False
    )

    workflow = relationship(
        "Workflow",
        back_populates="steps"
    )
    retry_count = Column(
        Integer,
        default=0
    )
class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    parent_step_id = Column(
        UUID(as_uuid=True),
        ForeignKey("steps.id"),
        nullable=False
    )

    child_step_id = Column(
        UUID(as_uuid=True),
        ForeignKey("steps.id"),
        nullable=False
    )
