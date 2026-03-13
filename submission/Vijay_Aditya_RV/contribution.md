# Project Contribution: Vijay Aditya R V
## Role: Team Lead & Core Security Architect

### 1. Core Modules Developed
*   **Secure Authentication & MFA System**: 
    *   Designed and implemented the two-factor authentication (2FA) workflow using TOTP (Time-based One-Time Password).
    *   Integrated the `speakeasy` and `qrcode` libraries for secure secret generation and scanning.
    *   Developed the "Sync-Window" logic to handle clock drift between user devices and the server, ensuring 99.9% verification reliability.
*   **Neural AI Architecture**:
    *   Architected the "Neural Dash" logic that bridges patient experiences with AI-driven medical trends.
    *   Integrated Google Gemini AI for symptom analysis and clinical insight extraction.
*   **Dynamic Intelligence Landing Page**:
    *   Developed the high-performance, mouse-reactive spotlight effect using vanilla CSS and JavaScript.
    *   Implemented real-time analytics fetching to sync the platform's global metrics (Total Insights, Outcome Accuracy).

### 2. Database Operations (MongoDB/Mongoose)
*   **User Security Schema**: 
    *   Designed the extended `User` model to support encrypted `mfaSecret` and recovery `backupCodes`.
    *   Implemented specialized field selection logic (`+mfaSecret`) to maintain maximum data privacy while allowing backend verification.
*   **State Management**: 
    *   Architected the Redux Toolkit slices for `auth` and `profile`, managing complex login states (mfaPending, tempToken).

### 3. Innovation & Complexity
*   **Security Barrier**: Implemented a "Two-Step JWT" payload where users are given a temporary "Pending" token after password entry, which is only upgraded to a full session after valid MFA verification.
*   **Neural UX**: Created a custom physics-based background animation for the landing page to differentiate HealNet as a premium medical AI platform.
