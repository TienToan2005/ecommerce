export interface ReviewRequest {
    content: string;
    rating: number;
    productId: number;
}
export interface ReviewResponse extends ReviewRequest{
    id: number;
    username: number;
    createdAt: string;
}
export interface UpdateReview {
    content: string;
    rating: number;
}