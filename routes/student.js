const express = require('express');
const router = express.Router();
const User = require('../models/user');

// get student by id
router.get('/student/:id', async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(u);
});

// toggle meal - unified logic: if OFF, all meals OFF; if ON, all meals ON
router.post('/student/:id/toggleMeal', async (req, res) => {
  const { mealType, date, on } = req.body; // date in ISO
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const d = new Date(date);
  const dateStr = d.toISOString().slice(0,10);
  
  // Find or create records for BOTH morning and night on the same date
  let morningIdx = user.mealRecords.findIndex(r => r.mealType === 'morning' && r.date.toISOString().slice(0,10) === dateStr);
  let nightIdx = user.mealRecords.findIndex(r => r.mealType === 'night' && r.date.toISOString().slice(0,10) === dateStr);
  
  // If turning ON: set both to ON. If turning OFF: set both to OFF
  if (morningIdx >= 0) user.mealRecords[morningIdx].on = on;
  else user.mealRecords.push({ date: d, mealType: 'morning', on });
  
  if (nightIdx >= 0) user.mealRecords[nightIdx].on = on;
  else user.mealRecords.push({ date: d, mealType: 'night', on });
  
  await user.save();
  res.json({ ok: true, mealRecords: user.mealRecords });
});

// get monthly summary for student
router.get('/student/:id/month/:year/:month', async (req, res) => {
  const { id, year, month } = { id: req.params.id, year: parseInt(req.params.year), month: parseInt(req.params.month) };
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  // count records in month
  const start = new Date(year, month-1, 1);
  const end = new Date(year, month, 1);
  const records = user.mealRecords.filter(r => r.date >= start && r.date < end);
  const morningOn = records.filter(r => r.mealType==='morning' && r.on).length;
  const morningOff = records.filter(r => r.mealType==='morning' && !r.on).length;
  const nightOn = records.filter(r => r.mealType==='night' && r.on).length;
  const nightOff = records.filter(r => r.mealType==='night' && !r.on).length;
  res.json({ morningOn, morningOff, nightOn, nightOff, records });
});

module.exports = router;
