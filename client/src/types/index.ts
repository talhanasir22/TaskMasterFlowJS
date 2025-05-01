export interface TaskCounts {
  all: number;
  active: number;
  completed: number;
  [categoryId: number]: number;
}

export interface TaskSortOption {
  id: string;
  name: string;
}

export interface TaskViewOption {
  id: string;
  name: string;
}
