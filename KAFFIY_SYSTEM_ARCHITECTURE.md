# 🧠 KAFFIY Project: System Architecture & Reference Guide

This document serves as a comprehensive technical guide for the **Kaffiy** project. It is designed to provide full context for developers and AI agents working on the system.

---

## 🚀 1. Project Overview & Mission
**Kaffiy** is an AI-powered "New Generation Customer Loyalty System" designed to protect local and boutique coffee shops in Istanbul against global chains. 
- **Core Value:** Digitizing the old "buy 10 get 1 free" paper cards using QR codes and WhatsApp integration.
- **Mission:** Help cafe owners recognize their most loyal customers, reward them automatically, and prevent customer churn using AI analysis.

---

## 🛠 2. Technology Stack
- **Frontend (Dashboard):** React.js, Vite, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend/Database:** Supabase (PostgreSQL) with Row Level Security (RLS).
- **Automation & AI:** 
  - **Python:** Bot logic, scraping, and lead generation.
  - **WAHA (WhatsApp HTTP API):** WhatsApp communication layer.
  - **OpenAI/Gemini:** Human-like reasoning and marketing content generation.
- **Infrastructure:** Multi-tenant architecture (supporting multiple brands/cafes).

---

## 📂 3. Project Structure
The project is divided into several specialized repositories/directories:

- `/Kaffiy-Dashboard`: The main management panel for cafe owners (Shadcn-based).
- `/Kaffiy-Lead-Generator`: 
    - `kaffiy_bot/`: Main AI agents for sales and lead management.
    - `kaffiy-growth-dashboard/`: Lead tracking and sales funnel UI.
- `/Kaffiy-Landing-Page-Codes`: Marketing website for the B2B side.
- `/Kaffiy-Mobile-UI`: The customer-facing mobile interface (QR landing page).
- `/Kaffiy-Database`: Contains the core SQL schema and Type definitions.

---

## 📊 4. Database Schema (Supabase/PostgreSQL)

### 🧩 Key Enums
- `type_payment`: free, economy, standard, premium, custom.
- `type_worker`: brand_admin, brand_manager, store_manager, store_staff.
- `type_royalty`: explorer, bronze, silver, gold, legend.
- `status_campaign`: draft, active, paused, expired, cancelled.

### 🏛 Core Tables & Relations
| Table | Description | Key Connections |
| :--- | :--- | :--- |
| `company_tb` | Brands/Companies (Tenants). | Root of all data. |
| `shop_tb` | Physical store locations. | `company_id` |
| `user_tb` | End-customers (Coffee drinkers). | Unique by email/phone. |
| `royalty_tb` | Loyalty point balances per cafe. | `user_id` + `company_id` |
| `campaign_tb` | Marketing rewards and discounts. | `company_id`, `shop_id` |
| `qr_tb` | QR code logs and usage. | `campaign_id`, `user_id`, `company_id` |
| `token_usage_tb`| Tracking AI costs per brand. | `company_id` |
| `worker_tb` | Employee accounts and roles. | `company_id`, `shop_id` |

---

## 🤖 5. AI & Bot Ecosystem
- **Persona System:** The system uses distinct personas:
  - **Maria:** Professional, authoritative content writer.
  - **Josh:** Budget-focused, strategic planner.
- **Memory Vault:** Uses a JSON/Vector-based storage to remember past decisions and interactions with cafe owners.
- **Anti-Ban Logic:** Advanced Python scripts (`anti_ban_utils.py`) to manage WhatsApp messaging frequency and patterns.

---

## 📈 6. Analytical Views
The system uses PostgreSQL Views for real-time dashboard performance:
- `user_loyalty_summary`: Aggregates points and status across all brands for a user.
- `campaign_performance_summary`: Calculates ROI and usage rates for active campaigns.

---

## 🚧 7. Future Considerations & Scalability
*To be addressed by future versions:*
1. **Audit Trail:** Implementation of a `point_history_tb` to track every +/- point move for auditability.
2. **Geographical Normalization:** Migrating `shop_tb.address` to use `city_id` and `district_id` for better heat-map analysis.
3. **Localization:** Migration of campaign titles to `JSONB` for multi-language support (TR/EN).
4. **Real-time Streaming:** Expansion of the Supabase Realtime usage for live bot activity tracking in the dashboard.

---

## 🔑 8. Final Notes for AI Agents
When modifying the Dashboard, refer to `src/pages/` for existing UI patterns. When working on the logic, ensure that **Row Level Security (RLS)** is always respected to prevent cross-tenant data leaks.

*Document Version: 1.0.0*
*Last Updated: February 2026*
