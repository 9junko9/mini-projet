from datetime import datetime
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, select, text

from db import Base, engine, SessionLocal

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    owner = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class EquipmentCreate(BaseModel):
    name: str
    type: str
    status: str
    owner: str

class EquipmentOut(EquipmentCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

app = FastAPI(title="IT Inventory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health():
    with engine.connect() as c:
        c.execute(text("SELECT 1"))
    return {"status": "ok"}

@app.get("/equipment", response_model=List[EquipmentOut])
def list_equipment():
    with SessionLocal() as db:
        return db.execute(select(Equipment).order_by(Equipment.id.desc())).scalars().all()

@app.post("/equipment", response_model=EquipmentOut, status_code=201)
def create_equipment(payload: EquipmentCreate):
    with SessionLocal() as db:
        e = Equipment(**payload.model_dump())
        db.add(e)
        db.commit()
        db.refresh(e)
        return e

@app.patch("/equipment/{eid}/status", response_model=EquipmentOut)
def update_status(eid: int, status: str):
    with SessionLocal() as db:
        e = db.get(Equipment, eid)
        if not e:
            raise HTTPException(404)
        e.status = status
        db.commit()
        db.refresh(e)
        return e

@app.delete("/equipment/{eid}", status_code=204)
def delete_equipment(eid: int):
    with SessionLocal() as db:
        e = db.get(Equipment, eid)
        if not e:
            raise HTTPException(404)
        db.delete(e)
        db.commit()
