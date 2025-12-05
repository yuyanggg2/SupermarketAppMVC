const db = require('../db');

// Show customer feedback form page
exports.showCustomerFeedback = (req, res) => {
    res.render("customerFeedback", {
        success: req.query.success
    });
};

// Handle customer feedback submission
exports.submitFeedback = (req, res) => {
  console.log(">>> submitFeedback triggered <<<", req.body);

  const { rating, feedback_text } = req.body;

  if (!req.session.user) {
    return res.status(401).send("Login required");
  }

  const userId = req.session.user.id;  // or req.session.user.user_id

  const sql = "INSERT INTO feedback (user_id, rating, feedback_text) VALUES (?, ?, ?)";

  db.query(sql, [userId, rating, feedback_text], (err, result) => {
    if (err) {
      console.error("DB ERROR /submitFeedback:", err);
      return res.status(500).send("Feedback submission failed");
    }
    return res.redirect("/customerFeedback?success=true");
  });
};


// Admin view all feedback
exports.viewFeedback = (req, res) => {

  const sql = `
    SELECT f.*, u.username 
    FROM feedback f 
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Admin feedback query error:", err);
      return res.status(500).send("Database error.");
    }

    res.render("adminFeedbackList", { feedback: results, user: req.session.user });
  });
};
