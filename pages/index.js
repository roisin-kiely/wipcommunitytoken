import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import { WalletContext } from "../lib/wallet";

// Import SendForm from components folder if it exists
import SendForm from '../components/SendForm'; // Adjust the path if needed
import EthName from '../components/EthName'; // Ensure EthName is also imported if used
import Price from '../components/Price'; // Ensure Price is also imported if used

// Ensure metadata is imported correctly
import metadata from '../public/data/metadata.json'; // Adjust the path if needed

// Import the Post component
import Post from '../components/Post'; // Ensure the Post component is correctly imported

function App() {
  const { isConnected, accounts, connect, balance, canPost, canComment, applyForWip } = useContext(WalletContext);
  const [toggleSendForm, setToggleSendForm] = useState(false);

  useEffect(() => {
    if (toggleSendForm) {
      document.body.classList.add("send-form");
    } else {
      document.body.classList.remove("send-form");
    }
  }, [toggleSendForm]);

  const applyForWipLink = (
    <a href="#" onClick={applyForWip}>Apply for $WIP</a>
  );

  const toggleForm = e => {
    e.preventDefault();
    setToggleSendForm(!toggleSendForm);
  };

  return (
    <>
      <Head>
        <title>W-I-P</title>
      </Head>

      <header>
        <h1>W<span>&mdash;</span>I<span>&mdash;</span>P</h1>

        {isConnected ? (
          <nav className="connected">
            <EthName address={accounts[0]} />
            <Price base={balance} />
            {canPost ? (
              <a href="#">Post</a>
            ) : (
              applyForWipLink
            )}

            {balance > 0 ? (
              <a href="#" onClick={toggleForm}>Send $WIP</a>
            ) : ""}
          </nav>
        ) : (
          <nav>
            {applyForWipLink}
            <a href="#" className="primary-action" onClick={connect}>Connect wallet</a>
          </nav>
        )}
      </header>

            {showPrototypeMessage && (
        <div className="prototype-message">
          <p>This is a prototype version of our site. We’re testing and building, and your feedback is invaluable. Stay tuned for future updates and enhancements!" </p>
        </div>
      )}

      <SendForm toggle={toggleSendForm} /> {/* Conditionally render SendForm based on toggle */}

      <main>
        {metadata.map((data, index) => {
          return <Post data={data} key={index} />;
        })}
      </main>
    </>
  );
}

export default App;
