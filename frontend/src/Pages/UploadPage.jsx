import FileUploader from "../components/FileUploader";
import Navbar from "../components/Navbar";

function UploadPage() {
  return (
    <div style={{ background: "#0f172a", minHeight: "100vh" }}>
      <Navbar />
      <FileUploader />
    </div>
  );
}

export default UploadPage;