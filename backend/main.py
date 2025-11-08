from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import Base, engine
from routes.role_route import router as roleRouter
from routes.company_route import router as company_router
from routes.user_route import router as userRouter
from routes.attendance_route import router as attendance_router
from routes.leave_route import router as leave_router
from routes.payroll_route import router as payroll_router

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app.include_router(roleRouter)
app.include_router(company_router)
app.include_router(userRouter)
app.include_router(attendance_router)  # Include attendance router\
app.include_router(leave_router)  # Include attendance router
app.include_router(payroll_router)  # Include payroll router
