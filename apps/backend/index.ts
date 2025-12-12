import express from 'express';
import dotenv from 'dotenv';
//import other necessary modules and middleware


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
//app.use(other necessary middleware)

// Route setup
//import authRoutes from './routes/auth.routes';
//app.use('/auth', authRoutes);

//import other route files and use them here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
