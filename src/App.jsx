import { useEffect } from "react";
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

export default function App() {
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

    console.log("blockNumber:", blockNumber.toString());
    console.log("chainId:", chainId);
    console.log("block:", stringify(block));
    console.log("balance:", balance.toString());
    console.log("transaction:", stringify(transaction));
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <button onClick={sendTransaction}>Send ETH </button>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
