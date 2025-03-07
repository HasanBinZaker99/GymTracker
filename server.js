const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri =
  "mongodb+srv://mdhbz99d:plyPbyF3GGqBFKw4@cluster0.c1urh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
}

connectDB();

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ✅ Register Route
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });
    await user.save();

    console.log(`✅ New user registered: ${email}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Wait for DB connection before handling login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Compare hashed password with user input
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Define Workout Schema
const workoutSchema = new mongoose.Schema({
  email: { type: String, required: true },
  workouts: { type: Object, required: true }, // ✅ Save workouts as key-value pairs
  date: { type: String, required: true },
});

const Workout = mongoose.model("Workout", workoutSchema);

// ✅ API to Save Workout
app.post("/save-workout", async (req, res) => {
  console.log("hi");
  try {
    const { email, workouts, date, time } = req.body;

    if (!email || !workouts || !date || !time || !Array.isArray(workouts)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // ✅ Convert array of objects to key-value pairs
    const workoutObject = workouts.reduce((acc, { workout, tickStatus }) => {
      acc[workout] = tickStatus;
      return acc;
    }, {});

    // ✅ Find existing workout entry for the same user and date
    let existingEntry = await Workout.findOne({ email, date });

    if (existingEntry) {
      // ✅ If workouts are the same, prevent duplicate saving
      const existingWorkouts = JSON.stringify(existingEntry.workouts);
      const newWorkouts = JSON.stringify(workoutObject);

      if (existingWorkouts === newWorkouts) {
        return res
          .status(200)
          .json({ message: "You already checked this workout!" });
      }

      // ✅ If new workouts are different, update existing entry
      existingEntry.workouts = { ...existingEntry.workouts, ...workoutObject };
      existingEntry.time = time; // ✅ Store last updated time
      await existingEntry.save();

      return res.status(200).json({ message: "Workout updated successfully!" });
    } else {
      // ✅ If no entry exists, create a new one
      const newWorkout = new Workout({
        email,
        workouts: workoutObject,
        date,
        time,
      });

      await newWorkout.save();
      return res.status(201).json({ message: "Workouts saved successfully!" });
    }
  } catch (error) {
    console.error("❌ Error saving workouts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ API to Fetch Workouts by Date and Email
app.get("/get-workout", async (req, res) => {
  try {
    console.log("🔍 Incoming Request:", req.query);
    const { email, date } = req.query;

    if (!email || !date) {
      console.log("⚠️ Missing email or date in request.");
      return res
        .status(400)
        .json({ message: "Email and date parameters are required" });
    }

    console.log(`📢 Fetching workouts for ${email} on ${date}`);

    // ✅ Find workouts based on email and date
    const workoutEntries = await Workout.find({ email, date });

    if (workoutEntries.length === 0) {
      console.log("⚠️ No workouts found.");
      return res
        .status(404)
        .json({ message: "No workouts found for this date" });
    }

    // ✅ Transform the workouts into the correct structure
    const results = workoutEntries.map((entry) => ({
      workouts: entry.workouts, // Object with workout names as keys and tick status as values
      time: entry.time, // Include time if available
    }));

    console.log("✅ Workouts found:", results);
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ API to Fetch Last 7 Days Workouts
app.get("/recent-workout", async (req, res) => {
  try {
    const { email, date } = req.query;

    if (!email || !date) {
      return res
        .status(400)
        .json({ message: "Email and date parameters are required" });
    }

    console.log(
      `🔍 Fetching last 7 days of workouts for ${email} up to ${date}`
    );

    const startDate = moment(date).subtract(6, "days").format("YYYY-MM-DD");
    const endDate = moment(date).format("YYYY-MM-DD");

    const recentWorkouts = await Workout.find({
      email,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 }); // Sort by date ascending

    if (recentWorkouts.length === 0) {
      console.log("⚠️ No workouts found.");
      return res
        .status(404)
        .json({ message: "No workouts found for the last 7 days." });
    }

    console.log("✅ Workouts found:", recentWorkouts);
    res.status(200).json(recentWorkouts);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
