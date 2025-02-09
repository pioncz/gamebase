import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
  email: { type: String, unique: true, required: true },
  login: { type: String, required: true },
  hash: { type: String, required: true },
  role: { type: String, default: 'PLAYER' },
  diceType: { type: String },
  avatar: { type: String },
  createdDate: { type: Date, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

export default mongoose.model('Player', schema);
