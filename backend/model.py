from typing import Optional

from pydantic import BaseModel

class APISchema(BaseModel):
    file: Optional[bytes]
