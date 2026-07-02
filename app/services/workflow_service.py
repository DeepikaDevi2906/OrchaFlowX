from sqlalchemy.orm import Session

from db.models import Workflow
from schemas.workflow import WorkflowCreate


def create_workflow(
    db: Session,
    workflow: WorkflowCreate
):

    new_workflow = Workflow(
        name=workflow.name
    )

    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)

    return new_workflow

def get_all_workflows(db: Session):
    return db.query(Workflow).all()

def get_workflow_by_id(
    db: Session,
    workflow_id
):
    return db.query(Workflow).filter(
        Workflow.id == workflow_id
    ).first()

def delete_workflow(
    db: Session,
    workflow_id
):
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id
    ).first()

    if workflow is None:
        return None

    db.delete(workflow)
    db.commit()

    return workflow