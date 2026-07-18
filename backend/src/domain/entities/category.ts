export interface Category {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  icon: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithUsageCount extends Category {
  transactionsCount: number;
}
