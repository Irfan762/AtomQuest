const Goal = require("../models/Goal");

async function syncSharedAchievement(sourceGoal) {
  if (!sourceGoal?.shared_goal_id) return { synced: 0 };
  const siblings = await Goal.find({
    shared_goal_id: sourceGoal.shared_goal_id,
    id: { $ne: sourceGoal.id },
  });
  let synced = 0;
  for (const sib of siblings) {
    const merged = [...(sib.quarterly_updates || [])];
    for (const q of sourceGoal.quarterly_updates || []) {
      const idx = merged.findIndex((m) => m.quarter === q.quarter);
      const next = {
        quarter: q.quarter,
        planned: q.planned,
        achieved: q.achieved,
        status: q.status,
        comments: idx >= 0 ? merged[idx].comments : q.comments,
        manager_comments: idx >= 0 ? merged[idx].manager_comments : q.manager_comments,
        updated_at: new Date(),
      };
      if (idx >= 0) merged[idx] = next;
      else merged.push(next);
    }
    sib.quarterly_updates = merged;
    sib.status = sourceGoal.status;
    await sib.save();
    synced += 1;
  }
  return { synced };
}

module.exports = { syncSharedAchievement };
