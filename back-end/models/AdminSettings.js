const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSettingsSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, unique: true },
    notifications: {
      all: { type: Boolean, default: false },
      emergencyAlerts: { type: Boolean, default: false },
      userReports: { type: Boolean, default: false },
      newPosts: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminSettings', AdminSettingsSchema);
