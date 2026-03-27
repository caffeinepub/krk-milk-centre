import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Type {
    name: string;
    canSelfView: boolean;
    producerNumber: string;
    phone: string;
}
export type ProducerId = bigint;
export interface Type__1 {
    producerId: ProducerId;
    date: string;
    amount: number;
    reason: string;
}
export type LoanId = bigint;
export interface UserProfile {
    name: string;
}
export interface Type__2 {
    producerId: ProducerId;
    date: string;
    ratePerLitre: number;
    session: string;
    fatPercent: number;
    amount: number;
    litres: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProducer(name: string, phone: string, producerNumber: string): Promise<ProducerId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyHistory(phone: string): Promise<{
        advances: Array<Type__1>;
        producer: Type;
        milkEntries: Array<Type__2>;
    }>;
    getProducerById(producerId: ProducerId): Promise<Type | null>;
    getProducerByPhone(phone: string): Promise<Type | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordAdvance(producerId: ProducerId, date: string, amount: number, reason: string): Promise<bigint>;
    recordLoan(producerId: ProducerId, date: string, amount: number, purpose: string): Promise<LoanId>;
    recordMilkEntry(producerId: ProducerId, date: string, session: string, litres: number, fatPercent: number, ratePerLitre: number): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSelfViewPermission(producerId: ProducerId, canSelfView: boolean): Promise<void>;
}
