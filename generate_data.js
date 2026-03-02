const fs = require('fs');

// helper functions
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const conditionsMap = {
    "Migraine": {
        symptoms: ["throbbing pain on one side of the head", "light sensitivity", "nausea during episodes", "visual aura", "severe headache", "dizziness", "vomiting", "sound sensitivity"],
        treatments: ["medication", "lifestyle management", "triptans", "botox injections", "pain relievers", "preventive medication"],
        recoveryRange: [5, 30],
        costRange: ["low", "medium"]
    },
    "PCOS": {
        symptoms: ["irregular periods", "weight gain", "acne", "excess hair growth", "pelvic pain", "thinning hair", "fatigue"],
        treatments: ["hormonal therapy", "lifestyle changes", "birth control pills", "metformin", "dietary changes"],
        recoveryRange: [30, 365],
        costRange: ["low", "medium"]
    },
    "Knee ligament injury": {
        symptoms: ["severe knee pain", "swelling", "instability in the knee", "popping sound at time of injury", "inability to bear weight"],
        treatments: ["physiotherapy", "ACL reconstruction surgery", "rest and ice", "knee brace", "arthroscopic surgery"],
        recoveryRange: [60, 180],
        costRange: ["medium", "high"]
    },
    "Kidney stones": {
        symptoms: ["severe back pain", "blood in urine", "nausea", "vomiting", "frequent urination", "painful urination", "sharp pain in the side"],
        treatments: ["lithotripsy", "surgery", "increased fluid intake", "pain medication", "ureteroscopy"],
        recoveryRange: [7, 30],
        costRange: ["medium", "high"]
    },
    "IVF treatment": {
        symptoms: ["infertility", "pelvic discomfort", "bloating", "mood swings", "fatigue"],
        treatments: ["in vitro fertilization", "hormone injections", "egg retrieval", "embryo transfer"],
        recoveryRange: [30, 90],
        costRange: ["high"]
    },
    "Cataract": {
        symptoms: ["cloudy vision", "difficulty seeing at night", "sensitivity to light and glare", "fading or yellowing of colors", "double vision in a single eye"],
        treatments: ["phaco surgery", "laser-assisted cataract surgery", "lens replacement", "cataract extraction"],
        recoveryRange: [3, 10],
        costRange: ["medium"]
    },
    "Depression": {
        symptoms: ["persistent sadness", "loss of interest", "changes in appetite", "trouble sleeping", "fatigue", "feelings of worthlessness", "difficulty concentrating"],
        treatments: ["cognitive behavioral therapy", "antidepressants", "counseling", "lifestyle changes", "psychotherapy"],
        recoveryRange: [90, 365],
        costRange: ["low", "medium"]
    },
    "Acne": {
        symptoms: ["whiteheads", "blackheads", "pimples", "cystic lesions", "redness", "skin inflammation"],
        treatments: ["topical retinoids", "oral antibiotics", "isotretinoin", "salicylic acid", "chemical peels"],
        recoveryRange: [30, 120],
        costRange: ["low"]
    },
    "Gallbladder removal": {
        symptoms: ["sudden and rapidly intensifying pain in upper right abdomen", "back pain between shoulder blades", "pain in right shoulder", "nausea", "vomiting"],
        treatments: ["laparoscopic cholecystectomy", "open gallbladder surgery", "medication to dissolve stones"],
        recoveryRange: [14, 45],
        costRange: ["medium", "high"]
    },
    "Hernia": {
        symptoms: ["bulge or lump in the affected area", "pain or discomfort", "weakness or pressure in the abdomen", "burning or aching sensation"],
        treatments: ["laparoscopic surgery", "open hernia repair", "watchful waiting", "wearing a truss"],
        recoveryRange: [21, 60],
        costRange: ["medium", "high"]
    },
    "Diabetes management": {
        symptoms: ["increased thirst", "frequent urination", "extreme hunger", "unexplained weight loss", "fatigue", "blurred vision"],
        treatments: ["insulin therapy", "oral medications", "dietary changes", "exercise program", "blood sugar monitoring"],
        recoveryRange: [30, 365],
        costRange: ["low", "medium"]
    },
    "Hypertension": {
        symptoms: ["headaches", "shortness of breath", "nosebleeds", "dizziness", "chest pain", "visual changes"],
        treatments: ["blood pressure medication", "low-sodium diet", "regular exercise", "stress management", "beta blockers"],
        recoveryRange: [30, 365],
        costRange: ["low"]
    },
    "Asthma": {
        symptoms: ["shortness of breath", "chest tightness", "wheezing", "coughing attacks", "difficulty breathing at night"],
        treatments: ["inhaled corticosteroids", "rescue inhalers", "allergy medications", "bronchodilators", "lifestyle adjustments"],
        recoveryRange: [7, 365],
        costRange: ["low", "medium"]
    },
    "Slip disc": {
        symptoms: ["lower back pain", "numbness or tingling in legs", "muscle weakness", "sciatica", "pain worsening with movement"],
        treatments: ["physical therapy", "pain relievers", "muscle relaxants", "epidural injections", "spinal surgery"],
        recoveryRange: [30, 180],
        costRange: ["medium", "high"]
    },
    "Thyroid disorder": {
        symptoms: ["fatigue", "weight changes", "mood swings", "temperature sensitivity", "dry skin", "thinning hair"],
        treatments: ["thyroid hormone replacement", "anti-thyroid medications", "radioactive iodine", "thyroid surgery"],
        recoveryRange: [30, 365],
        costRange: ["low", "medium"]
    },
    "Tonsillectomy": {
        symptoms: ["frequent tonsillitis", "sore throat", "difficulty swallowing", "sleep apnea", "swollen lymph nodes"],
        treatments: ["tonsillectomy", "adenotonsillectomy", "antibiotics", "pain management"],
        recoveryRange: [10, 21],
        costRange: ["medium"]
    },
    "Endometriosis": {
        symptoms: ["pelvic pain", "severe menstrual cramps", "pain with intercourse", "pain with bowel movements", "excessive bleeding", "infertility"],
        treatments: ["hormonal therapies", "pain medication", "laparoscopy", "excision surgery", "hormonal contraceptives"],
        recoveryRange: [30, 180],
        costRange: ["medium", "high"]
    },
    "Skin allergy": {
        symptoms: ["itchy skin", "redness", "rash", "hives", "swelling", "blisters", "dry or scaly skin"],
        treatments: ["antihistamines", "topical corticosteroids", "avoiding triggers", "moisturizers", "allergy shots"],
        recoveryRange: [7, 30],
        costRange: ["low"]
    },
    "Anxiety disorder": {
        symptoms: ["restlessness", "rapid heartbeat", "rapid breathing", "sweating", "trembling", "trouble concentrating"],
        treatments: ["cognitive behavioral therapy", "anti-anxiety medications", "antidepressants", "meditation and mindfulness", "counseling"],
        recoveryRange: [90, 365],
        costRange: ["low", "medium"]
    },
    "Dental implant": {
        symptoms: ["missing tooth", "difficulty chewing", "bone loss in jaw", "speech issues", "gum irritation"],
        treatments: ["dental implant placement", "bone grafting", "crown placement", "abutment placement"],
        recoveryRange: [60, 180],
        costRange: ["medium", "high"]
    },
    "Appendicitis": {
        symptoms: ["sudden pain on the right side of the lower abdomen", "nausea", "vomiting", "loss of appetite", "fever", "constipation or diarrhea"],
        treatments: ["appendectomy", "antibiotics", "pain medication", "IV fluids"],
        recoveryRange: [14, 30],
        costRange: ["high"]
    },
    "Carpal tunnel syndrome": {
        symptoms: ["numbness in fingers", "tingling sensation", "weakness in hand", "pain radiating up the arm", "dropping objects"],
        treatments: ["wrist splinting", "corticosteroid injections", "carpal tunnel release surgery", "NSAIDs", "ergonomic changes"],
        recoveryRange: [30, 120],
        costRange: ["medium"]
    }
};

const hospitalsList = [
    "Global Hospitals", "Kauvery Hospital", "Sri Ramachandra Medical Centre", "Lilavati Hospital",
    "Apollo Hospitals", "Fortis Hospital", "Manipal Hospital", "Max Super Speciality", "Medanta - The Medicity",
    "AIIMS", "Christian Medical College", "Narayana Health", "KIMS Hospitals", "Care Hospitals",
    "Aster CMI", "Columbia Asia", "Sir Ganga Ram Hospital", "Rainbow Children's Hospital", "Sankara Nethralaya",
    "Yashoda Hospitals", "PD Hinduja Hospital", "Bombay Hospital", "Breach Candy Hospital"
];

const citiesList = ["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Coimbatore", "Pune", "Kolkata"];
const outcomesList = ["success", "failure", "ongoing"];
const ageGroupsList = ["child", "teen", "adult", "senior"];

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const records = [];

const outcomeChoice = () => {
    let r = Math.random();
    if (r < 0.7) return "success";
    if (r < 0.85) return "ongoing";
    return "failure";
};

const templates = [
    "I was dealing with INTRO_SYMPTOMS and felt so overwhelmed. Thankfully, I went to HOSPITAL_NAME in CITY_NAME where the staff was incredibly supportive. My condition, CONDITION, was diagnosed promptly. They recommended TREATMENT which I started right away. It's been RECOVERY_DAYS days, and the outcome is currently OUTCOME. I feel so much better and am deeply grateful to the medical team for their care and expertise.",
    "Patient presented with INTRO_SYMPTOMS. Evaluated at HOSPITAL_NAME located in CITY_NAME. Diagnosis confirmed as CONDITION. Underwent TREATMENT. The current status after a period of RECOVERY_DAYS days is OUTCOME. The medical facilities were well-equipped and the approach was highly professional throughout the process.",
    "This journey with CONDITION has been terrifying. The INTRO_SYMPTOMS were unbearable and I didn't know what to do. Arriving at HOSPITAL_NAME in CITY_NAME, I was scared, but the doctors held my hand through the TREATMENT. Now, RECOVERY_DAYS days later, things are OUTCOME. It hasn't been easy, but I'm surviving and want to thank everyone who stood by me.",
    "Dealing with CONDITION has been incredibly frustrating. The INTRO_SYMPTOMS disrupted my entire life. I visited HOSPITAL_NAME in CITY_NAME hoping for a quick fix. They administered TREATMENT, but the process dragged on. It's been RECOVERY_DAYS days now. The result is OUTCOME. Honestly, the lack of clear communication early on was incredibly annoying, though we eventually got there.",
    "My experience with CONDITION started casually with INTRO_SYMPTOMS. I decided to get checked at HOSPITAL_NAME in CITY_NAME. They told me I needed TREATMENT. Following the protocols, it took about RECOVERY_DAYS days of recovery. Currently, the situation is OUTCOME. It was a standard medical experience without much deviation from expectations.",
    "After suffering from INTRO_SYMPTOMS for a while, I finally booked an appointment at HOSPITAL_NAME in CITY_NAME. The doctor confirmed it was CONDITION and suggested TREATMENT. Recovery was tough and took almost RECOVERY_DAYS days. Fortunately, my status is OUTCOME now. Would highly recommend not delaying the doctor visit.",
    "The worst part about CONDITION was definitely the INTRO_SYMPTOMS. I panicked and went straight to HOSPITAL_NAME in CITY_NAME. They assured me I was in good hands and proceeded with TREATMENT. Post-recovery period was estimated at RECOVERY_DAYS days. Currently, everything is OUTCOME. It was an eye-opening healthcare experience."
];

const uniqueTexts = new Set();
let conditionsArray = Object.keys(conditionsMap);

for (let i = 0; i < 500; i++) {
    const condition = rand(conditionsArray);
    const condData = conditionsMap[condition];

    let symptomCount = randInt(2, 4);
    let selectedSymptomsSet = new Set();
    while (selectedSymptomsSet.size < symptomCount) {
        selectedSymptomsSet.add(rand(condData.symptoms));
    }
    const selectedSymptoms = Array.from(selectedSymptomsSet);
    const hospitalName = rand(hospitalsList);
    const city = rand(citiesList);
    const treatment = rand(condData.treatments);
    const outcome = outcomeChoice();
    const recoveryTimeDays = randInt(condData.recoveryRange[0], condData.recoveryRange[1]);
    const costRange = rand(condData.costRange);

    const ageGroup = rand(ageGroupsList);

    let generatedText = "";
    let attempts = 0;
    while (attempts < 50) {
        let template = rand(templates);
        let introSymptoms = selectedSymptoms.join(" and ");
        if (selectedSymptoms.length > 2) {
            introSymptoms = selectedSymptoms.slice(0, -1).join(", ") + ", and " + selectedSymptoms[selectedSymptoms.length - 1];
        }

        let rawText = template
            .replace("INTRO_SYMPTOMS", introSymptoms)
            .replace(/HOSPITAL_NAME/g, hospitalName)
            .replace(/CITY_NAME/g, city)
            .replace(/CONDITION/g, condition)
            .replace(/TREATMENT/g, treatment)
            .replace(/RECOVERY_DAYS/g, recoveryTimeDays)
            .replace(/OUTCOME/g, outcome);

        const trailing = [
            " I highly recommend getting a second opinion always.",
            " Every patient's journey is different.",
            " Rest and patience were key factors.",
            " Family support made a huge difference.",
            " The cost was manageable.",
            " I wish I had known about this earlier.",
            " Never ignore your symptoms.",
            " Taking it one day at a time.",
            " Follow-up visits are crucial.",
            "", "", "", ""
        ];

        const filler = rand(trailing) +
            (Math.random() > 0.5 ? " " + rand(trailing) : "");

        const candidateText = rawText + filler.trimEnd();

        if (!uniqueTexts.has(candidateText)) {
            generatedText = candidateText.trim();
            uniqueTexts.add(candidateText);
            break;
        }
        attempts++;
    }

    if (!generatedText) {
        generatedText = `Experience ${i} with ${condition} at ${hospitalName} involving ${treatment}.`;
    }

    const startD = new Date();
    startD.setMonth(startD.getMonth() - 18);
    const endD = new Date();
    const createdAt = randomDate(startD, endD).toISOString();

    records.push({
        condition,
        symptoms: selectedSymptoms,
        hospitalName,
        city,
        treatment,
        outcome,
        recoveryTimeDays,
        costRange,
        patientAgeGroup: ageGroup,
        experienceText: generatedText,
        createdAt,
        embeddingGenerated: false
    });
}

fs.writeFileSync('synthetic_experiences.json', JSON.stringify(records, null, 2));

const summary = {
    totalRecords: records.length,
    conditionsCount: new Set(records.map(r => r.condition)).size,
    hospitalsCount: new Set(records.map(r => r.hospitalName)).size,
    outcomeDistribution: {
        success: records.filter(r => r.outcome === 'success').length,
        ongoing: records.filter(r => r.outcome === 'ongoing').length,
        failure: records.filter(r => r.outcome === 'failure').length,
    },
    cityDistribution: {},
    duplicateExperienceTextCheck: uniqueTexts.size !== 500 ? "Failed" : "Passed"
};

records.forEach(r => {
    summary.cityDistribution[r.city] = (summary.cityDistribution[r.city] || 0) + 1;
});

fs.writeFileSync('summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
