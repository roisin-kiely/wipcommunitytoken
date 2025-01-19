import React, { useState, useEffect, createContext } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WIP from "../lib/WIP.json";

export const WalletContext = createContext();

const Wallet = function ({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [canPost, setCanPost] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // For detecting mobile device

  const contractAddress = "0x61ca3ad28A9803d4bCD34D30001ac56A04Be7e37";

  useEffect(() => {
    setIsConnected(accounts.length > 0);
    fetchBalance();
    fetchPermissions();
    
    // Detect if the device is mobile
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, [accounts]);

  const connect = async function () {
    try {
      if (isMobile) {
        // Show message if on mobile
        alert("This is a prototype community. Mobile wallet connection is not yet supported.");
        return;
      }

      if (typeof window !== "undefined") {
        // Check if MetaMask is installed
        if (window.ethereum) {
          // Use window.ethereum to create the provider
          const provider = window.ethereum;
          await provider.request({ method: "eth_requestAccounts" });
          const newWeb3 = new Web3(provider);
          setWeb3(newWeb3);

          const accounts = await newWeb3.eth.getAccounts();
          setAccounts(accounts);
          const contractInstance = new newWeb3.eth.Contract(WIP.abi, contractAddress);
          setContract(contractInstance);
        } else {
          // Fall back to WalletConnect if MetaMask is not found
          const web3Modal = new Web3Modal({
            network: "sepolia",
            cacheProvider: true,
            providerOptions: {
              walletconnect: {
                package: WalletConnectProvider,
                options: {
                  alchemyId: process.env.ALCHEMY_API_KEY,
                },
              },
            },
          });

          const provider = await web3Modal.connect();
          const newWeb3 = new Web3(provider);
          setWeb3(newWeb3);

          const accounts = await newWeb3.eth.getAccounts();
          setAccounts(accounts);
          const contractInstance = new newWeb3.eth.Contract(WIP.abi, contractAddress);
          setContract(contractInstance);
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (error.message.includes("User denied transaction signature")) {
        alert("Transaction rejected. Please approve the transaction in your wallet.");
      } else if (error.message.includes("No Ethereum provider found")) {
        alert("No Ethereum provider detected. Please install MetaMask or another wallet.");
      } else {
        alert("An error occurred while connecting to the wallet. Please try again.");
      }
    }
  };

  const fetchBalance = async function () {
    if (web3 && accounts.length > 0 && contract) {
      try {
        const balance = await contract.methods.balanceOf(accounts[0]).call();
        setBalance(balance);
        console.log("Balance:", balance);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance(0);
      }
    }
  };

  const fetchPermissions = async function () {
    if (web3 && accounts.length > 0 && contract) {
      try {
        const userCanPost = await contract.methods.canPost(accounts[0]).call();
        const userCanComment = await contract.methods.canComment(accounts[0]).call();

        setCanPost(userCanPost);
        setCanComment(userCanComment);
        console.log("Permissions:", { canPost: userCanPost, canComment: userCanComment });
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setCanPost(false);
        setCanComment(false);
      }
    }
  };

  // Add post functionality
  const handleAddPost = async (description) => {
    try {
      if (!canPost) {
        alert("You need 100 $WIP tokens to post.");
        return;
      }

      const tx = await contract.methods.addPost(description).send({ from: accounts[0] });
      alert('Post added successfully!');
    } catch (error) {
      console.error("Error adding post:", error);
      alert('Failed to add post.');
    }
  };

  // Add comment functionality
  const handleAddComment = async (postId, commentText) => {
    try {
      if (!canComment) {
        alert("You need 25 $WIP tokens to comment.");
        return;
      }

      const tx = await contract.methods.addComment(postId, commentText).send({ from: accounts[0] });
      alert('Comment added successfully!');
    } catch (error) {
      console.error("Error adding comment:", error);
      alert('Failed to add comment.');
    }
  };

  const applyForWip = async () => {
    try {
      if (!accounts || accounts.length === 0) {
        alert("Please connect your wallet to apply.");
        return;
      }

      alert("This is a prototype community. Thank you for your application.");
      console.log("User has applied for WIP (prototype).");
    } catch (error) {
      console.error("Failed to apply for WIP:", error);
      alert('Failed to apply for WIP. Please try again.');
    }
  };

  const exp = {
    accounts,
    isConnected,
    connect,
    balance,
    canPost,
    canComment,
    contract,
    web3,
    fetchBalance,
    handleAddPost,
    handleAddComment,
    applyForWip,
  };

  return (
    <WalletContext.Provider value={exp}>
      {children}
    </WalletContext.Provider>
  );
}

export default Wallet;
