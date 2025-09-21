from fastapi import FastAPI
from routers.user_router import router as user_router
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="My FastAPI App")

# CORS for local dev (adjust as needed)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # any origin
    allow_methods=["*"],      # any method
    allow_headers=["*"],      # any header
    allow_credentials=False,  # IMPORTANT: must be False when using "*"
)

# Mount under /api so endpoints are /api/signup and /api/login
app.include_router(user_router, prefix="/api", tags=["auth"])

@app.get("/")
def root():
    return {"message": "FastAPI App is running!"}
