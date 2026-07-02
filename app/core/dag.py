from collections import defaultdict
class DAG:
    def __init__(self):
        self.graph=defaultdict(list)
        self.indegree=defaultdict(int)

    def add_step(self,step_id):
        if step_id not in self.graph:
            self.graph[step_id]=[]
        if step_id not in self.indegree:
            self.indegree[step_id]=0

    def add_dependency(self,parent_step,child_step):
        self.graph[parent_step].append(child_step)
        self.indegree[child_step]+=1

    def get_graph(self):
        return self.graph
    
    def get_in_degree(self):
        return self.indegree
        

        
