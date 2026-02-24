const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Student is required']
    },
    subject: {
        type: mongoose.Schema.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: [true, 'Status is required'],
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a student is only marked once per subject per day
// We use a custom index or logic, but for simple date comparison:
AttendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
