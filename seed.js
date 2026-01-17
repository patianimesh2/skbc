require('dotenv').config();
const mongoose = require('mongoose');
const faker = require('faker');
const User = require('./models/user');
const Admin = require('./models/admin');

const MONGO = process.env.MONGO_URI ;
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> seed())
  .catch(err=> console.error(err));

async function seed(){
  console.log('Seeding DB...');
  await User.deleteMany({});
  await Admin.deleteMany({});

  // create admin
  await Admin.create({ username: 'admin', password: 'admin123' });

  // create 50 students randomly assigned to 100 rooms
  const students = [];
  for (let i=1;i<=50;i++){
    const room = Math.floor(Math.random()*100)+1;
    const movedIn = new Date(2023, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1);
    const expiry = new Date(2026, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1);
    const s = {
      fullName: faker.name.findName(),
      email: `student${i}@skbc.edu`,
      mobile: `9000000${(100+i)}`,
      password: 'pass123',
      dept: faker.commerce.department(),
      roomNo: room,
      roommate: '',
      address: faker.address.streetAddress(),
      movedIn,
      expiry,
      mealRecords: []
    };
    // create some meal records for current month
    const now = new Date();
    for (let d=1; d<=10; d++){
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      s.mealRecords.push({ date, mealType: 'morning', on: Math.random()>0.2 });
      s.mealRecords.push({ date, mealType: 'night', on: Math.random()>0.3 });
    }
    students.push(s);
  }
  await User.insertMany(students);
  console.log('Seed complete. Admin credentials: username=admin password=admin123');
  process.exit(0);
}
