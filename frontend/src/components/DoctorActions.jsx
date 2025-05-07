import { useState, useEffect } from "react";
import MetadataUpdater from "./MetadataUpdater";
import PinataUploader from "./PinataUploader";
import FolderUploader from "./FolderUploader";

function DoctorActions({ contract, walletAddress }) {
  const [cid, setCid] = useState(localStorage.getItem("lastCID") || "");
  const [hashID, setHashID] = useState(
    localStorage.getItem("lastHashID") || ""
  );
  const [sigCount, setSigCount] = useState(0);
  const [required, setRequired] = useState(3);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [externalHashCID, setExternalHashCID] = useState(
    localStorage.getItem("externalCID") || ""
  );
  const [externalStatus, setExternalStatus] = useState("");

  useEffect(() => {
    const fetchSignatureCount = async () => {
      if (cid && contract) {
        try {
          const hash = await contract.generateBundleID(cid);
          setHashID(hash);
          const count = await contract.signatureWeights(hash);
          setSigCount(count.toNumber());

          // Save updated CID and hashID to localStorage
          localStorage.setItem("lastCID", cid);
          localStorage.setItem("lastHashID", hash);
        } catch (err) {
          console.error("Failed to fetch hash/signatures:", err);
          setHashID("");
          setSigCount(0);
        }
      } else {
        setHashID("");
        setSigCount(0);
      }
    };
    fetchSignatureCount();
  }, [cid, contract]);

  const handleRequestSignature = async (cid) => {
    if (!cid) {
      alert("Please enter a CID first");
      return;
    }
    console.log("🔐 Requesting signature for CID:", cid);
    try {
      setStatus("⏳ Signing request...");
      setLoading(true);
      const tx = await contract.requestSignature(cid);
      await tx.wait();
      setStatus("🖋️ Signature request submitted!");
      setLoading(false);

      // 🔁 Manually refresh hashID and sigCount
      const hash = await contract.generateBundleID(cid);
      setHashID(hash);
      const count = await contract.signatureWeights(hash);
      setSigCount(count.toNumber());

      // Save again after request
      localStorage.setItem("lastCID", cid);
      localStorage.setItem("lastHashID", hash);
    } catch (err) {
      console.error("Signature request failed:", err);
      setStatus("❌ Request failed");
      setLoading(false);
    }
  };

  const handleMintNFT = async (cid) => {
    if (!cid || !hashID) {
      alert("CID or HashID missing");
      return;
    }
    console.log("🪙 Minting NFT with CID and HashID:", cid, hashID);
    try {
      setStatus("⏳ Minting NFT...");
      setLoading(true);
      const tx = await contract.mintBundle(cid, hashID);
      const receipt = await tx.wait();

      let mintedTokenId = null;
      if (receipt && receipt.events) {
        for (const event of receipt.events) {
          if (event.event === "ImageBundleUploaded") {
            // <--- Change to your correct event name
            mintedTokenId = event.args.tokenId.toString();
            break;
          }
        }
      }

      if (!mintedTokenId) {
        console.warn(
          "⚠️ TokenId not found in events. Check your contract event."
        );
        mintedTokenId = "Unknown";
      }
      // ✅ After mint, show info
      setStatus(`✅ NFT minted!
        \nContract Address: ${contract.address}
        \nToken ID: ${mintedTokenId}
        \n🔗 [View on Etherscan](https://etherscan.io/tx/${tx.hash})
        \n🖼️ [View Image on IPFS](https://gateway.pinata.cloud/ipfs/${cid})
      `);

      // ✅ After mint, clear localStorage
      localStorage.removeItem("lastCID");
      localStorage.removeItem("lastHashID");
      setCid("");
      setHashID("");
      setSigCount(0);
    } catch (err) {
      console.error("Minting failed:", err);
      setStatus("❌ Minting failed");
    }
    setLoading(false);
  };

  const handleCopyHashID = async () => {
    if (hashID) {
      await navigator.clipboard.writeText(hashID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClearCID = () => {
    localStorage.removeItem("lastCID");
    localStorage.removeItem("lastHashID");
    setCid("");
    setHashID("");
    setSigCount(0);
    setStatus("🧹 Cleared CID and HashID");
  };
  const handleSignRequest = async () => {
    if (!externalHashCID) {
      alert("Please enter a hash ID");
      return;
    }

    try {
      setStatus("⏳ Signing request...");
      const tx = await contract.signRequest(externalHashCID);
      await tx.wait();
      setStatus("✅ Signature submitted successfully!");
    } catch (error) {
      console.error("Signing failed:", error);
      setStatus("❌ Failed to sign request.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      {/* Left Side: 2 Columns */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-3xl font-semibold">Doctor Actions</h3>

        {/* CID Input and Clear Button */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <input
            type="text"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            placeholder="Enter IPFS CID"
            className="col-span-2 px-4 py-2 border rounded-md"
          />
          <button
            onClick={handleClearCID}
            disabled={loading}
            className="bg-red-100 text-red-800 px-4 py-2 rounded-md border border-red-300"
          >
            🧹 Clear CID
          </button>
        </div>

        {/* Hash ID Display */}
        {hashID && (
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-medium">HashID:</span>
            <span className="break-all text-sm">{hashID}</span>
            <button
              onClick={handleCopyHashID}
              className="bg-gray-100 border px-3 py-1 rounded-md"
            >
              {copied ? "✅ Copied" : "📋 Copy"}
            </button>
          </div>
        )}

        {/* Signature Progress and Status */}
        <div className="text-sm">
          <p>
            ✍️ Signature Progress: <strong>{sigCount}</strong> / {required}
          </p>
          {status && (
            <p className="flex items-center gap-2">
              {loading && <span>🔄</span>}
              {status}
            </p>
          )}
        </div>

        {/* Request Signature & Mint NFT Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleRequestSignature(cid)}
            disabled={!cid || loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            🖋️ Request Signature
          </button>
          <button
            onClick={() => handleMintNFT(cid)}
            disabled={!cid || sigCount < required || loading}
            className="bg-green-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            🪙 Mint NFT
          </button>
        </div>

        <hr />

        {/* Metadata Updater */}
        <div>
          <h4 className="text-lg font-semibold mb-2">🔄 Update Metadata</h4>
          <MetadataUpdater contract={contract} />
        </div>

        <hr />

        {/* External Hash Sign Request */}
        <div>
          <h4 className="text-lg font-semibold mb-2">🖋️ Sign Request</h4>
          <input
            type="text"
            value={externalHashCID}
            onChange={(e) => {
              setExternalHashCID(e.target.value);
              localStorage.setItem("externalCID", e.target.value);
            }}
            placeholder="Enter HashID"
            className="w-full px-4 py-2 mb-3 border rounded-md"
          />
          <button
            onClick={handleSignRequest}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md"
          >
            ✍️ Sign request
          </button>
          {externalStatus && <p className="mt-2 text-sm">{externalStatus}</p>}
        </div>
      </div>

      {/* Right Sidebar: Uploaders */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold">📤 Upload Tools</h4>
        <PinataUploader />
        <FolderUploader />
      </div>
    </div>
  );
}

export default DoctorActions;
