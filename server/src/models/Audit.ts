import mongoose, { Schema, Document } from "mongoose";

export interface IAudit extends Document {
  url: string;
  timestamp: Date;
  results: Record<string, any>;
}

const AuditSchema = new Schema<IAudit>({
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  results: { type: Schema.Types.Mixed, required: true },
});

export const Audit = mongoose.model<IAudit>("Audit", AuditSchema);
