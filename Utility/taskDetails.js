import store from "./store";

// helper: are two timestamps the same calendar day (local time)
function isSameDay(ts1, ts2) {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// safe increment helper (prevents negative counters)
function safeInc(obj, key, delta = 1) {
  obj[key] = (obj[key] || 0) + delta;
  if (obj[key] < 0) obj[key] = 0;
}

// Upsert a task (add new or update existing). 
// `task` should have at least { id } and optionally { name, count, timestamp, result }
function upsertTask(task) {
  if (!task || !task.id) throw new Error('task.id is required');

  const now = Date.now();
  const td = store.get('taskDetails') || {};

  // ensure defaults
  td.tasks = Array.isArray(td.tasks) ? td.tasks : [];
  td.missionsToday = typeof td.missionsToday === 'number' ? td.missionsToday : 0;
  td.timestamp = typeof td.timestamp === 'number' ? td.timestamp : 0;
  td.success = typeof td.success === 'number' ? td.success : 0;
  td.failure = typeof td.failure === 'number' ? td.failure : 0;
  td.aborted = typeof td.aborted === 'number' ? td.aborted : 0;

  const idx = td.tasks.findIndex(t => t.id === task.id);

  // valid status keys we track
  const statusKeys = ['success', 'failure', 'aborted'];

  if (idx !== -1) {
    // existing task -> update (merge)
    const old = td.tasks[idx];
    const oldResult = old.result;
    const newResult = (task.result === undefined) ? oldResult : task.result;

    // if the result changed, adjust counters
    if (oldResult !== newResult) {
      if (statusKeys.includes(oldResult)) safeInc(td, oldResult, -1);
      if (statusKeys.includes(newResult)) safeInc(td, newResult, +1);
    }

    // merge other fields but keep a timestamp (prefer provided task.timestamp, fallback to old, fallback to now)
    td.tasks[idx] = {
      ...old,
      ...task,
      timestamp: task.timestamp || old.timestamp || now
    };

  } else {
    // new task -> add
    // Day logic: if stored timestamp is not same day as now, reset missionsToday and update timestamp
    if (!td.timestamp || !isSameDay(td.timestamp, now)) {
      td.missionsToday = 1;
      td.timestamp = now; // mark the day by the first task's time
    } else {
      td.missionsToday = (td.missionsToday || 0) + 1;
    }

    // If the new task has a final result, increment the appropriate counter
    if (statusKeys.includes(task.result)) safeInc(td, task.result, +1);

    td.tasks.push({
      ...task,
      timestamp: task.timestamp || now
    });
  }

  // save back
  store.set('taskDetails', td);
}

// Small convenience helper to update only the result by id
function updateTaskResultById(id, newResult) {
  if (!id) throw new Error('id is required');
  upsertTask({ id, result: newResult, timestamp: Date.now() });
}

