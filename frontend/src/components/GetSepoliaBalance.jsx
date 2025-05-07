import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function GetSepoliaBalance({ walletAddress }) {
  const [balanceInfo, setBalanceInfo] = useState({ address: "", eth: "" });
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      getMyEthBalance();
    }
  }, [walletAddress]);

  const getMyEthBalance = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask is not available");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(walletAddress);
      const ethBalance = ethers.utils.formatEther(balance);

      setBalanceInfo({
        address: walletAddress,
        eth: ethBalance,
      });
      setShowBalance(false);
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl w-full max-w-md mx-auto text-center space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        🔍 Check Sepolia ETH Balance
      </h3>

      {balanceInfo.address && (
        <>
          <button
            onClick={() => setShowBalance((prev) => !prev)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-xl transition duration-300"
          >
            {showBalance ? "🔼 Hide Balance" : "🔽 Show Balance"}
          </button>

          {showBalance && (
            <div className="pt-4 border-t text-left space-y-1 text-gray-700">
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {balanceInfo.address}
              </p>
              <p>
                <span className="font-semibold">ETH:</span> {balanceInfo.eth}{" "}
                Sepolia ETH
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GetSepoliaBalance;
