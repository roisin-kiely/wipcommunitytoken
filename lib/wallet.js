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
  };

  return <WalletContext.Provider value={exp}>{children}</WalletContext.Provider>;
};

export default Wallet;
