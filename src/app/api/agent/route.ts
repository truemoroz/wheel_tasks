import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { getHydratedSpheres, getHydratedSphere } from '@/lib/taskHelpers';
import Task from '@/lib/models/Task';
import Sphere from '@/lib/models/Sphere';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const userId = session.user.id;
  await connectToDatabase();

  // Build system prompt with user's current data so the model knows what exists
  const spheres = await getHydratedSpheres(userId);
  const spheresSummary = spheres
    .map((s) => {
      const goals = s.goals.length
        ? s.goals.map((g: { title: string }) => `    - [goal] ${g.title}`).join('\n')
        : '    (no goals yet)';
      const tasks = s.tasks.length
        ? s.tasks.map((t: { title: string; completed: boolean }) =>
            `    - [task] ${t.title} (${t.completed ? 'done' : 'todo'})`,
          ).join('\n')
        : '    (no tasks yet)';
      return `• "${s.name}" — rating ${s.rating}/10  (id: ${s.id})\n${goals}\n${tasks}`;
    })
    .join('\n\n');

  const systemPrompt = `You are a personal productivity assistant embedded in the user's Wheel of Life app.
You have full read access to the user's life spheres, goals, and tasks listed below.

Your capabilities:
- Analyse the user's current tasks, goals, and sphere ratings to give meaningful insights.
- Recommend specific new tasks or goals based on patterns you observe (low ratings, empty spheres, gaps in coverage, recurring themes).
- Create tasks or goals immediately when the user confirms or directly asks you to.
- Answer questions about the user's progress, balance, and priorities.

Rules:
- When asked to analyse or recommend, actually do it — use the data below to give concrete, personalised suggestions.
- When recommending multiple tasks at once, list them clearly and ask "Shall I add all of these, or pick specific ones?"
- When the user says yes/confirms, call the createTask or createGoal tool right away without asking again.
- Pick the most relevant sphere automatically based on context; only ask if genuinely ambiguous.
- After a successful tool call, briefly confirm what was created (one sentence).
- Never invent sphere IDs — only use the IDs listed below.

User's current data:
${spheresSummary}`;

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google(process.env.GOOGLE_MODEL ?? 'gemini-2.0-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      createTask: {
        description: 'Create a new task inside a life sphere.',
        inputSchema: z.object({
          sphereId: z.string().describe('The id of the sphere (from the system prompt data)'),
          title: z.string().describe('Short, actionable task title'),
        }),
        execute: async ({ sphereId, title }) => {
          const sphere = await Sphere.findOne({ id: sphereId, userId }).lean();
          if (!sphere) return { error: `Sphere "${sphereId}" not found` };
          await Task.create({ sphereId, userId, parentId: null, title, completed: false });
          const updated = await getHydratedSphere(sphereId, userId);
          return { success: true, createdTask: title, sphere: updated?.name };
        },
      },
      createGoal: {
        description: 'Create a new goal inside a life sphere.',
        inputSchema: z.object({
          sphereId: z.string().describe('The id of the sphere (from the system prompt data)'),
          title: z.string().describe('Clear, outcome-oriented goal title'),
        }),
        execute: async ({ sphereId, title }) => {
          const goalId = `g-${Date.now()}`;
          const sphere = await Sphere.findOneAndUpdate(
            { id: sphereId, userId },
            { $push: { goals: { id: goalId, title } } },
            { returnDocument: 'after' },
          ).lean();
          if (!sphere) return { error: `Sphere "${sphereId}" not found` };
          return { success: true, createdGoal: title, sphere: sphere.name };
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}



