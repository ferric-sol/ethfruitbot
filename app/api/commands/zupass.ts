import { abi } from "../../abi/xDAI";
import { Bot, webhookCallback } from "grammy";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http, publicActions } from "viem";
import { gnosis } from "viem/chains";
import { Menu, MenuRange } from "@grammyjs/menu";


// Initialize bot
const token = process.env.TELEGRAM_API_KEY;
if (!token) throw new Error("TELEGRAM_API_KEY is unset");

const bot = new Bot(token);
export default webhookCallback(bot, "http");

// Menu gets intialized and has some values set
const menu = new Menu("zupass");

menu.dynamic(async (ctx) => {
  const range = new MenuRange();
  // const appUrl = `${process.env.VERCEL_URL}`;
  const appUrl = "https://zupass.org";
  const returnHost =
    process.env.NODE_ENV == "development"
      ? `https://06c4-2603-8080-d9f0-79b0-298c-f4a7-f8f-6412.ngrok.io`
      : `https://${process.env.VERCEL_URL}`;
  const returnUrl = `${returnHost}/api/zucheck/?username=${ctx.from?.username}&telegram_chat_id=${ctx.chat?.id}`;
  console.log("returnUrl: ", returnUrl);
  let proofUrl = await constructZupassPcdGetRequestUrl(
    appUrl,
    returnUrl,
    ZKEdDSAEventTicketPCDPackage.name,
    args,
    {
      genericProveScreen: true,
      title: "",
      description:
        "Fruitbot requests a zero-knowledge proof of your ticket to trade fruit",
    }
  );
  console.log("zupass url: ", proofUrl);
  range.webApp("Validate proof", proofUrl);
  return range;
});

// Zupass command
export default async function zupass() {
  console.log("in zupass");
  console.log("menu: ", menu);

  // Send the menu.
  bot.use(menu);
  bot.command("zupass", async (ctx) => {
    console.log("in zupass");
    console.log("menu: ", menu);
    // Send the menu.
    if (ctx.from?.id) {
      ctx.reply("Validate your proof and then use the menu to play:", {
        reply_markup: menu,
      });
      // TODO: Figure out why this doesn't work
      // await bot.api.sendMessage(
      //   ctx.chat?.id,
      //   "Validate your proof and then use the menu to play:",
      //   { reply_markup: menu }
      // );
    }
  });
}
