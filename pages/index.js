import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import { WalletContext } from "../lib/wallet";

// Import components
import SendForm from '../components/SendForm';
import EthName from '../components/EthName';
import Price from '../components/Price';
import metadata from '../public/data/metadata.json';
import Post from '../components/Post';

function App() {
  const { isConnected, accounts, connect, balance, canPost, canComment, applyForWip } = useContext(WalletContext);
  const [toggleSendForm, setToggleSendForm] = useState(false);
  const [showPrototypeMessage, setShowPrototypeMessage] = useState(false);  // State to show the prototype message

  useEffect(() => {
    if (toggleSendForm) {
      document.body.classList.add("send-form");
    } else {
      document.body.classList.remove("send-form");
    }
  }, [toggleSendForm]);

  const applyForWipLink = (
    <a href="#" onClick={() => { 
        applyForWip(); 
        setShowPrototypeMessage(true);  // Show the prototype message when clicked
    }}>
      Apply for $WIP
    </a>
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

      <SendForm toggle={toggleSendForm} /> {/* Conditionally render SendForm */}

      <main>
        {metadata.map((data, index) => {
          return <Post data={data} key={index} />;
        })}
      </main>
    </>
  );
}

export default App;
