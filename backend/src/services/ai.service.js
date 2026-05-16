const { computeProgress } = require("./progress.service");

/**
 * Intelligent Mock AI Service
 * Simulates high-level NLP logic for enterprise performance management.
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
  if (!goals || goals.length === 0) return "No performance data available for review.";

  const totalProgress = goals.reduce((s, g) => s + computeProgress(g), 0) / goals.length;
  const completed = goals.filter(g => g.status === "Completed").length;
  const atRisk = goals.filter(g => g.status === "At Risk").length;

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
