export interface Task {
  id: string;
  title: string;
  completed: boolean;
  subtasks: Task[];
}
export interface Goal {
  id: string;
  title: string;
  estimation?: number;
}
export interface LifeSphereGroup {
  id: string;
  name: string;
  rating: number;
  goals: Goal[];
  tasks: Task[];
}
