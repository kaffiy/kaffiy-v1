#!/usr/bin/env python3
"""
Kaffiy Bot Dashboard - Flask ile hafif, sadece veri okuyucu.
localhost:5000 adresinde çalışır; bot_stats.json'dan veri çeker.
"""

import os
import json
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, render_template_string, jsonify

app = Flask(__name__)

# Proje köküne göre bot_stats.json yolu
BASE_DIR = Path(__file__).resolve().parent
BOT_STATS_PATH = BASE_DIR / "kaffiy-growth-dashboard" / "kaffiy-growth-hub-main" / "src" / "data" / "bot_stats.json"


def read_bot_stats():
    """bot_stats.json dosyasını okur; yoksa veya hatalıysa varsayılan döner."""
    if not BOT_STATS_PATH.exists():
        return {
            "updated_at": None,
            "bot_status": "unknown",
            "funnel": {"total_leads": 0, "contacted": 0, "interested": 0, "converted": 0},
            "ai_log": [],
            "last_conversations": [],
            "ai_learning": [],
        }
    try:
        with open(BOT_STATS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            data = {}
        data.setdefault("funnel", {"total_leads": 0, "contacted": 0, "interested": 0, "converted": 0})
        data.setdefault("ai_log", [])
        data.setdefault("last_conversations", [])
        data.setdefault("ai_learning", [])
        return data
    except (json.JSONDecodeError, OSError):
        return {
            "updated_at": None,
            "bot_status": "unknown",
            "funnel": {"total_leads": 0, "contacted": 0, "interested": 0, "converted": 0},
            "ai_log": [],
            "last_conversations": [],
            "ai_learning": [],
        }


def is_bot_running(updated_at_str):
    """Son güncelleme 60 saniyeden yeniyse bot çalışıyor kabul edilir."""
    if not updated_at_str:
        return False
    try:
        # ISO format: 2025-01-30T12:00:00Z
        dt = datetime.fromisoformat(updated_at_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        if dt.tzinfo is None:
            now = datetime.utcnow()
        diff = (now - dt).total_seconds()
        return diff <= 90
    except (ValueError, TypeError):
        return False


HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kaffiy Bot Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    :root { --bs-body-bg: #1a1d21; --bs-body-color: #e4e6eb; }
    body { background: #1a1d21; color: #e4e6eb; min-height: 100vh; }
    .card { background: #242628; border: 1px solid #3e4247; color: #e4e6eb; }
    .card-header { background: #2d3035; border-bottom: 1px solid #3e4247; font-weight: 600; }
    .table { color: #e4e6eb; }
    .table thead th { border-color: #3e4247; color: #b0b3b8; }
    .table td, .table th { border-color: #3e4247; }
    .table tbody tr:hover { background: #2d3035; }
    .badge-running { background: #00c853; color: #000; }
    .badge-stopped { background: #6c757d; }
    .funnel-card { border-left: 4px solid #00c853; }
    .log-item { border-left: 3px solid #00c853; padding-left: 0.75rem; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .log-time { color: #b0b3b8; font-size: 0.75rem; }
    .nav-tabs .nav-link { color: #b0b3b8; border-color: #3e4247; }
    .nav-tabs .nav-link.active { background: #2d3035; color: #00c853; border-color: #3e4247; }
    .insight-card { background: #2d3035; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
    .insight-title { color: #00c853; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container-fluid py-4">
    <h1 class="mb-4"><i class="bi bi-speedometer2"></i> Kaffiy Bot Dashboard</h1>

    <!-- Canlı Bot Durumu -->
    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>Canlı Bot Durumu</span>
        <span class="badge {% if bot_running %}badge-running{% else %}badge-stopped{% endif %}">
          {% if bot_running %}Çalışıyor{% else %}Durdu{% endif %}
        </span>
      </div>
      <div class="card-body py-2">
        <small class="text-muted">Son güncelleme: {{ stats.updated_at or '—' }}</small>
      </div>
    </div>

    <!-- Satış Hunisi -->
    <div class="card mb-4">
      <div class="card-header">Satış Hunisi (Funnel)</div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="card funnel-card h-100">
              <div class="card-body text-center">
                <h4 class="text-primary">{{ funnel.total_leads }}</h4>
                <small>Toplam Lead</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card funnel-card h-100">
              <div class="card-body text-center">
                <h4 class="text-info">{{ funnel.contacted }}</h4>
                <small>İletişime Geçilen</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card funnel-card h-100">
              <div class="card-body text-center">
                <h4 class="text-warning">{{ funnel.interested }}</h4>
                <small>İlgilenen</small>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card funnel-card h-100">
              <div class="card-body text-center">
                <h4 class="text-success">{{ funnel.converted }}</h4>
                <small>Satış Kapanan</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- AI Günlüğü -->
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header">AI Günlüğü <small class="text-muted">(Son 10 işlem)</small></div>
          <div class="card-body overflow-auto" style="max-height: 320px;">
            {% for item in ai_log_reversed %}
            <div class="log-item">
              <span class="log-time">{{ item.time }}</span><br>
              <strong>{{ item.action }}</strong>: {{ item.detail }}
            </div>
            {% else %}
            <p class="text-muted mb-0">Henüz kayıt yok.</p>
            {% endfor %}
          </div>
        </div>
      </div>

      <!-- AI Learning Center (Tab) -->
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="bi bi-cpu"></i> AI Learning Center</span>
            <button type="button" class="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#learningModal">Tümünü Gör</button>
          </div>
          <div class="card-body overflow-auto" style="max-height: 320px;">
            {% for insight in ai_learning %}
            <div class="insight-card">
              <div class="insight-title">{{ insight.title }}</div>
              <div>{{ insight.insight }}</div>
            </div>
            {% else %}
            <p class="text-muted mb-0">Leads verisi analiz edildikçe burada görünecek.</p>
            {% endfor %}
          </div>
        </div>
      </div>
    </div>

    <!-- Son Konuşmalar Tablosu -->
    <div class="card mb-4">
      <div class="card-header">Son Konuşmalar</div>
      <div class="card-body p-0 overflow-auto">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>İşletme</th>
              <th>Müşteri (Son Mesaj)</th>
              <th>AI Cevabı</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {% for c in last_conversations_reversed %}
            <tr>
              <td>{{ c.company or '—' }}</td>
              <td><small>{{ (c.last_user_message or '')[:120] }}{% if (c.last_user_message or '')|length > 120 %}…{% endif %}</small></td>
              <td><small>{{ (c.last_ai_response or '')[:120] }}{% if (c.last_ai_response or '')|length > 120 %}…{% endif %}</small></td>
              <td><small class="text-muted">{{ c.at or '—' }}</small></td>
            </tr>
            {% else %}
            <tr><td colspan="4" class="text-muted text-center py-4">Henüz konuşma kaydı yok.</td></tr>
            {% endfor %}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- AI Learning Center Modal -->
  <div class="modal fade" id="learningModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content" style="background: #242628; color: #e4e6eb; border: 1px solid #3e4247;">
        <div class="modal-header border-secondary">
          <h5 class="modal-title"><i class="bi bi-cpu"></i> AI Learning Center – Son Analizler</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted small">leads_data.json verilerine göre bölge ve durum özeti.</p>
          {% for insight in ai_learning %}
          <div class="insight-card">
            <div class="insight-title">{{ insight.title }}</div>
            <div>{{ insight.insight }}</div>
          </div>
          {% else %}
          <p class="text-muted">Henüz analiz yok.</p>
          {% endfor %}
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    setTimeout(function(){ location.reload(); }, 30000);
  </script>
</body>
</html>
"""


@app.route("/")
def index():
    stats = read_bot_stats()
    funnel = stats.get("funnel") or {}
    ai_log = stats.get("ai_log") or []
    last_conversations = stats.get("last_conversations") or []
    ai_learning = stats.get("ai_learning") or []
    bot_running = is_bot_running(stats.get("updated_at"))

    return render_template_string(
        HTML_TEMPLATE,
        stats=stats,
        funnel=funnel,
        ai_log_reversed=list(reversed(ai_log))[:10],
        last_conversations_reversed=list(reversed(last_conversations))[:15],
        ai_learning=ai_learning[-5:],
        bot_running=bot_running,
    )


@app.route("/api/stats")
def api_stats():
    stats = read_bot_stats()
    stats["bot_running"] = is_bot_running(stats.get("updated_at"))
    return jsonify(stats)


if __name__ == "__main__":
    print("🌐 Dashboard http://localhost:5000 adresinde yayında!")
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
