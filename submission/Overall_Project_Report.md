# 23CSE416: FULL STACK FRAMEWORKS
## GROUP – 22: HEALNET
**GITHUB URL**: [https://github.com/Vimal-Sabari/HealNet](https://github.com/Vimal-Sabari/HealNet)

### Team Members
| Name | Roll Number |
| :--- | :--- |
| Akilan C | CB.SC.U4CSE23607 |
| **Vijay Aditya R V** | **CB.SC.U4CSE23657** |
| Guru D | CB.SC.U4CSE23720 |
| Vimal Sabari S B | CB.SC.U4CSE23758 |

---

### 1. Introduction
HealNet is an AI-powered healthcare intelligence platform designed to bridge the gap between patient experiences and data-driven medical decision-making. The system enables users to share structured medical journeys, perform AI-powered symptom searches, compare hospitals and treatments, and access analytical insights derived from real-world data.

The platform integrates user-generated medical experiences with Natural Language Processing (NLP) and semantic similarity techniques to deliver intelligent health insights. It combines structured review systems, AI contextual analysis, moderation controls, and incentive mechanisms into a unified healthcare decision support ecosystem.

### 2. System Architecture Overview
The HealNet system is composed of multiple functional modules operating across the frontend, backend, AI layer, and database layer.

The architecture consists of:
*   Presentation Layer (Frontend – React)
*   Application Layer (Node.js / Express Backend)
*   AI Processing Layer (NLP & Embedding Engine)
*   Data Layer (MongoDB Database)
*   **Security & Identity Layer (Advanced MFA Integrations)**
*   Moderation and Governance Layer
*   Incentive and Credential Points System

---

### 3. Module-Wise Detailed Description

#### 3.1 User & Identity Module
**Assigned to**: Vimal Sabari S B – CSE23758 & **Vijay Aditya R V (Security Extensions)**
*   **Purpose**: Manages user authentication, authorization, and identity privacy settings within the platform.
*   **Core Responsibilities**: 
    *   User registration and Login authentication.
    *   JWT token generation and Role-based access control (User/Admin).
    *   Anonymous identity handling.
    *   **Advanced Security (NEW)**: Multi-Factor Authentication (MFA) using TOTP (Time-based One-Time Password).
    *   **MFA Setup**: Generation of secure TOTP secrets and QR code production for authenticator apps (Google Authenticator/Authy).
    *   **Recovery logic**: Automated generation of Backup Recovery Codes for account salvage.
*   **Forms Included**: User Registration Form, Login Form, **MFA Setup & Verification Shield**.
*   **Database Table**: Users Collection (Fields: User ID, Name, Email, Password, Role, Anonymity Flag, Credential Points, **mfaEnabled, mfaSecret, backupCodes**).

#### 3.2 Social Health Experience Module
**Assigned to**: Vimal Sabari S B – CSE23758
*   **Purpose**: Allows users to create, view, update, and delete structured health experiences.
*   **Core Responsibilities**: Experience posting, editing/deletion, Feed rendering, Anonymous posting, and outcome classification.

#### 3.3 Symptom Input & Query Module
**Assigned to**: Akilan C – CSE23607
*   **Purpose**: Collects symptom descriptions from users for AI-driven analysis.
*   **Core Responsibilities**: Free-text symptom input, Severity/Duration parameters, and AI engine interface.

#### 3.4 AI Analysis & Similarity Module
**Assigned to**: Guru D – CSE23720
*   **Purpose**: Uses NLP/Embeddings to match symptom queries with historical cases.
*   **Core Responsibilities**: Vector generation, Similarity scoring, andranked outcomes.

#### 3.5 Search & Discovery Module
**Assigned to**: Vijay Aditya R V – CSE23657
*   **Purpose**: Enables structured and keyword-based search across platform content.
*   **Core Responsibilities**: Keyword search, Symptom filtering, Hospital browsing, and Multi-filter query processing.

#### 3.6 Visualization & Insights Module
**Assigned to**: Vijay Aditya R V – CSE23657
*   **Purpose**: Transforms platform data into graphical insights and analytics.
*   **Advanced Visuals (NEW)**: **Dynamic "Neural Surface" Landing Page**.
    *   Implemented a mouse-reactive spotlight physics effect for an immersive UI.
    *   Real-time platform statistics syncing (Fetching platform-wide insights, success rates, and facility counts dynamically).
*   **Visualizations**: Experience Trend Chart, Symptom Frequency Distribution, Hospital Mention Ranking, Similar Case Match Statistics.

#### 3.7 Admin Moderation Module
**Assigned to**: Guru D – CSE23720
*   **Purpose**: Ensures content quality, compliance, and platform safety.

#### 3.8 Credential Points Module
**Assigned to**: Akilan C – CSE23607
*   **Purpose**: Implements reward-based engagement points for verified submissions.

---

### 4. Reports
*   **4.1 Experience Trend Report** (Vimal Sabari S B): Success vs failure distribution.
*   **4.2 Symptom Frequency Report** (Vimal Sabari S B): Commonly reported symptoms.
*   **4.3 Hospital Mention Report** (Akilan C): Ranking by mention frequency.
*   **4.4 Similar Case Match Report** (Vijay Aditya R V): AI query matching accuracy.
*   **4.5 Moderation Activity Report** (Guru D): Flagged posts and admin logs.

---

### 5. Database Design Overview
*   **Master Tables**: Users (Updated with Security/MFA fields), Hospitals (Specialty indexing).
*   **Transaction Tables**: Experiences, Symptom_Queries, Embeddings, Admin_Actions.
*   **Security Fields (NEW)**: Sensitive `mfaSecret` and `backupCodes` utilize Mongoose Hidden Selection (`select: false`) for maximum security.

---

### 6. Security Mechanisms
*   **Advanced MFA (NEW)**: Implementation of `Speakeasy` (TOTP) and `QRCode` libraries.
*   **Sync-Window Fix (NEW)**: Developed logic to allow a 30-second time drift window for reliable authenticator verification.
*   **Two-Step Verification**: Login flow expanded to require a secondary token verification before session issuance.
*   Password hashing (Bcrypt), JWT Auth, Role-Based Access (RBAC), and Sanitization.

---

### 7. Workflow Summary
1.  User registers and logs in.
2.  **MFA Setup (Optional but Recommended)**: User scans QR code in settings to activate 2FA.
3.  User submits experience → stored as pending.
4.  Admin approves post → Searchable feed.
5.  Other users search symptoms → AI matches cases.
6.  **Real-time Analytics**: Global dashboard updates dynamically based on backend datasets.

---

### 8. Final Contribution Tables

#### I. Modules and Contributions
| Module Name | Description | Contributor | Roll No |
| :--- | :--- | :--- | :--- |
| **Security & MFA Module** | **MFA Setup, TOTP, QR Logic, Backup Codes** | **Vijay Aditya R V** | **CSE23657** |
| User & Identity Module | Registration, Roles, Anonymity Flag | Vimal Sabari S B | CSE23758 |
| Social Health Experience | CRUD Operations, Outcome Classify | Vimal Sabari S B | CSE23758 |
| Symptom Input & Query | Symptom Queries, Severity Controls | Akilan C | CSE23607 |
| AI Analysis & Similarity | NLP, Similarity Match, Rankings | Guru D | CSE23720 |
| **Search & Discovery** | **Keywords, Multi-filters, Browsing** | **Vijay Aditya R V** | **CSE23657** |
| **Visualization & Neural UI**| **Charts, Dynamic Landing Page, Live Stats**| **Vijay Aditya R V** | **CSE23657** |
| Admin Moderation | Review, Approval, Banning Logs | Guru D | CSE23720 |
| Credential Points | User Reward Points Management | Akilan C | CSE23607 |

#### II. Reports and Contributions
| Report Name | Contributor | Roll No |
| :--- | :--- | :--- |
| Experience Trend Report | Vimal Sabari S B | CSE23758 |
| Symptom Frequency Report | Vimal Sabari S B | CSE23758 |
| Hospital Mention Report | Akilan C | CSE23607 |
| **Similar Case Match Report** | **Vijay Aditya R V** | **CSE23657** |
| Moderation Activity Report | Guru D | CSE23720 |

#### III. Forms and Contributions
| Module | Form Name | Contributor | Roll No |
| :--- | :--- | :--- | :--- |
| **Security Module** | **MFA Setup & Verification Shield** | **Vijay Aditya R V** | **CSE23657** |
| User & Identity | User Registration & Login Forms | Vimal Sabari S B | CSE23758 |
| Social Experience | Share Medical Experience Form | Vimal Sabari S B | CSE23758 |
| AI Analysis | Symptom Analysis Form | Akilan C | CSE23607 |
| Intelligence | Treatment/Hospital Compare Form | Guru D | CSE23720 |
| **Personalized Insights** | **Health Profile & Neural Surface** | **Vijay Aditya R V** | **CSE23657** |
| Admin Moderation | Content Review / Action Form | Guru D | CSE23720 |

### 9. Conclusion
HealNet integrates structured health storytelling, AI-powered contextual analysis, and industry-standard security into a comprehensive intelligence platform. With the addition of **Multi-Factor Authentication** and **Dynamic Neural Analytics**, the platform now provides a secure, high-fidelity ecosystem for informed healthcare decisions.
