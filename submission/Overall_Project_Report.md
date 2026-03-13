# HealNet: Final Project Report (SEM 6)
**23CSE416 - FULL STACK FRAMEWORKS**
**GROUP – 22**

---

### **1. Introduction**
HealNet is an AI-powered healthcare intelligence platform designed to bridge the gap between patient experiences and data-driven medical decision-making. The platform integrates user-generated medical experiences with Natural Language Processing (NLP) and semantic similarity techniques to deliver intelligent health insights.

### **2. System Architecture**
*   **Presentation (Frontend)**: React.js (Vite), Redux Toolkit.
*   **Application (Backend)**: Node.js, Express.js.
*   **AI Layer**: Generative AI (Gemini) and Embedding Engine.
*   **Data Layer**: MongoDB Atlas.

### **3. Module Distribution & Ownership**

| Module | Contributor | Roll Number | Key Features |
| :--- | :--- | :--- | :--- |
| **Search & Discovery** | **Vijay Aditya R V** | **CB.SC.U4CSE23657** | Global Search, Multi-filter logic, Neural UI. |
| **Visualization & Insights**| **Vijay Aditya R V** | **CB.SC.U4CSE23657** | Analytical Dashboards, Chart Integration. |
| **Security & MFA** | **Vijay Aditya R V** | **CB.SC.U4CSE23657** | TOTP, QR Setup, Sync-Window Logic. |
| **User & Identity** | Vimal Sabari S B | CB.SC.U4CSE23758 | Auth, JWT, Anonymous Flagging. |
| **Social Experience** | Vimal Sabari S B | CB.SC.U4CSE23758 | CRUD Experiences, Outcome Types. |
| **Symptom Input** | Akilan C | CB.SC.U4CSE23607 | Free-text Input, Severity/Duration. |
| **Credential Points** | Akilan C | CB.SC.U4CSE23607 | Reward logic, Point tracking. |
| **AI Analysis** | Guru D | CB.SC.U4CSE23720 | Embedding generation, Similarity scoring. |
| **Admin Moderation** | Guru D | CB.SC.U4CSE23720 | Review system, User banning, Admin logs. |

### **4. Database Design & Operations**
The system logic is built around heavy aggregation pipelines in MongoDB:
*   **Hospital Ranking**: Grouping mentions to calculate facility trust scores.
*   **Outcome Analytics**: Classification of posts into 'Success' vs 'Failure' trends.
*   **AI Context Matching**: Semantic comparison using user-defined symptom parameters.
*   **MFA Persistence**: Secure storage of TOTP secrets with explicit database field shielding.

### **5. Security Mechanisms**
*   **Industry-Standard MFA**: Secure TOTP implementation via Google Authenticator.
*   **JWT Protection**: Stateful sessions with role-based access control (RBAC).
*   **Identity Masking**: Global toggle for PII removal in community feeds.

### **6. Conclusion**
HealNet successfully integrates health storytelling with AI-powered analysis and high-end security architecture. This unified ecosystem provides patients with scalable, data-backed medical intelligence.

---
**Team Members:**
1. Vijay Aditya R V (Lead)
2. Akilan C
3. Guru D
4. Vimal Sabari S B
