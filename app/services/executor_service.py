from core.executor import WorkflowExecutor
from db.models import Step, Dependency
from core import executor_store

def build_executor(db, workflow_id):

    executor = WorkflowExecutor()

    steps = db.query(Step).filter(
        Step.workflow_id == workflow_id
    ).all()

    for step in steps:
        executor.add_step(str(step.id))

    dependencies = db.query(Dependency).all()

    for dependency in dependencies:
        executor.add_dependency(
            str(dependency.parent_step_id),
            str(dependency.child_step_id)
        )
    executor_store.executor = executor
    return executor