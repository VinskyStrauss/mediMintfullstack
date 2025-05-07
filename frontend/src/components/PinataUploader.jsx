import { useState } from "react";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: import.meta.env.VITE_GATEWAY_URL,
});
function PinataUploader() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [link, setLink] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadStatus("Getting upload URL...");
      const urlResponse = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/presigned_url`,
        {
          method: "GET",
          headers: {
            // Add auth headers if needed
          },
        }
      );

      const data = await urlResponse.json();
      setUploadStatus("Uploading file...");

      const upload = await pinata.upload.public.file(file).url(data.url);

      if (upload.cid) {
        setUploadStatus("File uploaded successfully!");
        const ipfsLink = await pinata.gateways.public.convert(upload.cid);
        setLink(ipfsLink);
      } else {
        setUploadStatus("Upload failed!");
      }
    } catch (error) {
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    /* const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(data.url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const ipfsCID = data.cid; // Assuming server returns this
      const gatewayLink = await pinata.gateways.public.convert(ipfsCID);

      setUploadStatus("✅ File uploaded successfully!");
      setLink(gatewayLink);
    } catch (error) {
      console.error(error);
      setUploadStatus(`❌ Error: ${error.message}`);
    } */
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg mt-5 space-y-4">
      <h3 className="text-lg font-semibold">📤 Upload File to IPFS</h3>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0 file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        onClick={handleUpload}
        disabled={!file}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        Upload to Pinata
      </button>
      {uploadStatus && <p className="text-sm text-gray-600">{uploadStatus}</p>}
      {link && (
        <p className="text-sm text-blue-600">
          🔗{" "}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View File on IPFS
          </a>
        </p>
      )}
    </div>
  );
}

export default PinataUploader;
