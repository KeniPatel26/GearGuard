import mongoose from "mongoose";

const maintenanceTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    description: {
      type: String,
    },

    teamManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Technicians
      },
    ],

    defaultTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("MaintenanceTeam", maintenanceTeamSchema);
