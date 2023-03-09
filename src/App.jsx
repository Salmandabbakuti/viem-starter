import { useEffect, useState } from "react";
import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  getAccount,
  parseEther,
  stringify
} from "viem";
import { mainnet, goerli } from "viem/chains";
import "./styles.css";

const publicClient = createPublicClient({
  // chain: goerli,
  // transport: http()
  transport: custom(window.ethereum)
});

const walletClient = createWalletClient({
  transport: custom(window.ethereum)
});

const contract = {
  abi: [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "method",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "Count",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "count",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decrement",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "increment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  address: "0x1064191A9b2981CC3Af7038E1c4F24B244bb8152"
};

export default function App() {
  const [count, setCount] = useState(0);
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [logMessage, setLogMessage] = useState("");

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        setLogMessage("");
        const chainId = await publicClient.getChainId();
        console.log("chainId:", chainId);
        if (chainId !== 80001) {
          // switch to polygon testnet
          await walletClient.switchChain({ id: 80001 });
        }
        const [address] = await walletClient.requestAddresses();
        setAddress(address);
        setIsConnected(true);
        publicClient.watchContractEvent({
          ...contract,
          eventName: 'Count',
          onLogs: log => {
            console.log(log);
          },
          onError: error => {
            console.log(error);
          }
        });
      } catch (err) {
        console.log("Error in connecting wallet:", err);
        setLogMessage(err.message);
      }
    } else {
      alert("Please install Metamask");
    }
  };
  const signMessage = async () => {
    const [address] = await walletClient.getAddresses();
    const account = getAccount(address);
    const signature = await walletClient.signMessage({
      account,
      data: "Hello there, viem!"
    });

    console.log("signature:", signature);
  };
  const sendTransaction = async () => {
    // const [address] = await walletClient.getAddresses();
    const [address] = await walletClient.requestAddresses();
    const account = getAccount(address); // like signer for transactions

    const hash = await walletClient.sendTransaction({
      account,
      to: "0xc2009D705d37A9341d6cD21439CF6B4780eaF2d7",
      value: parseEther("0.001")
    });

    console.log("sent tx hash:", hash);
  };
  const getData = async () => {
    // const [address] = await walletClient.getAddresses();
    const [address] = await walletClient.requestAddresses();
    // const account = getAccount(address); // like signer for transactions

    const blockNumber = await publicClient.getBlockNumber();
    const balance = await publicClient.getBalance({
      address
    });
    const block = await publicClient.getBlock();
    const chainId = await publicClient.getChainId();
    const transaction = await publicClient.getTransaction({
      hash: block.transactions[0]
    });
    const count = await publicClient.readContract({
      ...contract,
      functionName: "count"
    });
    console.log("count:", count);
    setCount(count.toString());

    console.log("blockNumber:", blockNumber.toString());
    console.log("chainId:", chainId);
    console.log("block:", stringify(block));
    console.log("balance:", balance.toString());
    console.log("transaction:", stringify(transaction));
  };

  useEffect(() => {
    getData();
  }, [isConnected]);

  const handleIncrement = async () => {
    try {
      const account = getAccount(address); // like signer for transactions
      const { request } = await publicClient.simulateContract({
        ...contract,
        functionName: "increment",
        account
      });
      await walletClient.writeContract(request);
    } catch (err) {
      console.log("Error in increment:", err);
      setLogMessage(err.message);
    }
  };

  const handleDecrement = async () => {
    try {
      const account = getAccount(address); // like signer for transactions
      const { request } = await publicClient.simulateContract({
        ...contract,
        functionName: "decrement",
        account
      });
      await walletClient.writeContract(request);
    } catch (err) {
      console.log("Error in decrement:", err);
      setLogMessage(err.message);
    }
  };

  return (
    <div className="App">
      <h1>Counter Dapp</h1>
      {
        isConnected ? (
          <>
            <h4>Current Count: {count}</h4>
            {/* increment and decrement buttons */}
            <button onClick={handleIncrement}>Increment</button>
            <button onClick={handleDecrement}>Decrement</button>
            <br />
            <button onClick={sendTransaction}>Send ETH </button>
            <button onClick={signMessage}>Sign</button></>
        ) : (
          <button onClick={handleConnectWallet}>Connect Wallet</button>
        )
      }

      <footer style={{ marginTop: "2rem" }}>
        {logMessage && (<p>{logMessage}</p>)}
        <hr />
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          © {new Date().getFullYear()} Salman Dabbakuti. Powered by viem
        </a>
      </footer>
    </div>
  );
};
