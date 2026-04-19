import Task from '@/lib/models/Task';
import Sphere from '@/lib/models/Sphere';

interface LeanTask {
  _id: { toString(): string };
  sphereId: string;
  userId: string;
  parentId: string | null;
  title: string;
  completed: boolean;
  significance: number;
  recurring: boolean;
}

export interface FrontendTask {
  id: string;
  title: string;
  completed: boolean;
  significance: number;
  recurring: boolean;
  subtasks: FrontendTask[];
}

/** Recursively build a tree from a flat list of tasks. */
function buildTaskTree(tasks: LeanTask[], parentId: string | null = null): FrontendTask[] {
  return tasks
    .filter((t) => t.parentId === parentId)
    .map((t) => ({
      id: t._id.toString(),
      title: t.title,
      completed: t.completed,
      significance: t.significance ?? 5,
      recurring: t.recurring ?? false,
      subtasks: buildTaskTree(tasks, t._id.toString()),
    }));
}

/**
 * Collect the ObjectId string of a root task and all its descendants
 * from a flat task list (used for cascading deletes).
 */
export function collectDescendantIds(
  tasks: { _id: { toString(): string }; parentId: string | null }[],
  rootId: string,
): string[] {
  const ids: string[] = [rootId];
  let frontier = [rootId];
  while (frontier.length) {
    const children = tasks
      .filter((t) => t.parentId !== null && frontier.includes(t.parentId))
      .map((t) => t._id.toString());
    ids.push(...children);
    frontier = children;
  }
  return ids;
}

/** Fetch a single sphere by its _id, hydrated with the task tree. */
export async function getHydratedSphere(sphereId: string, userId: string) {
  const sphere = await Sphere.findOne({ _id: sphereId, userId }).lean();
  if (!sphere) return null;
  const idStr = sphere._id.toString();
  const allTasks = await Task.find({ sphereId: idStr, userId }).lean();
  return { ...sphere, id: idStr, tasks: buildTaskTree(allTasks as unknown as LeanTask[]) };
}

/** Fetch all spheres for a user, each hydrated with the task tree. */
export async function getHydratedSpheres(userId: string) {
  const spheres = await Sphere.find({ userId }).lean();
  if (spheres.length === 0) return [];
  const sphereIds = spheres.map((s) => s._id.toString());
  const allTasks = await Task.find({ userId, sphereId: { $in: sphereIds } }).lean();

  const tasksBySphere: Record<string, LeanTask[]> = {};
  for (const task of allTasks) {
    const lean = task as unknown as LeanTask;
    if (!tasksBySphere[lean.sphereId]) tasksBySphere[lean.sphereId] = [];
    tasksBySphere[lean.sphereId].push(lean);
  }

  return spheres.map((s) => {
    const idStr = s._id.toString();
    return { ...s, id: idStr, tasks: buildTaskTree(tasksBySphere[idStr] ?? []) };
  });
}
