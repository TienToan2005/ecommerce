export interface VoucherRequest {
    code: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: string;
    minOrderValue: string;
    maxDiscount: string;
    expiryDate: Date;
    usageLimit: number;
}
export interface VoucherResponse extends VoucherRequest {
    id: number;
    calculatedDiscount: string;
}