import { useState, useEffect } from "react";

function MetamaskButton({ onWalletConnected }) {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          onWalletConnected(accounts[0]);
        } else {
          setWalletAddress(null);
          onWalletConnected(null);
        }
      });
    }
  }, []);

  async function checkIfWalletIsConnected() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        onWalletConnected(accounts[0]);
      }
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      onWalletConnected(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }

  return (
    <div>
      {walletAddress ? (
        <></>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-300 shadow-md flex items-center gap-2"
        >
          🦊 Connect MetaMask
        </button>
      )}
    </div>
  );
}

export default MetamaskButton;
