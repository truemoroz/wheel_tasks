import mongoose, { Schema, Document, Model, models, Types } from 'mongoose';

export interface ITask extends Document {
  _id: Types.ObjectId;
  sphereId: string;
  userId: string;
  /** null = top-level task; otherwise the string ObjectId of the parent task */
  parentId: string | null;
  title: string;
  completed: boolean;
  significance: number;
  recurring: boolean;
}

const TaskSchema = new Schema<ITask>(
  {
    sphereId: { type: String, required: true },
    userId: { type: String, required: true },
    parentId: { type: String, default: null },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    significance: { type: Number, default: 5, min: 1, max: 10 },
    recurring: { type: Boolean, default: false },
  },
  { timestamps: true },
);

TaskSchema.index({ sphereId: 1, userId: 1 });
TaskSchema.index({ parentId: 1 });

const Task: Model<ITask> = (models.Task as Model<ITask>) || mongoose.model<ITask>('Task', TaskSchema);

export default Task;

