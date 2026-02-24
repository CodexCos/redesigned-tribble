const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subject = require('../models/Subject');
const sendEmail = require('../config/email');

// @desc    Mark attendance for multiple students (bulk)
// @route   POST /api/v1/attendance
// @access  Private/Teacher/Admin
exports.markAttendance = async (req, res, next) => {
    const { entries, subjectId, date } = req.body;

    if (!entries || !subjectId || !date) {
        return res.status(400).json({ success: false, message: 'Please provide entries, subjectId and date' });
    }

    try {
        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });

        if (req.user.role === 'teacher' && subject.teacher.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this subject' });
        }

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const attendanceRecords = entries.map(entry => ({
            student: entry.studentId,
            subject: subjectId,
            date: normalizedDate,
            status: entry.status.toLowerCase(),
        }));

        const operations = attendanceRecords.map(record => ({
            updateOne: {
                filter: { student: record.student, subject: record.subject, date: record.date },
                update: { $set: record },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);

        const absentEntries = entries.filter(e => e.status.toLowerCase() === 'absent');

        if (absentEntries.length > 0) {
            for (const entry of absentEntries) {
                try {
                    const student = await User.findById(entry.studentId);
                    if (student && student.email) {
                        await sendEmail({
                            email: student.email,
                            subject: `Absence Alert: ${subject.name}`,
                            message: `Hi ${student.name}, you were marked ABSENT for ${subject.name} on ${normalizedDate.toDateString()}.`,
                            html: `
                                <h3>Absence Notification</h3>
                                <p>Dear <b>${student.name}</b>,</p>
                                <p>This is to inform you that you have been marked as <b>ABSENT</b> for the following class:</p>
                                <ul>
                                    <li><b>Subject:</b> ${subject.name}</li>
                                    <li><b>Date:</b> ${normalizedDate.toDateString()}</li>
                                </ul>
                                <p>Please contact your teacher if you believe this is a mistake.</p>
                            `
                        });
                    }
                } catch (emailErr) {
                    console.error(`Failed to send absence email to student ${entry.studentId}:`, emailErr.message);
                }
            }
        }

        res.status(200).json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance records
// @route   GET /api/v1/attendance
// @access  Private
exports.getAttendance = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;

        let query = {};

        if (req.user.role === 'student') {
            query.student = req.user.id;
        } else if (req.user.role === 'teacher') {
            const subjects = await Subject.find({ teacher: req.user.id });
            const subjectIds = subjects.map(s => s._id);
            query.subject = { $in: subjectIds };
        }

        if (req.query.subject) query.subject = req.query.subject;
        if (req.query.date) {
            const date = new Date(req.query.date);
            date.setHours(0, 0, 0, 0);
            query.date = date;
        }

        const attendance = await Attendance.find(query)
            .populate('student', 'name email enrollmentId')
            .populate('subject', 'name semester')
            .sort({ date: -1 })
            .skip(startIndex)
            .limit(limit);

        const total = await Attendance.countDocuments(query);

        res.status(200).json({
            success: true,
            count: attendance.length,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            },
            data: attendance
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get attendance stats for a student (Per Subject Breakdown)
// @route   GET /api/v1/attendance/stats/:studentId
// @access  Private
exports.getStudentStats = async (req, res, next) => {
    try {
        const studentId = req.params.studentId || req.user.id;

        const stats = await Attendance.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: '$subject',
                    totalClasses: { $sum: 1 },
                    presentCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    subject: '$_id',
                    totalClasses: 1,
                    presentCount: 1,
                    percentage: {
                        $cond: [
                            { $eq: ['$totalClasses', 0] },
                            0,
                            { $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] }
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subject',
                    foreignField: '_id',
                    as: 'subjectInfo'
                }
            },
            { $unwind: '$subjectInfo' }
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get overall attendance summary for a student
// @route   GET /api/v1/attendance/summary/:studentId
// @access  Private
exports.getOverallSummary = async (req, res, next) => {
    try {
        const studentId = req.params.studentId || req.user.id;

        const summary = await Attendance.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: null,
                    totalClasses: { $sum: 1 },
                    presentCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    absentCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalClasses: 1,
                    presentCount: 1,
                    absentCount: 1,
                    overallPercentage: {
                        $cond: [
                            { $eq: ['$totalClasses', 0] },
                            0,
                            { $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] }
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: summary[0] || { totalClasses: 0, presentCount: 0, absentCount: 0, overallPercentage: 0 }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete attendance record
// @route   DELETE /api/v1/attendance/:id
// @access  Private/Admin
exports.deleteAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ success: false, message: 'Attendance record not found' });

        await attendance.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
