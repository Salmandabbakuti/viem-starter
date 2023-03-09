import { useEffect } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import "./styles.css";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
});

export default function App() {
  const getData = async () => {
    const blockNumber = await publicClient.getBlockNumber();
    console.log("blockNumber:", blockNumber.toString());
    const balance = await publicClient.getBalance({
      address: "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e"
    });
    console.log("balance:", balance.toString());

    const block = await publicClient.getBlock();
    console.log("block:", block)

    const chainId = await publicClient.getChainId();
    console.log("chainId:", chainId);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
