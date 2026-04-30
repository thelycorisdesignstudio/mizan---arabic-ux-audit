import mongoose, { Schema, Document } from "mongoose";

export interface ICertification extends Document {
  auditId: string;
  productName: string;
  productUrl: string;
  companyName: string;
  tier: "silver" | "gold" | "platinum";
  score: number;
  issuedAt: Date;
  expiresAt: Date;
  verificationId: string;
  status: "active" | "expired" | "revoked";
  market: string;
}

const CertificationSchema = new Schema<ICertification>({
  auditId: { type: String, required: true },
  productName: { type: String, required: true },
  productUrl: { type: String, required: true },
  companyName: { type: String, required: true },
  tier: { type: String, enum: ["silver", "gold", "platinum"], required: true },
  score: { type: Number, required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  verificationId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["active", "expired", "revoked"], default: "active" },
  market: { type: String, required: true },
});

export const Certification = mongoose.model<ICertification>("Certification", CertificationSchema);
