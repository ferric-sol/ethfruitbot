import { privateKeyToAccount } from "viem/accounts";
import {
  createWalletClient,
  http,
  publicActions,
  parseEther,
  formatEther,
  decodeEventLog,
} from "viem";
import { gnosis } from "viem/chains";
import { contracts } from "../contracts";
import { createClient } from "@vercel/kv";
import gnosisLink from "../gnosis";
import formatEtherTg from "../../utils/format";
import { Context } from "grammy";

// Before the function can be executed, we need to connect to the user's wallet

// Initialize kv database
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// This function allows users to sell a Fruit token for salt
export default async function sell(
  tokenName: string,
  amount: number,
  username: string,
  ctx: Context
) {
  // Connect to the user's wallet
  const keys = await kv.get(`user:${username}`);
  const account = privateKeyToAccount(keys.privateKey);

  // Format fruit token's DEX name from input
  const dexContractName: string = `BasicDex${tokenName}`;

  // Initialize the viem client using the user's private key in kv db
  const client = createWalletClient({
    account,
    chain: gnosis,
    transport: gnosisLink(),
    // transport: http(process.env.GNOSIS_URL),
  }).extend(publicActions);

  // Connect contract objects to variables
  // TODO: TSify this using types from
  // https://github.com/BuidlGuidl/event-wallet/blob/08790b0d8f070b22625b1fadcd312988a70be825/packages/nextjs/utils/scaffold-eth/contract.ts#L7
  let tokenContract;
  let fruitContract;
  try {
    tokenContract = (contracts as any)[`${dexContractName}`];
    fruitContract = (contracts as any)[`${tokenName}Token`];
    //console.log("tokenContract:", tokenContract);
  } catch (error) {
    console.log("error:", error);
  }

  if (!tokenContract || !fruitContract) {
    //throw new Error(`Token ${tokenName} not found in contracts`);
    return `Token "${tokenName}" not found in contracts`;
  }

  /* Before we do anything, we need to ensure that the user has enough fruit tokens to sell the inputted amount */
  const fruitBalance = await client.readContract({
    address: fruitContract.address,
    abi: fruitContract.abi,
    functionName: "balanceOf",
    args: [keys.address],
  });
  console.log("fruit balance:", fruitBalance);

  // Format input amount
  let fruit;
  if (amount == "all" || amount == "max") {
    fruit = fruitBalance;
  } else {
    fruit = parseEther(amount);
  }
  console.log("fruit:", fruit);

  // If you don't have enough fruit, return a message saying so
  if (fruitBalance < fruit) {
    return "Insufficient fruit balance";
  } else if (fruitBalance <= 0) {
    if (tokenName == "tomato" || tokenName == "Tomato") {
      return `You don't have any ${tokenName}es!`;
    } else {
      return `You don't have any ${tokenName}s!`;
    }
  }

  // Get price of fruit token in fruit
  const price = await client.readContract({
    address: tokenContract.address,
    abi: tokenContract.abi,
    functionName: "assetInPrice",
    args: [parseEther("1")],
  });
  console.log("price:", price);

  // Use `price` to calculate min value out
  // assetToCredit(fruit in, credits out)
  //
  const salt =
    parseInt(
      await client.readContract({
        address: tokenContract.address,
        abi: tokenContract.abi,
        functionName: "assetInPrice",
        args: [fruit],
      })
    ) * 0.95;
  //const salt = (parseInt(fruit) * parseInt(price)) / 1e18;
  console.log("parsed price:", parseInt(price));
  console.log("parsed ether:", fruit);
  console.log("salt:", salt);

  // Calculate minimum salt token amount to receive (temporarily hard-coded to 95% of original value which is 5% slippage)
  const minOut = salt * 0.95;
  console.log("minOut:", minOut);
  // const minOutParsed = parseEther(minOut.toString());

  /**  Before swapping the tokens, we need to approve the DEX to take our fruit

- Check allowance for fruit dex, then approve the difference between fruit input and allowance value
- This way fruit is only approved if needed
  */

  // View current allownance
  const allowance = await client.readContract({
    address: fruitContract.address,
    abi: fruitContract.abi,
    functionName: "allowance",
    args: [keys.address, tokenContract.address],
  });
  console.log("allowance:", allowance);

  // If you are trying to give the fruit contract more fruit than you currently have approved it to take
  // we need to approve it to take the additional fruit
  console.log("fruit:", fruit);
  if (fruit > allowance) {
    await ctx.reply("Approving Transaction...");
    console.log(
      `Approving ${tokenName} Dex for ${formatEtherTg(fruit - allowance)} fruit`
    );
    const approveTx = await client.writeContract({
      address: fruitContract.address,
      abi: fruitContract.abi,
      functionName: "approve",
      args: [tokenContract.address, 1e50],
    });
    const transaction = await client.waitForTransactionReceipt({
      hash: approveTx,
    });
    await ctx.reply("✅ Transaction Approved!");
    console.log("approveTx:", approveTx);
  }

  // Simulate the transaction before actually sending it
  try {
    await ctx.reply("Swapping assets...");
    const { request } = await client.simulateContract({
      account,
      address: tokenContract.address,
      abi: tokenContract.abi,
      functionName: "assetToCredit",
      args: [fruit, minOut],
    });

    const hash = await client.writeContract(request);
    // if tx went through view the receipt for amount of fruit token received
    if (hash) {
      const transaction = await client.waitForTransactionReceipt({ hash });
      console.log("hash:", hash.toString());
      console.log(
        "transaction:",
        JSON.stringify(transaction, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      );
      console.log(
        "value purchased: ",
        decodeEventLog({
          abi: tokenContract.abi,
          data: transaction.logs[transaction.logs.length - 1].data,
          topics: transaction.logs[transaction.logs.length - 1].topics,
        })
      );
      const valueReceivedLog = decodeEventLog({
        abi: tokenContract.abi,
        data: transaction.logs[transaction.logs.length - 1].data,
        topics: transaction.logs[transaction.logs.length - 1].topics,
      });
      const valueReceived = formatEtherTg(
        valueReceivedLog.args._tokensReceived
      );
      // setReceipt(receipt);

      // const transaction = await client.getTransactionReceipt({
      //   hash: hash,
      // });
      // console.log("tx data:", transaction);
      await ctx.reply("✅ Assets Swapped!");
      return [
        `Successfully swapped ${formatEtherTg(
          fruit
        )} ${tokenName} for ${valueReceived} Salt`,
        `Transaction hash: ${hash}`,
      ];
    }
  } catch (error) {
    console.log("error:", error.message);
    return error.message;
  }
}
