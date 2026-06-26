export interface Task {
  id: string;
  title: string;
  completed: boolean;
  significance?: number;
  recurring?: boolean;
  linkedTaskIds?: string[];
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
export interface LinkedTaskOption {
  taskId: string;
  title: string;
  completed: boolean;
  sphereId: string;
  sphereName: string;
}
