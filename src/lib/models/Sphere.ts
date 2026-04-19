import mongoose, { Schema, Document, Model, models, Types } from 'mongoose';

export interface IGoal {
  id: string;
  title: string;
  estimation?: number;
}

export interface ISphere extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  rating: number;
  goals: IGoal[];
}

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
    userId: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, default: 5 },
    goals: { type: [GoalSchema], default: [] },
  },
  { timestamps: true },
);

SphereSchema.index({ userId: 1 });

const Sphere: Model<ISphere> = (models.Sphere as Model<ISphere>) || mongoose.model<ISphere>('Sphere', SphereSchema);

export default Sphere;
