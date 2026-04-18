export interface AddressRequest {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}
export interface AddressResponse extends AddressRequest {
    id: number;
}