# Project Contribution: Vijay Aditya R V (CB.SC.U4CSE23657)
## Role: Full Stack Architect & Security Lead

### 1. Modules Developed (Full Responsibility)
*   **Search & Discovery Module**:
    *   Designed and implemented the Global Search architecture.
    *   Developed multi-filter query processing for symptoms, tags, and hospitals.
    *   Implemented high-fidelity search layouts with debounce logic for performance optimization.
*   **Visualization & Insights Module**:
    *   Developed the "Neural Dash" analytics engine.
    *   Implemented interactive charts for:
        *   Experience Trend Distribution (Success/Failure).
        *   Symptom Frequency Analysis.
        *   Hospital Mention Rankings.
        *   AI Case Match Statistics.
*   **Personalized Health Insight Module**:
    *   Created the Health Insight Profile management forms.
    *   Developed the AI Personalization toggle and persistent user health settings.
    *   **Advanced Innovation (Added Value)**: Architected and implemented the entire **Multi-Factor Authentication (MFA)** system (TOTP), incorporating QR code generation and shift-window drift handling.

### 2. Database Operations & Logic
*   **Architecture Design**: 
    *   Designed the core `User` model extensions for health profiles and security credentials.
    *   Implemented specialized MongoDB aggregation pipelines for the **Similar Case Match Report**.
*   **Security Implementation**:
    *   Built the "Two-Step JWT" login flow to handle MFA-protected accounts.
    *   Implemented field-level security (`select: false`) for sensitive TOTP secrets and recovery codes.

### 3. Reporting Contribution
*   **Similar Case Match Report**: 
    *   Engineered the tracking system for AI query performance.
    *   Built the aggregation logic to map symptom query text against medical experience density.

### 4. Technical Achievements
*   Achieved 100% mobile responsiveness across the primary analytics and search dashboards.
*   Developed the custom "Neural Surface" landing page with mouse-reactive physics and real-time backend data syncing.
