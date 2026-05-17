const Goal = require("../models/Goal");
const User = require("../models/User");
const Conflict = require("../models/Conflict");
const { GoogleGenAI } = require("@google/genai"); // Standard Google Gen AI SDK

// Hardcoded semantic conflict rules for high-fidelity fallback
const SEMANTIC_CONFLICTS = [
  {
    k1: ["headcount", "layoff", "reduce staff", "cut workforce", "personnel cost"],
    k2: ["hire", "recruit", "onboard", "expand engineering", "talent acquisition"],
    type: "Headcount & Recruitment Incongruency",
    severity: "high",
    explanation: "Finance/HR is aiming to reduce headcounts or cut personnel costs, whereas Engineering/Product is concurrently attempting to hire, recruit, and scale the team. This creates a severe resource allocation conflict."
  },
  {
    k1: ["infrastructure cost", "reduce budget", "cut spend", "cost savings", "hosting bill"],
    k2: ["launch features", "scale architecture", "expand capacity", "product release"],
    type: "Financial Constraints vs Product Scaling",
    severity: "medium",
    explanation: "Operations/Finance is working to aggressively cut infrastructure and hosting expenses, which directly contradicts the Product/Engineering goal of launching high-compute new features and scaling architecture capacity."
  },
  {
    k1: ["support tickets", "reduce workload", "ops efficiency", "minimize tickets"],
    k2: ["onboard clients", "sales acquisition", "aggressive growth", "customer signups"],
    type: "Support Load vs Aggressive Customer Acquisition",
    severity: "medium",
    explanation: "Operations is trying to decrease customer support ticket volumes and lighten workload, while Sales is simultaneously focused on rapid customer signups and scaling client onboarding, which inevitably drives higher support tickets."
  },
  {
    k1: ["downtime", "system stability", "zero incidents", "freeze code"],
    k2: ["deploy rapid", "continuous deployment", "faster releases", "speed to market"],
    type: "Stability vs Velocity Contradiction",
    severity: "high",
    explanation: "Engineering stability KPIs demand freezing code and maintaining absolute system stability, while product velocity goals push for rapid continuous deployment and faster releases, increasing regression risk."
  }
];

async function runConflictDetectorInternal() {
  const activeGoals = await Goal.find({ approval_status: "approved" }).lean();
  const users = await User.find({ is_deleted: false }).select("id name role department").lean();
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const detectedConflicts = [];

  // Check if we can use Google Gen AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const goalsList = activeGoals.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description || "",
        department: userMap[g.employee_id]?.department || "Unassigned",
        owner: userMap[g.employee_id]?.name || "Unknown"
      }));

      if (goalsList.length > 1) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Analyze the following organizational goals and detect any conflicts, contradictions, resource competitions, or operational mismatches between them (especially across different departments).
          
          Goals:
          ${JSON.stringify(goalsList, null, 2)}
          
          Return ONLY a valid JSON array of conflict objects. Do not include any markdown fences or explanatory text.
          Format:
          [
            {
              "goal1_id": "string",
              "goal2_id": "string",
              "conflict_type": "string",
              "severity": "low" | "medium" | "high",
              "explanation": "string"
            }
          ]
          If no conflicts are found, return an empty array []`,
        });

        const text = response.text().trim();
        // Remove markdown formatting if the model returned it
        const jsonText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(jsonText);

        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const g1 = activeGoals.find(g => g.id === item.goal1_id);
            const g2 = activeGoals.find(g => g.id === item.goal2_id);
            if (g1 && g2) {
              detectedConflicts.push({
                goal1_id: g1.id,
                goal2_id: g2.id,
                goal1_title: g1.title,
                goal2_title: g2.title,
                conflict_type: item.conflict_type || "Resource Mismatch",
                severity: item.severity || "medium",
                explanation: item.explanation
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("[goalgrid] Gemini Conflict Detection error, falling back to keyword matcher:", e.message);
    }
  }

  // Fallback Rule-Based Keyword Matcher (always runs to augment or serve as primary when API key is missing)
  if (detectedConflicts.length === 0) {
    for (let i = 0; i < activeGoals.length; i++) {
      for (let j = i + 1; j < activeGoals.length; j++) {
        const g1 = activeGoals[i];
        const g2 = activeGoals[j];

        // Ensure different departments or owners to make it a cross-goal conflict
        const d1 = userMap[g1.employee_id]?.department || "Unassigned";
        const d2 = userMap[g2.employee_id]?.department || "Unassigned";
        if (d1 === d2 && g1.employee_id === g2.employee_id) continue;

        const text1 = (g1.title + " " + (g1.description || "")).toLowerCase();
        const text2 = (g2.title + " " + (g2.description || "")).toLowerCase();

        for (const rule of SEMANTIC_CONFLICTS) {
          const match1 = rule.k1.some(k => text1.includes(k)) && rule.k2.some(k => text2.includes(k));
          const match2 = rule.k2.some(k => text1.includes(k)) && rule.k1.some(k => text2.includes(k));

          if (match1 || match2) {
            detectedConflicts.push({
              goal1_id: g1.id,
              goal2_id: g2.id,
              goal1_title: g1.title,
              goal2_title: g2.title,
              conflict_type: rule.type,
              severity: rule.severity,
              explanation: rule.explanation
            });
          }
        }
      }
    }
  }

  // Save detected conflicts in the database (avoid duplicates)
  for (const c of detectedConflicts) {
    const existing = await Conflict.findOne({
      $or: [
        { goal1_id: c.goal1_id, goal2_id: c.goal2_id },
        { goal1_id: c.goal2_id, goal2_id: c.goal1_id }
      ]
    });
    if (!existing) {
      await Conflict.create(c);
    }
  }

  return detectedConflicts;
}

module.exports = {
  runConflictDetectorInternal
};
