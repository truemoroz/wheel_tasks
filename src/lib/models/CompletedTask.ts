import mongoose, { Schema, Document, Model, models } from 'mongoose';

export interface ICompletedTask extends Document {
  taskId: string;
  userId: string;
  sphereId: string;
  taskTitle: string;
  significance: number;
  completedAt: Date;
}

const CompletedTaskSchema = new Schema<ICompletedTask>(
  {
    taskId: { type: String, required: true },
    userId: { type: String, required: true },
    sphereId: { type: String, required: true },
    taskTitle: { type: String, required: true },
    significance: { type: Number, required: true },
    completedAt: { type: Date, required: true },
  },
  { timestamps: false },
);

CompletedTaskSchema.index({ userId: 1, completedAt: -1 });
CompletedTaskSchema.index({ taskId: 1, userId: 1 });

const CompletedTask: Model<ICompletedTask> =
  (models.CompletedTask as Model<ICompletedTask>) ||
  mongoose.model<ICompletedTask>('CompletedTask', CompletedTaskSchema);

export default CompletedTask;

