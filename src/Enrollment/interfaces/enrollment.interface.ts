export interface Enrollment {
  id?: string;
  user: string;
  course: string;
  payment?: string;
  offer?: string;
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  completionDate?: Date;
  certificate?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
