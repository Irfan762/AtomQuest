const { computeProgress } = require("./progress.service");

/**
 * Enterprise AI Service with Google Gen AI Integration & High-Fidelity Mock Fallback
 */

const SMART_PATTERNS = [
  { keyword: "increase", type: "Specific", score: 20 },
  { keyword: "revenue", type: "Measurable", score: 20 },
  { keyword: "sales", type: "Specific", score: 15 },
  { keyword: "before", type: "Time-bound", score: 20 },
  { keyword: "within", type: "Time-bound", score: 20 },
  { keyword: "by", type: "Measurable", score: 15 },
  { keyword: "reduce", type: "Specific", score: 20 },
  { keyword: "%", type: "Measurable", score: 25 },
];

async function analyzeGoal(title, description) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Perform a detailed SMART goal audit for the following goal:
        Title: "${title}"
        Description: "${description || ''}"
        
        Evaluate the goal based on Specific, Measurable, Achievable, Relevant, and Time-bound criteria.
        Return ONLY a valid JSON object matching the following signature (no markdown code blocks, no backticks, no comments):
        {
          "score": 85,
          "clarity": "High" | "Medium" | "Low",
          "suggestions": ["suggestion 1", "suggestion 2"],
          "improvedTitle": "enhanced title following SMART format",
          "improvedDescription": "enhanced description"
        }`,
      });

      const text = response.text().trim();
      const jsonText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      return JSON.parse(jsonText);
    } catch (err) {
      console.warn("[goalgrid] Gemini SMART analysis failed, using high-fidelity mockup:", err.message);
    }
  }

  // ─── High-Fidelity Mock Fallback ──────────────────────────────────────────
  const text = (title + " " + (description || "")).toLowerCase();
  let score = 30; // base score
  
  SMART_PATTERNS.forEach(p => {
    if (text.includes(p.keyword.toLowerCase())) score += p.score;
  });

  score = Math.min(score, 100);

  const suggestions = [];
  if (!text.includes("%") && !text.includes("revenue") && !text.includes("number")) {
    suggestions.push("Add a quantifiable metric (e.g., %, USD, count) to make it Measurable.");
  }
  if (!text.includes("before") && !text.includes("by") && !text.includes("quarter")) {
    suggestions.push("Include a specific deadline or quarter to make it Time-bound.");
  }
  if (text.split(" ").length < 5) {
    suggestions.push("The goal is too brief. Elaborate on the 'How' to make it more Specific.");
  }

  let improvedTitle = title;
  if (score < 70) {
    improvedTitle = `Optimize ${title} by 15% through strategic execution before Q4`;
  }

  return {
    score,
    clarity: score > 80 ? "High" : score > 50 ? "Medium" : "Low",
    suggestions,
    improvedTitle,
    improvedDescription: `This goal has been enhanced to follow SMART criteria. It now includes specific targets and a clear timeline for completion.`
  };
}

async function generatePerformanceReview(user, goals) {
  if (!goals || goals.length === 0) return { summary: "No performance data available for review.", strengths: [], weaknesses: [], score: 0 };

  const totalProgress = goals.reduce((s, g) => s + computeProgress(g), 0) / goals.length;
  const completed = goals.filter(g => g.status === "Completed").length;
  const atRisk = goals.filter(g => g.status === "At Risk").length;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a constructive performance review for employee ${user.name} (Role: ${user.role}, Dept: ${user.department}) based on the following quarterly goals achievements:
        ${JSON.stringify(goals.map(g => ({ title: g.title, progress: g.progress, status: g.status })), null, 2)}
        
        Evaluate strengths, weaknesses (or improvement areas), overall completion rate, and outline a supportive feedback summary.
        Return ONLY a valid JSON object matching the following signature (no markdown code blocks, no backticks, no comments):
        {
          "summary": "overall performance evaluation summary",
          "strengths": ["strength 1", "strength 2"],
          "weaknesses": ["weakness 1", "weakness 2"],
          "score": 85
        }`,
      });

      const text = response.text().trim();
      const jsonText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      return JSON.parse(jsonText);
    } catch (err) {
      console.warn("[goalgrid] Gemini Performance Review failed, using high-fidelity mockup:", err.message);
    }
  }

  // ─── High-Fidelity Mock Fallback ──────────────────────────────────────────
  let summary = "";
  if (totalProgress > 80) {
    summary = `${user.name} is a top performer who consistently exceeds expectations. With ${completed} goals completed, they demonstrate exceptional execution capability.`;
  } else if (totalProgress > 50) {
    summary = `${user.name} shows steady progress across most objectives. While performance is consistent, there is room to accelerate ${atRisk > 0 ? "at-risk items" : "deliverables"} in the coming quarter.`;
  } else {
    summary = `${user.name}'s performance is currently below target. Immediate intervention and re-alignment of goals are recommended to ensure year-end success.`;
  }

  const strengths = [];
  if (completed > 0) strengths.push("Goal completion velocity");
  if (totalProgress > 70) strengths.push("Consistency in tracking");
  
  const weaknesses = [];
  if (atRisk > 0) weaknesses.push("Handling complex multi-quarter tasks");
  if (totalProgress < 60) weaknesses.push("KPI achievement rate");

  return {
    summary,
    strengths: strengths.length ? strengths : ["General operations"],
    weaknesses: weaknesses.length ? weaknesses : ["No significant weaknesses"],
    score: Math.round(totalProgress)
  };
}

async function getGoalRecommendations(department, thrustArea) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `List 3 professional, measurable goal recommendations (KPIs) for an employee working in the "${department}" department, with focus on the thrust area "${thrustArea || 'Core Execution'}".
        Return ONLY a valid JSON array of strings. Example: ["KPI 1", "KPI 2", "KPI 3"]. No markdown fences, no explanatory text.`,
      });

      const text = response.text().trim();
      const jsonText = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      console.warn("[goalgrid] Gemini Goal Recommendations failed, using mockup:", err.message);
    }
  }

  // ─── High-Fidelity Mock Fallback ──────────────────────────────────────────
  const recommendations = {
    "Sales": [
      "Increase quarterly revenue by 20% through new client acquisition.",
      "Achieve 85% customer retention rate by implementing a loyalty program.",
      "Expand market share in the Enterprise segment by 5% within Q4."
    ],
    "Engineering": [
      "Reduce system downtime to 0.01% by implementing high-availability clusters.",
      "Complete the migration to microservices architecture for the core engine.",
      "Improve sprint velocity by 15% through automated testing integration."
    ],
    "HR": [
      "Reduce employee turnover rate by 10% through improved engagement initiatives.",
      "Complete the leadership training program for 100% of mid-level managers.",
      "Hire 15 new senior engineers before the end of Q3."
    ],
    "Marketing": [
      "Increase website traffic by 40% through SEO and content marketing.",
      "Achieve a ROAS of 4.5x across all digital advertising channels.",
      "Launch 3 major brand awareness campaigns in the target region."
    ]
  };

  return recommendations[department] || [
    `Improve ${thrustArea || 'departmental'} efficiency by 10%`,
    `Successfully deliver the ${thrustArea || 'primary'} project by Q4`,
    `Enhance team collaboration and output quality by 15%`
  ];
}

module.exports = {
  analyzeGoal,
  generatePerformanceReview,
  getGoalRecommendations
};
