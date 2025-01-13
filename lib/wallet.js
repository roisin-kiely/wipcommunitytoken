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

  const contractAddress = "0x61ca3ad28A9803d4bCD34D30001ac56A04Be7e37";

  useEffect(() => {
    setIsConnected(accounts.length > 0);
    fetchBalance();
    fetchPermissions();
  }, [accounts]);

  const connect = async function () {
    try {
      if (typeof window !== "undefined") {
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
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("An error occurred while connecting to the wallet. Please try again.");
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
      // Check if wallet is connected
      if (!accounts || accounts.length === 0) {
        alert("This is a prototype community. Thank you for your application.");
        return;
      }
  
      // Show the prototype message for the community
      alert("This is a prototype community. Thank you for your application.");
      console.log("User has applied for WIP (prototype).");
  
      // If you had minting logic here, it would be handled too, but we're just showing the popup
      // const tx = await contract.methods.mint(accounts[0], 25 * 10 ** 18).send({ from: accounts[0] });
  
    } catch (error) {
      if (error.message.includes("User denied transaction signature")) {
        // Specific error for when the user denies the transaction signature in MetaMask
        console.error("Transaction rejected by user:", error);
        alert("Transaction was canceled. Please approve the transaction in MetaMask to continue.");
      } else if (error.message.includes("MetaMask is not installed") || error.message.includes("No Ethereum provider found")) {
        // Handle case where MetaMask is not installed or provider is missing
        alert("MetaMask is not installed or connected. Please install MetaMask or connect your wallet.");
      } else {
        // Handle any other errors
        console.error("Failed to apply for WIP:", error);
        alert('Failed to apply for WIP. Please try again.');
      }
    }
  };
  
  

  // Add the context value for your component
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
    applyForWip, // Adding this here for access to "apply for WIP"
  };

  return (
    <WalletContext.Provider value={exp}>
      {children}
    </WalletContext.Provider>
  )
}

export default Wallet;
