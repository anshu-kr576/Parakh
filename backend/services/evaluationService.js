const supabase = require("../config/supabase");

/**
 * Fetches an exam paper (question paper) by its ID from Supabase,
 * verifying that it belongs to the authenticated user.
 *
 * @param {string} id - The UUID of the exam paper
 * @param {string} userId - The authenticated user's UUID
 * @returns {Object} The exam paper record
 */
const getQuestionPaperById = async (id, userId) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .select("id, parsed_data, pdf_filename, user_id")
    .eq("id", id)
    .single();

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = error.code === "PGRST116" ? 404 : 500;
    throw dbError;
  }

  // Verify ownership
  if (data.user_id !== userId) {
    const authError = new Error("You do not have permission to access this exam paper.");
    authError.statusCode = 403;
    throw authError;
  }

  return data;
};

/**
 * Stores the evaluated student answer sheet results in Supabase.
 * Follows the fields based on studentMetadata in answerSheet.json.
 *
 * @param {string} examPaperId - The associated question paper's UUID
 * @param {Object} evaluationData - The exact grading response JSON from the AI service
 * @param {string} pdfFilename - The filename of the student's answer sheet
 * @param {string} [studentName] - The optional name of the student provided by user input
 * @returns {Object} The inserted record containing id and created_at
 */
const storeEvaluation = async (examPaperId, evaluationData, pdfFilename, studentName) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const studentMetadata = evaluationData.studentMetadata || {};

  // Calculate student's total obtained marks from the evaluation answer blocks
  let obtainedMarks = 0;
  if (evaluationData && Array.isArray(evaluationData.answerBlocks)) {
    obtainedMarks = evaluationData.answerBlocks.reduce((sum, block) => {
      return sum + (block.earnedMarks?.value || 0);
    }, 0);
  }

  // Fetch max marks from the associated question paper (no userId check needed here
  // since this is called after ownership was already verified in the controller)
  let maxMarks = 0;
  try {
    const { data: examPaper } = await supabase
      .from("exam_papers")
      .select("parsed_data")
      .eq("id", examPaperId)
      .single();

    if (examPaper && examPaper.parsed_data && examPaper.parsed_data.paperMetadata) {
      maxMarks = examPaper.parsed_data.paperMetadata.totalMarks || 0;
    }
  } catch (err) {
    console.warn(`Failed to retrieve max marks from question paper: ${err.message}`);
  }

  const record = {
    exam_paper_id: examPaperId,
    pdf_filename: pdfFilename,
    parsed_data: evaluationData,
    student_name: studentName || studentMetadata.name || "",
    roll_number: studentMetadata.rollNumber || "",
    exam_code: studentMetadata.examCode || "",
    subject: studentMetadata.subject || "",
    obtained_marks: obtainedMarks,
    max_marks: maxMarks,
  };

  const { data, error } = await supabase
    .from("evaluations")
    .insert(record)
    .select("id, created_at, obtained_marks, max_marks")
    .single();

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

/**
 * Fetches all evaluation results for a specific question paper.
 *
 * @param {string} examPaperId - The UUID of the question paper
 * @returns {Array} List of evaluation records
 */
const getEvaluationsByPaperId = async (examPaperId) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("exam_paper_id", examPaperId)
    .order("created_at", { ascending: true });

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data || [];
};

/**
 * Deletes an individual evaluation record.
 * Ownership is verified by checking the parent exam paper's user_id.
 *
 * @param {string} evaluationId - The UUID of the evaluation to delete
 * @param {string} userId - The authenticated user's UUID
 * @returns {Object} The deleted evaluation record
 */
const deleteEvaluation = async (evaluationId, userId) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  // First, fetch the evaluation to get the parent exam_paper_id
  const { data: evaluation, error: fetchError } = await supabase
    .from("evaluations")
    .select("id, exam_paper_id")
    .eq("id", evaluationId)
    .single();

  if (fetchError) {
    const dbError = new Error(
      fetchError.code === "PGRST116"
        ? "Evaluation not found."
        : `Database error: ${fetchError.message}`
    );
    dbError.statusCode = fetchError.code === "PGRST116" ? 404 : 500;
    throw dbError;
  }

  // Verify ownership through the parent exam paper
  const { data: examPaper, error: paperError } = await supabase
    .from("exam_papers")
    .select("user_id")
    .eq("id", evaluation.exam_paper_id)
    .single();

  if (paperError || !examPaper) {
    const err = new Error("Associated exam paper not found.");
    err.statusCode = 404;
    throw err;
  }

  if (examPaper.user_id !== userId) {
    const authError = new Error("You do not have permission to delete this evaluation.");
    authError.statusCode = 403;
    throw authError;
  }

  // Delete the evaluation
  const { data: deleted, error: deleteError } = await supabase
    .from("evaluations")
    .delete()
    .eq("id", evaluationId)
    .select("id")
    .single();

  if (deleteError) {
    const dbError = new Error(`Database error: ${deleteError.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return deleted;
};

module.exports = {
  getQuestionPaperById,
  storeEvaluation,
  getEvaluationsByPaperId,
  deleteEvaluation,
};
