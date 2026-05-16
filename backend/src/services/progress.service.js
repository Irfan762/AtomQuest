function computeProgress(goal) {
  const qups = goal.quarterly_updates || [];
  const target = Number(goal.target || 0);
  const direction = goal.progress_direction || "max";

  if (qups.length === 0) return 0;

  const sumAchieved = qups.reduce((s, q) => s + Number(q.achieved || 0), 0);

  if (direction === "zero") {
    return sumAchieved === 0 ? 100 : 0;
  }

  if (direction === "min") {
    if (sumAchieved === 0) return 0;
    return Math.min(100, Math.round((target / sumAchieved) * 10000) / 100);
  }

  if (direction === "timeline") {
    const weights = { Completed: 1, "On Track": 0.75, "At Risk": 0.4, "Not Started": 0 };
    const totalQuarters = 4;
    const score = qups.reduce(
      (s, q) => s + (weights[q.status] ?? 0) * (100 / totalQuarters),
      0
    );
    return Math.round(score * 100) / 100;
  }

  // max (default)
  if (target === 0) return 0;
  return Math.min(100, Math.round((sumAchieved / target) * 10000) / 100);
}

function serializeGoal(goalDoc) {
  const g = goalDoc.toObject ? goalDoc.toObject() : { ...goalDoc };
  delete g._id;
  g.progress = computeProgress(g);
  return g;
}

module.exports = { computeProgress, serializeGoal };
