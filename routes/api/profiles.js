const express = require('express');
const router = express.Router();

// @route    GET api/v2/profiles/test
// @desc     Tests profiles route
// @access   Public
router.get('/test', (req, res) => res.json({
  msg: 'profiles router works'
}));

module.exports = router;