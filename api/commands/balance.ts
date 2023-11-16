import { abi } from "../../abi/xDAI";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, publicActions } from "viem";
import { gnosis } from "viem/chains";
import formatEtherTg from "../../utils/format";

export default async function getBalance(address: string) {
  // Get the faucet EOA account
  if(!process.env.FRUITBOT_FAUCET_KEY) return false;

  const tokenAddresses = { 
    Salt: "0x2A1367AC5F5391C02eca422aFECfCcEC1967371D",
    Apple: "0x48D1c60e807E340359ea1253Be4F2e60f9c65A36",
    Avocado: "0x243B401EE5EE4ABA8bF3b36352a48e664DA3Bca8",
    Banana: "0xFA814FC24256206fC25E927f8Af05cCD57C577d4",
    Lemon: "0x0D5854b5C10543c05c0bb4341d2bDFBa87F28E8f",
    Strawberry: "0xE8edFc3DaA1584f9586CD4472D29bfD0679DE9D5",
    Tomato: "0xEE6339d05625442d251AC367C9EcFC664C38A290",
  }

  const account = privateKeyToAccount(
    `0x${process.env.FRUITBOT_FAUCET_KEY}`
  );

  // Initialize the viem client
  const client = createWalletClient({
    account,
    chain: gnosis,
    transport: http(process.env.GNOSIS_URL),
  }).extend(publicActions);

  const balances = [];
  for(let tokenName of Object.keys(tokenAddresses)) {
    // Call `balanceOf` on SALT contract
    let tokenAddress = tokenAddresses[tokenName];
    console.log(address);
    console.log(tokenAddress);
    const data = await client.readContract({
      address: tokenAddress, 
      abi,
      functionName: "balanceOf",
      args: [address],
    });
    if (tokenName === "Salt") tokenName = "Credit";
    console.log('data: ', formatEtherTg(data));
    if(formatEtherTg(data) !== '0.0000') balances[tokenName] = formatEtherTg(data);
  }    

  return balances;
}