from fastapi import FastAPI
from config.database import Base, engine
from routes.role_route import router as roleRouter

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(roleRouter)
