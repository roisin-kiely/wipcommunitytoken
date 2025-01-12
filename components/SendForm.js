import { useState, useContext } from 'react';
import { WalletContext } from '../lib/wallet';

const SendForm = function ({}) {
  const [ethAddress, setEthAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [errorMessage, setErrorMessage] = useState("");

  const { accounts, web3, contract, fetchBalance } = useContext(WalletContext);

  const sendWip = async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Reset error message before each transaction attempt
    setErrorMessage("");

    // Validate Ethereum address
    if (!web3.utils.isAddress(ethAddress)) {
      setErrorMessage("Invalid Ethereum address.");
      return;
    }

    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    try {
      const cents = web3.utils.toWei(amount, 'ether'); // Convert to Wei

      await contract.methods.transfer(ethAddress, cents).send({ from: accounts[0] });
      alert("Transaction successful!");
      setAmount("0"); // Reset the amount field after successful transfer
      fetchBalance(); // Update balance after the transaction
    } catch (error) {
      console.error("Error during transfer:", error);
      setErrorMessage("Transaction failed. Please try again.");
    }
  };

  return (
    <form onSubmit={sendWip}>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>} {/* Display error message */}
      
      <div>
        <label>Address</label>
        <input
          type="text"
          value={ethAddress}
          onChange={(e) => setEthAddress(e.target.value)}
        />
      </div>
      <div>
        <label>Amount of $WIP</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button type="submit">Send</button>
    </form>
  );
};

export default SendForm;
