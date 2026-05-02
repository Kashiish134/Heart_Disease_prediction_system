#!/usr/bin/env python
# coding: utf-8

# In[9]:


# ================= IMPORTS =================
from flask import Flask, render_template, request, send_file
import pickle
import numpy as np
import sqlite3
import matplotlib.pyplot as plt
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os
from datetime import datetime

# ===== REPORTLAB MD5 FIX (Python 3.7 Windows) =====
import hashlib
import reportlab.lib.utils as rl_utils
import reportlab.pdfbase.pdfdoc as pdfdoc

_real_md5 = hashlib.md5

def _safe_md5(*args, **kwargs):
    return _real_md5(*args)

hashlib.md5 = _safe_md5
rl_utils.md5 = _safe_md5
pdfdoc.md5 = _safe_md5
# ==================================================


# ================= APP INIT =================
app = Flask(__name__)

model = pickle.load(open("heart_model.pkl", "rb"))


# ================= DATABASE INIT =================
def init_db():
    conn = sqlite3.connect("patients.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            prediction TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()


# ================= ROUTES =================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    form_values = list(request.form.values())

    name = form_values[0]
    features = [float(x) for x in form_values[1:]]

    final = np.array([features])
    prediction = model.predict(final)[0]

    if prediction == 1:
        result = f"{name}, High Risk of Heart Disease"
    else:
        result = f"{name}, Low Risk of Heart Disease"

    # save to DB
    conn = sqlite3.connect("patients.db")
    c = conn.cursor()
    c.execute(
        "INSERT INTO patients (name, prediction) VALUES (?, ?)",
        (name, result)
    )
    conn.commit()
    conn.close()

    return render_template("index.html", prediction_text=result)


@app.route("/stats")
def stats():
    conn = sqlite3.connect("patients.db")
    c = conn.cursor()
    c.execute("SELECT prediction FROM patients")
    data = c.fetchall()
    conn.close()

    high = sum("High" in d[0] for d in data)
    low = sum("Low" in d[0] for d in data)

    labels = ["High Risk", "Low Risk"]
    values = [high, low]

    os.makedirs("static", exist_ok=True)
    chart_path = "static/chart.png"

    plt.figure()
    plt.bar(labels, values)
    plt.title("Heart Disease Risk Distribution")
    plt.savefig(chart_path)
    plt.close()

    return render_template("stats.html", chart=chart_path)


@app.route("/download_report")
def download_report():
    name = request.args.get("name")
    result = request.args.get("result")

    filename = f"{name}_report.pdf"
    filepath = os.path.join(os.getcwd(), filename)

    # fetch history
    conn = sqlite3.connect("patients.db")
    c = conn.cursor()
    c.execute("SELECT name, prediction FROM patients")
    patients = c.fetchall()
    conn.close()

    # graph data
    high = sum("High" in p[1] for p in patients)
    low = sum("Low" in p[1] for p in patients)

    chart_path = "static/pdf_chart.png"
    plt.figure(figsize=(4,3))
    plt.bar(["High Risk", "Low Risk"], [high, low])
    plt.title("Risk Distribution")
    plt.tight_layout()
    plt.savefig(chart_path)
    plt.close()

    # PDF
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    margin = 50
    y = height - margin

    # ===== HEADER BAND =====
    logo = "static/logo.png"
    if os.path.exists(logo):
        c.drawImage(logo, margin, y-40, width=50, preserveAspectRatio=True)

    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width/2, y-10, "City Care Hospital")

    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, y-28, "Heart Disease Prediction Report")

    now = datetime.now().strftime("%d %b %Y  %H:%M")
    c.setFont("Helvetica", 10)
    c.drawRightString(width-margin, y-10, f"Date: {now}")

    y -= 70  # space after header

    # ===== PATIENT INFO =====
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Patient Name:")
    c.setFont("Helvetica", 12)
    c.drawString(margin+110, y, name)

    y -= 25

    # risk badge
    if "High" in result:
        c.setFillColorRGB(1, 0.8, 0.8)
        badge = "HIGH RISK"
    else:
        c.setFillColorRGB(0.8, 1, 0.8)
        badge = "LOW RISK"

    c.roundRect(margin, y-10, 120, 25, 6, fill=1, stroke=0)
    c.setFillColorRGB(0,0,0)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(margin+60, y+5, badge)

    y -= 50

    # ===== GRAPH =====
    if os.path.exists(chart_path):
        c.drawImage(chart_path, margin, y-200, width=250)
    y -= 220

    # ===== TABLE =====
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Recent Patient History")
    y -= 20

    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "Name")
    c.drawString(margin+150, y, "Prediction")
    y -= 10
    c.line(margin, y, width-margin, y)
    y -= 15

    c.setFont("Helvetica", 10)
    for p in patients[-8:]:
        c.drawString(margin, y, p[0])
        c.drawString(margin+150, y, p[1])
        y -= 15
        if y < 120:
            break

    # ===== SIGNATURE =====
    sign = "static/signature.png"
    if os.path.exists(sign):
        c.drawImage(sign, width-margin-120, 80, width=120, preserveAspectRatio=True)

    c.setFont("Helvetica", 10)
    c.drawRightString(width-margin, 60, "Dr. Smith")
    c.drawRightString(width-margin, 45, "Cardiologist")

    # ===== FOOTER =====
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(margin, 40, "Generated by AI Heart Disease Prediction System")
    c.drawString(margin, 25, "This is not a medical diagnosis. Consult a doctor.")

    c.save()

    return send_file(filepath, as_attachment=True)

  


# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)


# In[ ]:




