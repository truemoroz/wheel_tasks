import { LifeSphereGroup } from '@/app/types/todo';
export const initialSpheres: LifeSphereGroup[] = [
  {
    id: '1',
    name: 'Health & Fitness',
    rating: 6,
    goals: [
      { id: 'g1-1', title: 'Reach healthy BMI' },
      { id: 'g1-2', title: 'Run 5K without stopping' },
    ],
    tasks: [
      { id: 't1-1', title: 'Exercise 3 times a week', completed: false, subtasks: [] },
      { id: 't1-2', title: 'Drink 2L of water daily', completed: true, subtasks: [] },
      { id: 't1-3', title: 'Sleep 7-8 hours every night', completed: false, subtasks: [] },
    ],
  },
  {
    id: '2',
    name: 'Career & Work',
    rating: 7,
    goals: [
      { id: 'g2-1', title: 'Get promoted to senior role' },
      { id: 'g2-2', title: 'Build a professional portfolio' },
    ],
    tasks: [
      { id: 't2-1', title: 'Update resume', completed: false, subtasks: [] },
      { id: 't2-2', title: 'Complete online course', completed: false, subtasks: [] },
      { id: 't2-3', title: 'Network with 3 new people this month', completed: false, subtasks: [] },
    ],
  },
  {
    id: '3',
    name: 'Finance',
    rating: 5,
    goals: [
      { id: 'g3-1', title: 'Build 6-month emergency fund' },
      { id: 'g3-2', title: 'Start investing regularly' },
    ],
    tasks: [
      { id: 't3-1', title: 'Create a monthly budget', completed: true, subtasks: [] },
      { id: 't3-2', title: 'Track all expenses for a month', completed: false, subtasks: [] },
      { id: 't3-3', title: 'Open an investment account', completed: false, subtasks: [] },
    ],
  },
  {
    id: '4',
    name: 'Relationships & Family',
    rating: 8,
    goals: [
      { id: 'g4-1', title: 'Spend quality time with family weekly' },
      { id: 'g4-2', title: 'Strengthen friendships' },
    ],
    tasks: [
      { id: 't4-1', title: 'Call parents every week', completed: true, subtasks: [] },
      { id: 't4-2', title: 'Plan a weekend outing with friends', completed: false, subtasks: [] },
      { id: 't4-3', title: 'Write a heartfelt letter to a loved one', completed: false, subtasks: [] },
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
      { id: 't5-1', title: 'Read for 30 minutes daily', completed: false, subtasks: [] },
      { id: 't5-2', title: 'Meditate 10 minutes every morning', completed: false, subtasks: [] },
      { id: 't5-3', title: 'Write in journal before bed', completed: false, subtasks: [] },
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
      { id: 't6-1', title: 'Practice guitar 20 min daily', completed: false, subtasks: [] },
      { id: 't6-2', title: 'Plan next trip destination', completed: false, subtasks: [] },
      { id: 't6-3', title: 'Try one new hobby this month', completed: false, subtasks: [] },
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
      { id: 't7-1', title: 'Deep clean the apartment', completed: false, subtasks: [] },
      { id: 't7-2', title: 'Organize the desk area', completed: true, subtasks: [] },
      { id: 't7-3', title: 'Fix broken shelf', completed: false, subtasks: [] },
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
      { id: 't8-1', title: 'Write 3 things I am grateful for each day', completed: false, subtasks: [] },
      { id: 't8-2', title: 'Volunteer once a month', completed: false, subtasks: [] },
      { id: 't8-3', title: 'Spend time in nature weekly', completed: false, subtasks: [] },
    ],
  },
];
