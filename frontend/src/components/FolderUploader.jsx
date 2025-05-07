import { useState } from "react";
import JSZip from "jszip";

function FolderUploader() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploadStatus("⏳ Zipping files...");
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.webkitRelativePath || file.name, file);
    });

    const blob = await zip.generateAsync({ type: "blob" });

    const formData = new FormData();
    formData.append("file", blob, "dicom-dataset.zip");

    setUploadStatus("📤 Uploading ZIP to backend...");

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/upload_zip`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      setUploadStatus(`✅ Uploaded! CID: ${result.cid}`);
    } else {
      setUploadStatus(`❌ Error: ${result.error}`);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg mt-5 space-y-4">
      <h3 className="text-lg font-semibold">📤 Upload Folder to IPFS</h3>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0 file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        onClick={handleUpload}
        disabled={files.length === 0}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        Upload Folder to IPFS
      </button>
      <p>{uploadStatus}</p>
    </div>
  );
}

export default FolderUploader;
