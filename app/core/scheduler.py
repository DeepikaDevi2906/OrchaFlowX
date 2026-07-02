from collections import deque


class Scheduler:

    def __init__(self, dag):
        self.graph = dag.get_graph()
        self.in_degree = dag.get_in_degree()

    def get_ready_steps(self):

        queue = deque()

        for step, degree in self.in_degree.items():
            if degree == 0:
                queue.append(step)

        return list(queue)

    def mark_completed(self, step):

        ready = []

        for child in self.graph[step]:
            self.in_degree[child] -= 1

            if self.in_degree[child] == 0:
                ready.append(child)

        return ready