from uuid import UUID

from sqlalchemy.orm import Session

from db.models import Dependency
from schemas.dependency import DependencyCreate


def create_dependency(db: Session, dependency: DependencyCreate):

    new_dependency = Dependency(
        parent_step_id=UUID(dependency.parent_step_id),
        child_step_id=UUID(dependency.child_step_id)
    )

    db.add(new_dependency)
    db.commit()
    db.refresh(new_dependency)

    return new_dependency