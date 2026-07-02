from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import SessionLocal

from schemas.workflow import WorkflowCreate
from schemas.step import StepCreate
from schemas.dependency import DependencyCreate
from core.rabbitmq import publish
from services.workflow_service import (
    create_workflow,
    get_all_workflows,
    get_workflow_by_id,
    delete_workflow
)

from services.step_service import (
    create_step,
    get_all_steps
)

from services.dependency_service import create_dependency
from services.executor_service import build_executor

router = APIRouter(
    prefix="/workflows",
    tags=["Workflows"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------
# Workflow APIs
# ------------------------

@router.post("/")
def create(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db)
):
    return create_workflow(db, workflow)


@router.get("/")
def get_all(
    db: Session = Depends(get_db)
):
    return get_all_workflows(db)


# ------------------------
# Step APIs
# ------------------------

@router.post("/steps")
def add_step(
    step: StepCreate,
    db: Session = Depends(get_db)
):
    return create_step(db, step)


@router.get("/steps")
def list_steps(
    db: Session = Depends(get_db)
):
    return get_all_steps(db)


# ------------------------
# Dependency APIs
# ------------------------

@router.post("/dependencies")
def add_dependency(
    dependency: DependencyCreate,
    db: Session = Depends(get_db)
):
    return create_dependency(db, dependency)


# ------------------------
# Execute Workflow
# ------------------------

@router.post("/{workflow_id}/execute")
def execute_workflow(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    executor = build_executor(db, workflow_id)

    ready_steps = executor.start()
    for step in ready_steps:
     publish(step)
    return {
        "ready_steps": ready_steps
    }


# ------------------------
# Workflow by ID
# (Keep these LAST)
# ------------------------

@router.get("/{workflow_id}")
def get_workflow(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    return get_workflow_by_id(db, workflow_id)


@router.delete("/{workflow_id}")
def delete(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    return delete_workflow(db, workflow_id)