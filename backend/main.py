from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import Base, engine, ensure_schema
from routes.role_route import router as roleRouter
from routes.company_route import router as company_router
from routes.user_route import router as userRouter
from routes.attendance_route import router as attendance_router
from routes.leave_route import router as leave_router
from routes.payroll_route import router as payroll_router
from routes.setting_route import router as settings_router

app = FastAPI()

# Explicit CORS origins to support Vite dev server with credentials and custom headers
ALLOWED_ORIGINS = [
	"http://localhost:5174",
	"http://127.0.0.1:5174",
	"http://localhost:5173",  # common vite default
	"http://127.0.0.1:5173",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=ALLOWED_ORIGINS,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=[
		"*",
		"Authorization",
		"Content-Type",
	],
	expose_headers=["Authorization"],
)


Base.metadata.create_all(bind=engine)
ensure_schema()  # run lightweight column checks/migrations

app.include_router(roleRouter)
app.include_router(company_router)
app.include_router(userRouter)
app.include_router(attendance_router)  # Include attendance router\
app.include_router(leave_router)  # Include attendance router
app.include_router(payroll_router)  # Include payroll router
app.include_router(settings_router)  # Settings (admin)

# Simple health probe to verify backend availability
@app.get("/health")
def health():
	return {"status": "ok"}
