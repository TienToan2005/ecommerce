export interface ReviewRequest {
    content: string;
    rating: number;
    productId: number;
}
export interface ReviewResponse extends ReviewRequest{
    id: number;
    userId: number;
}
export interface UpdateReview {
    content: string;
    rating: number;
}