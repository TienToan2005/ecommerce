export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse extends CategoryRequest{
  id: number;
}