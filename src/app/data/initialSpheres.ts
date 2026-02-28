import { LifeSphereGroup } from '@/app/types/todo';
export const initialSpheres: LifeSphereGroup[] = [
  {
    id: '1',
    name: 'Health',
    rating: 6,
    goals: [
      { id: 'g1-1', title: 'Freedom from cigarettes and weed' },
      { id: 'g1-2', title: 'Yoga practice' },
    ],
    tasks: [
      { id: 't1-1', title: 'Exercise 3 times a week', completed: false },
      { id: 't1-2', title: 'Make checkup, especially liver', completed: true },
      { id: 't1-3', title: 'Heal my knees', completed: false },
    ],
  },
  {
    id: '2',
    name: 'Work & Career',
    rating: 6,
    goals: [
      { id: 'g2-1', title: 'I am a practicing psychologist' },
      { id: 'g2-2', title: 'I am a project manager or a team lead' },
    ],
    tasks: [
      { id: 't2-1', title: 'Write posts', completed: false },
      { id: 't2-2', title: 'Practice English at work', completed: false },
      { id: 't2-3', title: 'Write posts in linkedin', completed: false },
      { id: 't2-4', title: 'Run this project in internet', completed: false },
      { id: 't2-5', title: 'Try to build project for psychologist beginners', completed: false },
    ],
  },
  {
    id: '3',
    name: 'Finance',
    rating: 5,
    goals: [
      { id: 'g3-1', title: 'Build 50k capital' },
      // { id: 'g3-2', title: 'Start investing regularly' },
    ],
    tasks: [
      { id: 't3-1', title: 'Create a monthly budget', completed: true },
      { id: 't3-2', title: 'Track all expenses for a month', completed: false },
      { id: 't3-3', title: 'Open an investment account', completed: false },
    ],
  },
  {
    id: '4',
    name: 'Relationships',
    rating: 7,
    goals: [
      { id: 'g4-1', title: 'I am in a healthy relationship' },
      { id: 'g4-2', title: 'I am a husband of a beautiful wife' },
      { id: 'g4-3', title: 'We have common hobbies' },
    ],
    tasks: [
      { id: 't4-1', title: 'Spend a week with Maria qualitatively', completed: false },
      { id: 't4-2', title: 'Have a good sex', completed: false },
      { id: 't4-3', title: 'Decide what to do next', completed: false },
    ],
  },
  {
    id: '5',
    name: 'Personal Growth',
    rating: 4,
    goals: [
      { id: 'g5-1', title: 'Read 24 books this year' },
      { id: 'g5-2', title: 'Develop a daily journaling habit' },
    ],
    tasks: [
      { id: 't5-1', title: 'Read for 30 minutes daily', completed: false },
      { id: 't5-2', title: 'Meditate 10 minutes every morning', completed: false },
      { id: 't5-3', title: 'Write in journal before bed', completed: false },
    ],
  },
  {
    id: '6',
    name: 'Recreation & Hobbies',
    rating: 3,
    goals: [
      { id: 'g6-1', title: 'Learn to play guitar' },
      { id: 'g6-2', title: 'Travel to 2 new places this year' },
    ],
    tasks: [
      { id: 't6-1', title: 'Practice guitar 20 min daily', completed: false },
      { id: 't6-2', title: 'Plan next trip destination', completed: false },
      { id: 't6-3', title: 'Try one new hobby this month', completed: false },
    ],
  },
  {
    id: '7',
    name: 'Home & Environment',
    rating: 6,
    goals: [
      { id: 'g7-1', title: 'Declutter and organize every room' },
      { id: 'g7-2', title: 'Create a comfortable workspace' },
    ],
    tasks: [
      { id: 't7-1', title: 'Deep clean the apartment', completed: false },
      { id: 't7-2', title: 'Organize the desk area', completed: true },
      { id: 't7-3', title: 'Fix broken shelf', completed: false },
    ],
  },
  {
    id: '8',
    name: 'Spirituality & Purpose',
    rating: 5,
    goals: [
      { id: 'g8-1', title: 'Define personal mission statement' },
      { id: 'g8-2', title: 'Practice gratitude daily' },
    ],
    tasks: [
      { id: 't8-1', title: 'Write 3 things I am grateful for each day', completed: false },
      { id: 't8-2', title: 'Volunteer once a month', completed: false },
      { id: 't8-3', title: 'Spend time in nature weekly', completed: false },
    ],
  },
];
