from pydantic import BaseModel


class WorkflowCreate(BaseModel):
    name: str


class WorkflowResponse(BaseModel):
    id: str
    name: str
    status: str

    class Config:
        from_attributes = True