from core.dag import DAG
from core.scheduler import Scheduler


class WorkflowExecutor:

    def __init__(self):
        self.dag = DAG()
        self.scheduler = None

    def add_step(self, step_id):
        self.dag.add_step(step_id)

    def add_dependency(self, parent_step, child_step):
        self.dag.add_dependency(parent_step, child_step)

    def start(self):

        self.scheduler = Scheduler(self.dag)

        return self.scheduler.get_ready_steps()

    def complete_step(self, step_id):

        return self.scheduler.mark_completed(step_id)