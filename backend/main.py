from fastapi import FastAPI
from config.database import Base, engine
from routes.role_route import router as roleRouter
from routes.company_route import router as company_router
from routes.user_route import router as userRouter

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(roleRouter)
app.include_router(company_router)
app.include_router(userRouter)
