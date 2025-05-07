import React, { useState } from "react";
import { ethers } from "ethers";

function GetSepoliaBalance() {
  const [balanceInfo, setBalanceInfo] = useState({ address: "", eth: "" });

  const getMyEthBalance = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask is not available");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const balance = await provider.getBalance(address);
      const ethBalance = ethers.utils.formatEther(balance);

      setBalanceInfo({
        address,
        eth: ethBalance,
      });
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl w-full max-w-md mx-auto text-center space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        🔍 Check Sepolia ETH Balance
      </h3>

      <button
        onClick={getMyEthBalance}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        💰 Get ETH Balance
      </button>

      {balanceInfo.address && (
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
    </div>
  );
}

export default GetSepoliaBalance;
