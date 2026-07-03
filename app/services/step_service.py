from uuid import UUID

from sqlalchemy.orm import Session

from db.models import Step,Dependency
from schemas.step import StepCreate


def create_step(db: Session, step: StepCreate):

    new_step = Step(
        name=step.name,
        workflow_id=UUID(step.workflow_id)
    )

    db.add(new_step)
    db.commit()
    db.refresh(new_step)

    return new_step


def get_all_steps(db: Session):

    return db.query(Step).all()

def update_step_status(
    db,
    step_id,
    status
):
    step = db.query(Step).filter(
        Step.id == step_id
    ).first()

    if step:
        step.status = status
        db.commit()
        db.refresh(step)

    return step



def find_next_ready_steps(db, workflow_id):

    ready_steps = []

    pending_steps = (
        db.query(Step)
        .filter(
            Step.workflow_id == workflow_id,
            Step.status == "PENDING"
        )
        .all()
    )

    for step in pending_steps:

        dependencies = (
            db.query(Dependency)
            .filter(
                Dependency.child_step_id == step.id
            )
            .all()
        )

        is_ready = True

        for dependency in dependencies:

            parent = (
                db.query(Step)
                .filter(
                    Step.id == dependency.parent_step_id
                )
                .first()
            )

            if parent.status != "COMPLETED":
                is_ready = False
                break

        if is_ready:
            ready_steps.append(step)

    return ready_steps

def increment_retry(db, step_id):

    step = (
        db.query(Step)
        .filter(Step.id == step_id)
        .first()
    )

    step.retry_count += 1

    db.commit()
    db.refresh(step)

    return step