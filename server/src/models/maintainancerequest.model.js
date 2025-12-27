import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
    },

    request_type: {
      type: String,
      enum: ["Corrective", "Preventive"],
    },

    equipment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },

    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    maintenance_team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceTeam",
    },

    technician_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    scheduled_date: {
      type: Date,
    },

    duration_hours: {
      type: Number,
      min: 0,
    },

    stage: {
      type: String,
      enum: ["New", "In Progress", "Repaired", "Scrap"],
      default: "New",
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
