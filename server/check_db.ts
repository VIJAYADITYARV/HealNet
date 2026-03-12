import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MessageSchema = new mongoose.Schema({
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
    content: String,
    isRead: Boolean,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String,
    username: String,
});

const Message = mongoose.model('Message', MessageSchema);
const User = mongoose.model('User', UserSchema);

async function checkMessages() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healnet');
        console.log('Connected to DB');

        const messages = await Message.find().sort({ createdAt: -1 }).limit(10);
        console.log('--- Latest 10 Messages ---');
        for (const m of messages) {
            const sender = await User.findById(m.senderId);
            const receiver = await User.findById(m.receiverId);
            console.log(`[${m.createdAt.toISOString()}] From: ${sender?.name} (${m.senderId}) To: ${receiver?.name} (${m.receiverId}) Content: ${m.content}`);
        }

        const users = await User.find({ name: /guru/i });
        console.log('\n--- Guru Users ---');
        users.forEach(u => console.log(`${u.name} - ${u._id}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMessages();
