const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a course name'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add a course code'],
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    durationYears: {
        type: Number,
        required: [true, 'Please add course duration in years'],
        min: 1,
        max: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema);
