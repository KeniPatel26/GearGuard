import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    serial_number: {
      type: String,
      unique: true,
      trim: true,
    },

    equipmentCategory: {
      type: String,
    },

    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // employee / owner
    },

    maintenance_team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceTeam",
    },

    purchase_date: {
      type: Date,
    },

    warranty_end: {
      type: Date,
    },

    location: {
      type: String,
      trim: true,
    },

    is_scrapped: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Equipment", equipmentSchema);
