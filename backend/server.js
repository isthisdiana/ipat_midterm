const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database: "cor_system", //database name
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("Connected to MySQL!");
});

// Fetch all records from the certificate_of_registration table
app.get("/cor", (req, res) => {
  const sql = "SELECT * FROM certificate_of_registration";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Failed to fetch data" });
    }

    // Process each record to split comma-separated values into arrays and convert images to Base64
    const processedResults = result.map((record) => {
      return {
        ...record,
        student_photo: record.student_photo ? record.student_photo.toString("base64") : null, // Convert binary to Base64
        registrar_signature: record.registrar_signature ? record.registrar_signature.toString("base64") : null, // Convert binary to Base64
        subject_code: record.subject_code?.split(",") || [],
        subject_title: record.subject_title?.split(",") || [],
        lec_units: record.lec_units?.split(",") || [],
        lab_units: record.lab_units?.split(",") || [],
        credit_units: record.credit_units?.split(",") || [],
        tuition_units: record.tuition_units?.split(",") || [],
        subject_section: record.subject_section?.split(",") || [],
        subject_schedule_room: record.subject_schedule_room?.split(",") || [],
        subject_faculty: record.subject_faculty?.split(",") || [],
      };
    });

    res.json(processedResults); // Send response as JSON
  });
});

// Fetch a specific student's record by registration_no
app.get("/cor/:registrationNo", (req, res) => {
  const registrationNo = req.params.registrationNo;
  const sql = "SELECT * FROM certificate_of_registration WHERE registration_no = ?";
  db.query(sql, [registrationNo], (err, result) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Failed to fetch data" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Student record not found" });
    }

    // Process the single record
    const processedResult = {
      ...result[0],
      student_photo: result[0].student_photo ? result[0].student_photo.toString("base64") : null, // Convert binary to Base64
      registrar_signature: result[0].registrar_signature ? result[0].registrar_signature.toString("base64") : null, // Convert binary to Base64
      subject_code: result[0].subject_code?.split(",") || [],
      subject_title: result[0].subject_title?.split(",") || [],
      lec_units: result[0].lec_units?.split(",") || [],
      lab_units: result[0].lab_units?.split(",") || [],
      credit_units: result[0].credit_units?.split(",") || [],
      tuition_units: result[0].tuition_units?.split(",") || [],
      subject_section: result[0].subject_section?.split(",") || [],
      subject_schedule_room: result[0].subject_schedule_room?.split(",") || [],
      subject_faculty: result[0].subject_faculty?.split(",") || [],
    };

    res.json(processedResult); // Send response as JSON
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});