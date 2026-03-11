import mongoose, { Schema, Document, Model, models } from 'mongoose';

export interface ITask {
  id: string;
  title: string;
  completed: boolean;
}

export interface IGoal {
  id: string;
  title: string;
  estimation?: number;
}

export interface ISphere extends Document {
  id: string;
  userId: string;
  name: string;
  rating: number;
  goals: IGoal[];
  tasks: ITask[];
}

const TaskSchema = new Schema<ITask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const GoalSchema = new Schema<IGoal>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    estimation: { type: Number, default: null },
  },
  { _id: false },
);

const SphereSchema = new Schema<ISphere>(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, default: 5 },
    goals: { type: [GoalSchema], default: [] },
    tasks: { type: [TaskSchema], default: [] },
  },
  { timestamps: true },
);

SphereSchema.index({ id: 1, userId: 1 }, { unique: true });

const Sphere: Model<ISphere> = (models.Sphere as Model<ISphere>) || mongoose.model<ISphere>('Sphere', SphereSchema);

export default Sphere;

