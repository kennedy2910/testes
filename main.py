import os
import io
import stripe
import requests
from fastapi import FastAPI, Body, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from dotenv import load_dotenv
load_dotenv()

# =====================
# APP
# =====================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# ENV
# =====================
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
XANO_API_BASE = os.getenv("XANO_API_BASE")

if not stripe.api_key:
    raise RuntimeError("STRIPE_SECRET_KEY not set")

if not XANO_API_BASE:
    raise RuntimeError("XANO_API_BASE not set")

# =====================
# STRIPE - CREATE CHECKOUT
# =====================
@app.post("/v1/stripe/create-checkout")
async def create_checkout(payload: dict = Body(...)):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    checkout = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": "eur",
                "product_data": {
                    "name": "Relatório Premium"
                },
                "unit_amount": 500
            },
            "quantity": 1
        }],
        metadata={
            "session_id": str(session_id)
        },
        success_url=(
            "http://localhost:3080/premium/"
            f"{session_id}"
            "?stripe_session_id={CHECKOUT_SESSION_ID}"
        ),
        cancel_url=f"http://localhost:3080/results/{session_id}"
    )

    return {
        "url": checkout.url
    }

# =====================
# STRIPE - CONFIRM PAYMENT (FRONTEND CALLS THIS)
# =====================
@app.get("/v1/stripe/confirm-session")
async def confirm_stripe_session(
    session_id: str = Query(...)
):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if session.payment_status == "paid":
        return {"paid": True}

    return {"paid": False}

# =====================
# PDF PREMIUM
# =====================
@app.post("/v1/pdf/premium")
async def generate_premium_pdf(report: dict = Body(...)):
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)

    width, height = A4
    y = height - 50

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, y, report.get("title", "Relatório Premium"))
    y -= 40

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "Visão Geral")
    y -= 20

    pdf.setFont("Helvetica", 11)
    text = pdf.beginText(50, y)
    text.textLine(report.get("overview", ""))
    pdf.drawText(text)
    y -= 60

    if report.get("complement"):
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Perfil Complementar")
        y -= 20

        pdf.setFont("Helvetica", 11)
        text = pdf.beginText(50, y)
        text.textLine(report.get("complement"))
        pdf.drawText(text)
        y -= 60

    pdf.setFont("Helvetica-Oblique", 10)
    pdf.drawString(50, 50, report.get("note", ""))

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=relatorio_premium.pdf"
        }
    )
