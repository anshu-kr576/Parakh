const express = require("express");
const multer = require("multer");
const examController = require("../controllers/examController");
const validateFileType = require("../middleware/validateFile");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Configure multer for in-memory PDF storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max file size
  }
});

// All exam routes require authentication
router.use(authMiddleware);

// POST /api/exams/upload-paper
router.post("/upload-paper", upload.array("files",15), validateFileType, examController.uploadPaper);

// GET /api/exams/list
router.get("/list", examController.listPapers);

// POST /api/exams/generate-rubric
router.post("/generate-rubric", examController.generateRubric);

// DELETE /api/exams/:id
router.delete("/:id", examController.deletePaper);

module.exports = router;
