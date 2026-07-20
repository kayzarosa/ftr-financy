export interface Category {
  id: string;
  name: string;
  color: string;
  description: string | null;
  icon: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithUsageCount extends Category {
  transactionsCount: number;
}
