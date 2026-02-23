from fastapi import APIRouter, Depends
from database import SessionLocal
from dashboard.dashboard_service import (
    get_overview_stats,
    get_top_targeted_domains,
    get_recent_attacks,
    get_attack_trend
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/overview")
def overview(db=Depends(get_db)):
    return get_overview_stats(db)


@router.get("/top-domains")
def top_domains(db=Depends(get_db)):
    return get_top_targeted_domains(db)


@router.get("/recent-attacks")
def recent_attacks(db=Depends(get_db)):
    return get_recent_attacks(db)


@router.get("/attack-trend")
def attack_trend(db=Depends(get_db)):
    return get_attack_trend(db)
