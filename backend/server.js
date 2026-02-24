const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS - Move to top
app.use(cors({
  origin: true, // Reflect origin (allows all origins with credentials)
  credentials: true
}));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Set security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const subjects = require('./routes/subjectRoutes');
const attendance = require('./routes/attendanceRoutes');
const notices = require('./routes/noticeRoutes');
const courses = require('./routes/courseRoutes');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/subjects', subjects);
app.use('/api/v1/attendance', attendance);
app.use('/api/v1/notices', notices);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
