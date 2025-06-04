const express = require("express");
const router = express.Router();
 const { protect } = require("../middleware/authMiddleware");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");

 
 

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

 
 module.exports = router;