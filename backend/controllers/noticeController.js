const Notice = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/v1/notices
// @access  Private
exports.getNotices = async (req, res, next) => {
    try {
        let query = {};

        // If student, filter by their semester or general notices
        if (req.user.role === 'student') {
            query = {
                $or: [
                    { targetSemester: req.user.semester },
                    { targetSemester: { $exists: false } },
                    { targetSemester: null }
                ]
            };
        }

        const notices = await Notice.find(query)
            .populate('postedBy', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            data: notices
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single notice
// @route   GET /api/v1/notices/:id
// @access  Private
exports.getNotice = async (req, res, next) => {
    try {
        const notice = await Notice.findById(req.params.id).populate('postedBy', 'name role');
        if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
        res.status(200).json({ success: true, data: notice });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create notice
// @route   POST /api/v1/notices
// @access  Private/Admin/Teacher
exports.createNotice = async (req, res, next) => {
    try {
        req.body.postedBy = req.user.id;
        const notice = await Notice.create(req.body);
        res.status(201).json({ success: true, data: notice });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update notice
// @route   PUT /api/v1/notices/:id
// @access  Private/Admin/Teacher
exports.updateNotice = async (req, res, next) => {
    try {
        let notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

        // Check ownership or admin
        if (notice.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this notice' });
        }

        notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: notice });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete notice
// @route   DELETE /api/v1/notices/:id
// @access  Private/Admin/Teacher
exports.deleteNotice = async (req, res, next) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

        // Check ownership or admin
        if (notice.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this notice' });
        }

        await notice.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
