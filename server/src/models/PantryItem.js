// MongoDB model for pantry inventory items linked to a specific user.
import mongoose from 'mongoose';

const pantryItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'item' },
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('PantryItem', pantryItemSchema);
