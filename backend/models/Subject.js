const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a subject name'],
        trim: true
    },
    semester: {
        type: Number,
        required: [true, 'Please add a semester'],
        min: 1,
        max: 8
    },
    teacher: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please assign a teacher']
    },
    enrolledStudents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexing for faster queries by semester and teacher
SubjectSchema.index({ semester: 1 });
SubjectSchema.index({ teacher: 1 });

module.exports = mongoose.model('Subject', SubjectSchema);
