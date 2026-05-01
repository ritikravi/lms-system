/**
 * Seed script — run once to populate the database with sample data
 * Usage: node src/utils/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Book = require('../models/Book.model');
const Notice = require('../models/Notice.model');
const EResource = require('../models/EResource.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Book.deleteMany({}),
    Notice.deleteMany({}),
    EResource.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    regNo: 'ADMIN001',
    name: 'Library Admin',
    email: 'admin@lpu.in',
    password: 'admin123',
    role: 'admin',
    department: 'Library',
  });

  // Create librarian
  await User.create({
    regNo: 'LIB001',
    name: 'Head Librarian',
    email: 'librarian@lpu.in',
    password: 'lib123',
    role: 'librarian',
    department: 'Library',
  });

  // Create students
  const students = await User.insertMany([
    { regNo: '12528517', name: 'Ritik Raushan', email: 'ritik@lpu.in', password: await bcrypt.hash('student123', 12), role: 'student', department: 'CSE', course: 'B.Tech' },
    { regNo: '12345678', name: 'Priya Sharma', email: 'priya@lpu.in', password: await bcrypt.hash('student123', 12), role: 'student', department: 'ECE', course: 'B.Tech' },
    { regNo: '11223344', name: 'Arjun Singh', email: 'arjun@lpu.in', password: await bcrypt.hash('student123', 12), role: 'student', department: 'MCA', course: 'MCA' },
  ]);

  // Create books
  await Book.insertMany([
    { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson', isbn: '978-0262033848', department: 'CSE / IT', subject: 'Algorithms', publisher: 'MIT Press', totalCopies: 5, availableCopies: 5, addedBy: admin._id },
    { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', department: 'CSE / ECE', subject: 'Networking', publisher: 'Pearson', totalCopies: 3, availableCopies: 2, addedBy: admin._id },
    { title: 'Database System Concepts', author: 'Silberschatz, Korth', isbn: '978-0073523323', department: 'CSE / MCA', subject: 'Database', publisher: 'McGraw Hill', totalCopies: 4, availableCopies: 4, addedBy: admin._id },
    { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', isbn: '978-0134610993', department: 'CSE / AI', subject: 'AI', publisher: 'Pearson', totalCopies: 3, availableCopies: 3, addedBy: admin._id },
    { title: 'Operating System Concepts', author: 'Silberschatz, Galvin', isbn: '978-1118063330', department: 'CSE / IT', subject: 'OS', publisher: 'Wiley', totalCopies: 6, availableCopies: 6, addedBy: admin._id },
    { title: 'Data Structures and Algorithms', author: 'Mark Allen Weiss', isbn: '978-0132576277', department: 'CSE', subject: 'Data Structures', publisher: 'Pearson', totalCopies: 4, availableCopies: 4, addedBy: admin._id },
    { title: 'Computer Organization and Architecture', author: 'William Stallings', isbn: '978-0134101613', department: 'CSE / ECE', subject: 'COA', publisher: 'Pearson', totalCopies: 3, availableCopies: 3, addedBy: admin._id },
    { title: 'Software Engineering', author: 'Ian Sommerville', isbn: '978-0133943030', department: 'CSE', subject: 'SE', publisher: 'Pearson', totalCopies: 5, availableCopies: 5, addedBy: admin._id },
    { title: 'Digital Electronics', author: 'Morris Mano', isbn: '978-0132103748', department: 'ECE', subject: 'Digital Electronics', publisher: 'Pearson', totalCopies: 4, availableCopies: 4, addedBy: admin._id },
    { title: 'Engineering Mathematics', author: 'B.S. Grewal', isbn: '978-8174091955', department: 'All', subject: 'Mathematics', publisher: 'Khanna Publishers', totalCopies: 10, availableCopies: 10, addedBy: admin._id },
  ]);

  // Create notices
  await Notice.insertMany([
    { title: 'Library closed on April 14 (Dr. Ambedkar Jayanti)', content: 'The library will remain closed on April 14, 2026 on account of Dr. Ambedkar Jayanti.', type: 'holiday', postedBy: admin._id },
    { title: 'New Engineering books arrived — visit counter 3', content: 'New batch of engineering reference books has arrived. Students can issue them from counter 3.', type: 'general', postedBy: admin._id },
    { title: 'E-journal access extended till May 2026 for all students', content: 'E-journal access has been extended till May 2026. Students can access all journals through the E-Resources portal.', type: 'policy', postedBy: admin._id },
    { title: 'Fine waiver week: 15–20 April. Return overdue books now!', content: 'Fine waiver week is from April 15 to April 20. Return all overdue books during this period to get fines waived.', type: 'alert', postedBy: admin._id },
  ]);

  // Create e-resources
  await EResource.insertMany([
    { title: 'IEEE Xplore Digital Library', type: 'database', url: 'https://ieeexplore.ieee.org', description: 'Access IEEE journals, conferences and standards', department: 'ECE', addedBy: admin._id },
    { title: 'ACM Digital Library', type: 'database', url: 'https://dl.acm.org', description: 'Computing and information technology research', department: 'CSE', addedBy: admin._id },
    { title: 'Springer Link', type: 'journal', url: 'https://link.springer.com', description: 'Scientific journals and books', addedBy: admin._id },
    { title: 'NPTEL Online Courses', type: 'video', url: 'https://nptel.ac.in', description: 'Free online courses from IITs and IISc', addedBy: admin._id },
    { title: 'ScienceDirect', type: 'journal', url: 'https://www.sciencedirect.com', description: 'Elsevier journals and research articles', addedBy: admin._id },
    { title: 'JSTOR', type: 'database', url: 'https://www.jstor.org', description: 'Academic journals, books and primary sources', addedBy: admin._id },
  ]);

  console.log('✅ Seed data inserted successfully!\n');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log('Admin:     ADMIN001 / admin123');
  console.log('Librarian: LIB001   / lib123');
  console.log('Student:   12528517 / student123');
  console.log('Student:   12345678 / student123');
  console.log('=========================');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
