export interface CategoryRequest {
  name: string;
  image?: string;
}

export interface CategoryResponse extends CategoryRequest{
  id: number;
}