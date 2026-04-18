export interface ApiResponse<T> {
  data: T;    
  success?: boolean;
}

export interface Page<T> {
  content: T[];
  pageable: string;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}