export interface AddressRequest {
    street: string;
    city: string;
    ward: string;
    district: string;
}
export interface AddressResponse extends AddressRequest {
    id: number;
    isDefault?: boolean;
    userId?: number;
    receiverName?:string;
    receiverPhone:string;
}