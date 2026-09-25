import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function makeAdmin() {
  const target = process.argv[2];

  if (!target) {
    console.log('\n❌ Missing username or email.');
    console.log('Usage: node scripts/makeAdmin.js <username_or_email>');
    console.log('Example: node scripts/makeAdmin.js scholar123\n');
    process.exit(1);
  }

  try {
    let uri = process.env.MONGODB_URI;
    const uriFile = path.resolve(__dirname, '../.active_mongo_uri');
    if (fs.existsSync(uriFile)) {
      const activeUri = fs.readFileSync(uriFile, 'utf-8').trim();
      if (activeUri) uri = activeUri;
    }

    if (uri) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    } else {
      await connectDB();
    }

    const user = await User.findOne({
      $or: [
        { username: target },
        { email: target.toLowerCase() },
      ],
    });

    if (!user) {
      console.log(`\n❌ User "${target}" not found.`);
      const existing = await User.find({}, 'username email isAdmin role').limit(10);
      if (existing.length > 0) {
        console.log('\nRegistered users in database:');
        existing.forEach((u) => {
          console.log(`- ${u.username} (${u.email}) [Admin: ${u.isAdmin || u.role === 'admin'}]`);
        });
      } else {
        console.log('No users currently exist in database.');
      }
      console.log('');
      process.exit(1);
    }

    user.isAdmin = true;
    user.role = 'admin';
    await user.save();

    console.log('\n🎉 =====================================');
    console.log(`🐝 Successfully promoted "${user.username}" to StudyHive Admin!`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🛡️ isAdmin: true | role: admin`);
    console.log('=====================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error promoting user to admin:', err.message);
    process.exit(1);
  }
}

makeAdmin();
