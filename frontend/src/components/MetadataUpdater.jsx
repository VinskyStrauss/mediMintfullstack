import { useState } from "react";

function MetadataUpdater({ contract }) {
  const [tokenId, setTokenId] = useState("");
  const [newCID, setNewCID] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateMetadata = async () => {
    if (!tokenId || !newCID) {
      alert("Token ID and new CID are required");
      return;
    }

    try {
      setStatus("⏳ Updating metadata...");
      setLoading(true);
      const tx = await contract.updateTokenMetadata(tokenId, newCID);
      await tx.wait();
      setStatus(`✅ Metadata for Token ID ${tokenId} updated!`);
    } catch (err) {
      console.error("Metadata update failed:", err);
      setStatus("❌ Failed to update metadata");
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        className="mt-4 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="New IPFS CID"
        value={newCID}
        onChange={(e) => setNewCID(e.target.value)}
        className="mt-4 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleUpdateMetadata}
        disabled={loading || !tokenId || !newCID}
      >
        ♻️ Update Metadata
      </button>
      {status && (
        <p>
          {loading ? "🔄 " : ""}
          {status}
        </p>
      )}
    </div>
  );
}

export default MetadataUpdater;
