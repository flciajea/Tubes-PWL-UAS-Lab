const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nrp_nip: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "kepala_lab", "kaprodi", "staf_admin", "staf_lab"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password sebelum simpan
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
 
// Method cek password
userSchema.methods.correctPassword = async function (candidate, hashed) {
  return bcrypt.compare(candidate, hashed);
};
 
module.exports = mongoose.model('User', userSchema);