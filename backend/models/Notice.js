const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    type: {
        type: String,
        enum: ['general', 'exam', 'holiday', 'event'],
        default: 'general'
    },
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    targetSemester: {
        type: Number,
        min: 1,
        max: 8,
        description: 'Optional: Target specific semester'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notice', NoticeSchema);
