import { useState, useEffect } from "react";
import ViewModal from "./ViewModal";
function HospitalActions({ contract }) {
  const [hashID, setHashID] = useState("");
  const [status, setStatus] = useState("");
  const [sigCount, setSigCount] = useState(0);
  const [required, setRequired] = useState(3);
  const [copied, setCopied] = useState(false);

  const [newDoctor, setNewDoctor] = useState(
    localStorage.getItem("newDoctorAddress") || ""
  );
  const [changeDoctorHashID, setChangeDoctorHashID] = useState(
    localStorage.getItem("doctorChangeHashID") || ""
  );

  const [newHospital, setNewHospital] = useState(
    localStorage.getItem("newHospitalAddress") || ""
  );
  const [changeHospitalHashID, setChangeHospitalHashID] = useState(
    localStorage.getItem("hospitalChangeHashID") || ""
  );

  const [hospitalSigCount, setHospitalSigCount] = useState(0);
  const [accountInfo, setAccountInfo] = useState({
    doctor: "",
    patient: "",
    hospital: "",
  });

  useEffect(() => {
    const fetchSignatureProgress = async () => {
      if (changeDoctorHashID && contract) {
        try {
          const count = await contract.signatureWeights(changeDoctorHashID);
          setSigCount(count.toNumber());
        } catch (err) {
          console.error("Error fetching signature progress:", err);
          setSigCount(0);
        }
      }
    };
    fetchSignatureProgress();
  }, [changeDoctorHashID, contract]);

  useEffect(() => {
    const fetchHospitalSigProgress = async () => {
      if (changeHospitalHashID && contract) {
        try {
          const count = await contract.signatureWeights(changeHospitalHashID);
          setHospitalSigCount(count.toNumber());
        } catch (err) {
          console.error("Error fetching hospital signature progress:", err);
          setHospitalSigCount(0);
        }
      }
    };
    fetchHospitalSigProgress();
  }, [changeHospitalHashID, contract]);

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

  const handleRequestDoctorChange = async () => {
    if (!newDoctor) {
      alert("Enter new doctor address");
      return;
    }

    try {
      setStatus("⏳ Requesting doctor change...");
      const tx = await contract.requestRoleChange("changeDoctor", newDoctor);
      const receipt = await tx.wait();

      let hash = null;
      for (const event of receipt.events) {
        if (event.event === "SignRequestCreated") {
          hash = event.args.hashID;
          break;
        }
      }

      if (!hash) {
        console.error("Failed to extract hashID from event");
        return;
      }

      setChangeDoctorHashID(hash);
      localStorage.setItem("doctorChangeHashID", hash);
      localStorage.setItem("newDoctorAddress", newDoctor);
      setStatus("📨 Change doctor request submitted!");
    } catch (err) {
      console.error("Request failed:", err);
      setStatus("❌ Failed to request doctor change");
    }
  };

  const handleApplyDoctorChange = async () => {
    if (!changeDoctorHashID || !newDoctor) {
      alert("Missing hashID or new doctor address");
      return;
    }
    try {
      setStatus("⚙️ Applying doctor change...");
      const tx = await contract.applyDoctorChange(
        changeDoctorHashID,
        newDoctor
      );
      await tx.wait();
      setStatus("✅ Doctor change applied successfully!");
    } catch (err) {
      console.error("Apply doctor change failed:", err);
      setStatus("❌ Failed to apply doctor change");
    }
  };

  const handleRequestHospitalChange = async () => {
    if (!newHospital) {
      alert("Enter new hospital address");
      return;
    }

    try {
      setStatus("⏳ Requesting hospital change...");
      const tx = await contract.requestRoleChange(
        "changeHospital",
        newHospital
      );
      const receipt = await tx.wait();

      let hash = null;
      for (const event of receipt.events) {
        if (event.event === "SignRequestCreated") {
          hash = event.args.hashID;
          break;
        }
      }

      if (!hash) {
        console.error("Failed to extract hashID from event");
        return;
      }

      setChangeHospitalHashID(hash);
      localStorage.setItem("hospitalChangeHashID", hash);
      localStorage.setItem("newHospitalAddress", newHospital);
      setStatus("📨 Change hospital request submitted!");
    } catch (err) {
      console.error("Request failed:", err);
      setStatus("❌ Failed to request hospital change");
    }
  };

  const handleApplyHospitalChange = async () => {
    if (!changeHospitalHashID || !newHospital) {
      alert("Missing hashID or new hospital address");
      return;
    }
    try {
      setStatus("⚙️ Applying hospital change...");
      const tx = await contract.applyHospitalChange(
        changeHospitalHashID,
        newHospital
      );
      await tx.wait();
      setStatus("✅ Hospital change applied successfully!");
    } catch (err) {
      console.error("Apply hospital change failed:", err);
      setStatus("❌ Failed to apply hospital change");
    }
  };

  const handleCopyChangeDoctorHashID = async () => {
    if (changeDoctorHashID) {
      await navigator.clipboard.writeText(changeDoctorHashID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleCopyChangeHospitalHashID = async () => {
    if (changeHospitalHashID) {
      await navigator.clipboard.writeText(changeHospitalHashID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClearDoctorChange = () => {
    setNewDoctor("");
    setChangeDoctorHashID("");
    setSigCount(0);
    localStorage.removeItem("doctorChangeHashID");
    localStorage.removeItem("newDoctorAddress");
    setStatus("🧹 Cleared doctor change request");
  };

  const handleClearHospitalChange = () => {
    setNewHospital("");
    setChangeHospitalHashID("");
    setHospitalSigCount(0);
    localStorage.removeItem("hospitalChangeHashID");
    localStorage.removeItem("newHospitalAddress");
    setStatus("🧹 Cleared hospital change request");
  };

  // State to manage modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Function to open the modal
  const handleOpenModal = () => setIsModalOpen(true);

  // Function to close the modal
  const handleCloseModal = () => setIsModalOpen(false);

  const handleFetchRoles = async () => {
    if (!contract) return;
    try {
      const doctor = await contract.doctor();
      const patient = await contract.patient();
      const hospital = await contract.hospital();
      setAccountInfo({ doctor, patient, hospital });
      handleOpenModal();
      setStatus("✅ Fetched role addresses from contract");
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setStatus("❌ Failed to fetch role addresses");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <h3 className="text-3xl font-bold ">Hospital Actions</h3>

      <button
        onClick={handleFetchRoles}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        📋 View Current Role Addresses
      </button>

      {accountInfo.doctor && (
        <ViewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          doctor={accountInfo.doctor}
          hospital={accountInfo.hospital}
          patient={accountInfo.patient}
        />
      )}

      {/* {accountInfo.doctor && (
        <div className="bg-gray-100 p-4 rounded">
          <p>
            <strong>🧑‍⚕️ Doctor:</strong> {accountInfo.doctor}
          </p>
          <p>
            <strong>🏥 Hospital:</strong> {accountInfo.hospital}
          </p>
          <p>
            <strong>👤 Patient:</strong> {accountInfo.patient}
          </p>
        </div>
      )} */}

      <div className="space-y-2">
        <input
          type="text"
          value={hashID}
          onChange={(e) => setHashID(e.target.value)}
          placeholder="Enter HashID"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleSignRequest}
          disabled={!hashID}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          ✍️ Sign Request
        </button>
      </div>

      <hr className="my-4" />

      <div className="space-y-2">
        <h4 className="text-xl font-semibold ">Change Doctor</h4>
        <input
          type="text"
          value={newDoctor}
          onChange={(e) => {
            setNewDoctor(e.target.value);
            localStorage.setItem("newDoctorAddress", e.target.value);
          }}
          placeholder="Enter new doctor address"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRequestDoctorChange}
            disabled={!newDoctor}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50"
          >
            🔁 Request Doctor Change
          </button>
          <button
            onClick={handleApplyDoctorChange}
            disabled={!changeDoctorHashID || !newDoctor || sigCount < required}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            ✅ Apply Doctor Change
          </button>
          <button
            onClick={handleClearDoctorChange}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            🧹 Clear
          </button>
        </div>

        {changeDoctorHashID && (
          <>
            <div className="mt-2">
              <strong>ChangeDoctor HashID:</strong>{" "}
              <span className="break-all">{changeDoctorHashID}</span>
              <button
                onClick={handleCopyChangeDoctorHashID}
                className="ml-2 text-blue-600 hover:underline"
              >
                {copied ? "✅ Copied" : "📋 Copy"}
              </button>
            </div>
            <p>
              ✍️ Signature Progress: <strong>{sigCount}</strong> / {required}
            </p>
          </>
        )}
      </div>

      <hr className="my-4" />

      <div className="space-y-2">
        <h4 className="text-xl font-semibold ">Change Hospital</h4>
        <input
          type="text"
          value={newHospital}
          onChange={(e) => {
            setNewHospital(e.target.value);
            localStorage.setItem("newHospitalAddress", e.target.value);
          }}
          placeholder="Enter new hospital address"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRequestHospitalChange}
            disabled={!newHospital}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50"
          >
            🔁 Request Hospital Change
          </button>
          <button
            onClick={handleApplyHospitalChange}
            disabled={
              !changeHospitalHashID ||
              !newHospital ||
              hospitalSigCount < required
            }
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            ✅ Apply Hospital Change
          </button>
          <button
            onClick={handleClearHospitalChange}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            🧹 Clear
          </button>
        </div>

        {changeHospitalHashID && (
          <>
            <div className="mt-2">
              <strong>ChangeHospital HashID:</strong>{" "}
              <span className="break-all">{changeHospitalHashID}</span>
              <button
                onClick={handleCopyChangeHospitalHashID}
                className="ml-2 text-blue-600 hover:underline"
              >
                {copied ? "✅ Copied" : "📋 Copy"}
              </button>
            </div>
            <p>
              ✍️ Signature Progress: <strong>{hospitalSigCount}</strong> /{" "}
              {required}
            </p>
          </>
        )}
      </div>

      {status && <p className="text-sm text-gray-700 mt-4">{status}</p>}
    </div>
  );
}

export default HospitalActions;
