const express = require('express');
const router = express.Router();
const User = require('../models/user');

// list rooms (1..100)
router.get('/rooms', async (req, res) => {
  // return rooms 1..100 with occupant count
  const rooms = [];
  for (let r=1;r<=100;r++){
    const count = await User.countDocuments({ roomNo: r });
    rooms.push({ roomNo: r, count });
  }
  res.json(rooms);
});

// get students in a room
router.get('/room/:roomNo', async (req, res) => {
  const roomNo = parseInt(req.params.roomNo);
  const students = await User.find({ roomNo });
  const today = new Date();
  today.setHours(0,0,0,0);
  const enriched = students.map(s => {
    const todayRecords = s.mealRecords.filter(r => {
      const d = new Date(r.date);
      d.setHours(0,0,0,0);
      return d.getTime() === today.getTime();
    });
    return {
      ...s.toObject(),
      todayMorning: todayRecords.find(r => r.mealType==='morning')?.on || false,
      todayNight: todayRecords.find(r => r.mealType==='night')?.on || false
    };
  });
  res.json(enriched);
});

// get monthly summary for a room
router.get('/room/:roomNo/month/:year/:month', async (req, res) => {
  const roomNo = parseInt(req.params.roomNo);
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  const students = await User.find({ roomNo });
  const start = new Date(year, month-1, 1);
  const end = new Date(year, month, 1);
  const summary = students.map(s => {
    const records = s.mealRecords.filter(r => r.date >= start && r.date < end);
    return {
      studentId: s._id,
      name: s.fullName,
      morningOn: records.filter(r => r.mealType==='morning' && r.on).length,
      morningOff: records.filter(r => r.mealType==='morning' && !r.on).length,
      nightOn: records.filter(r => r.mealType==='night' && r.on).length,
      nightOff: records.filter(r => r.mealType==='night' && !r.on).length
    };
  });
  res.json({ roomNo, summary });
});

// get today's meal statistics for all hostel
// Since meals are unified (both ON or both OFF), we count meal status per student
router.get('/today/stats', async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const allStudents = await User.find();
  
  let mealOn = 0, mealOff = 0;
  
  allStudents.forEach(s => {
    const todayRecords = s.mealRecords.filter(r => {
      const d = new Date(r.date);
      d.setHours(0,0,0,0);
      return d.getTime() === today.getTime();
    });
    // Check any meal for today (morning or night - they're unified)
    const anyMealRecord = todayRecords.length > 0 ? todayRecords[0] : null;
    if (anyMealRecord?.on) mealOn++; else mealOff++;
  });
  
  res.json({ mealOn, mealOff, totalStudents: allStudents.length });
});

// get student meal status details
router.get('/student/:studentId/details', async (req, res) => {
  const student = await User.findById(req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Not found' });
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayRecords = student.mealRecords.filter(r => {
    const d = new Date(r.date);
    d.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  });
  res.json({
    fullName: student.fullName,
    email: student.email,
    mobile: student.mobile,
    dept: student.dept,
    roomNo: student.roomNo,
    address: student.address,
    todayMorning: todayRecords.find(r => r.mealType==='morning')?.on || false,
    todayNight: todayRecords.find(r => r.mealType==='night')?.on || false
  });
});

module.exports = router;
