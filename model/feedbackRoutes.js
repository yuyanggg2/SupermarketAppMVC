const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// ------------------------------
// NO middleware, NO require errors
// ------------------------------

// Customer feedback page
router.get('/customerFeedback', (req, res) => {
  return feedbackController.showCustomerFeedback(req, res);
});

// Customer submit feedback
router.post('/submitFeedback', (req, res) => {
  return feedbackController.submitFeedback(req, res);
});

// Admin view feedback
router.get('/admin/viewFeedback', (req, res) => {
  return feedbackController.viewFeedback(req, res);
});

module.exports = router;
