const supabase = require("../config/supabase");

/**
 * Stores the parsed exam paper data in Supabase, linked to the authenticated user.
 * The parsed JSON is stored exactly as received from the AI service —
 * no normalization, no restructuring, not a single character changed.
 *
 * @param {Object} parsedData - The exact JSON from the AI service (questionPaper.json format)
 * @param {string} pdfFilename - The original PDF filename
 * @param {string} userId - The authenticated user's UUID
 * @returns {Object} The inserted record with its generated ID
 */
const storeExamPaper = async (parsedData, pdfFilename, userId) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .insert({
      pdf_filename: pdfFilename,
      parsed_data: parsedData, // Exact JSON, stored as-is in JSONB
      user_id: userId,
    })
    .select("id, created_at")
    .single();

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

/**
 * Retrieves list of exam papers belonging to the authenticated user.
 *
 * @param {string} userId - The authenticated user's UUID
 * @returns {Array} List of exam papers owned by the user
 */
const listExamPapers = async (userId) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .select("id, pdf_filename, parsed_data, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

/**
 * Updates parsed data for an existing exam paper, verifying ownership.
 *
 * @param {string} id - The generated ID of the exam paper
 * @param {Object} parsedData - The updated question paper JSON
 * @param {string} pdfFilename - The PDF filename
 * @param {string} userId - The authenticated user's UUID
 * @returns {Object} The updated record with its ID
 */
const updateExamPaper = async (id, parsedData, pdfFilename, userId) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .update({
      parsed_data: parsedData,
      pdf_filename: pdfFilename,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, created_at")
    .single();

  if (error) {
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = error.code === "PGRST116" ? 404 : 500;
    throw dbError;
  }

  return data;
};

/**
 * Deletes an exam paper and all its associated evaluations (via CASCADE).
 * Only deletes if the paper belongs to the authenticated user.
 *
 * @param {string} id - The UUID of the exam paper to delete
 * @param {string} userId - The authenticated user's UUID
 * @returns {Object} The deleted record
 */
const deleteExamPaper = async (id, userId) => {
  if (!supabase) {
    const configError = new Error(
      "Database configuration is missing. Supabase is not configured on this server."
    );
    configError.statusCode = 500;
    throw configError;
  }

  const { data, error } = await supabase
    .from("exam_papers")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      const notFoundError = new Error(
        "Exam paper not found or you do not have permission to delete it."
      );
      notFoundError.statusCode = 404;
      throw notFoundError;
    }
    const dbError = new Error(`Database error: ${error.message}`);
    dbError.statusCode = 500;
    throw dbError;
  }

  return data;
};

module.exports = {
  storeExamPaper,
  listExamPapers,
  updateExamPaper,
  deleteExamPaper,
};
