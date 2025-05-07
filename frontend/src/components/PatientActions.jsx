import { useState } from "react";

function PatientActions({ contract }) {
  const [hashID, setHashID] = useState("");
  const [status, setStatus] = useState("");

  const handleSignRequest = async () => {
    if (!hashID) {
      alert("Please enter a hash ID");
      return;
    }

    try {
      setStatus("⏳ Signing request...");
      const tx = await contract.signRequest(hashID);
      await tx.wait();
      setStatus("✅ Signature submitted successfully!");
    } catch (error) {
      console.error("Signing failed:", error);
      setStatus("❌ Failed to sign request.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h3 className="text-3xl font-bold">Patient Actions</h3>
      <input
        type="text"
        value={hashID}
        onChange={(e) => setHashID(e.target.value)}
        placeholder="Enter HashID"
        className="w-full max-w-md px-4 py-2 mb-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
      />

      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-300 shadow-md flex items-center gap-2"
        onClick={handleSignRequest}
        disabled={!hashID}
      >
        ✍️ Sign Request
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default PatientActions;
