from pydantic import BaseModel


class DependencyCreate(BaseModel):
    parent_step_id: str
    child_step_id: str