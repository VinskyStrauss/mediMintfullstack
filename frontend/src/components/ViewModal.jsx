import React, { useEffect, useState } from "react";

const ViewModal = ({ isOpen, onClose, doctor, patient, hospital }) => {
  const [accountInfo, setAccountInfo] = useState({
    doctor: "",
    patient: "",
    hospital: "",
  });

  useEffect(() => {
    setAccountInfo({ doctor, patient, hospital });

    // Optional: Disable scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Reset on unmount
    };
  }, [doctor, patient, hospital, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-6 rounded-lg w-1/3 z-60 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ❌
        </button>

        <div className="bg-gray-100 p-4 rounded space-y-2">
          <p className="text-m text-black">
            <strong>🧑‍⚕️ Doctor:</strong> {accountInfo?.doctor}
          </p>
          <p className="text-m text-black">
            <strong>🏥 Hospital:</strong> {accountInfo?.hospital}
          </p>
          <p className="text-m text-black">
            <strong>🧍 Patient:</strong> {accountInfo?.patient}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
