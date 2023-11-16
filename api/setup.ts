
import { Bot } from "grammy";

const token = process.env.TELEGRAM_API_KEY;
if (!token) throw new Error("TELEGRAM_API_KEY is unset");

const bot = new Bot(token);

export default async function setup() { 
  await bot.api.setMyCommands([
    { command: "start", description: "Start the fruit game, prove your identity with zupass and create a fully funded wallet" },
    { command: "balance", description: "Get your credit balance" },
    { command: "prices", description: "Get fruit prices" },
    { command: "buy", description: "Buy <number> <fruit>" },
    { command: "sell", description: "Sell <number> <fruit>" },
    //    { contractName: "AvocadoToken", name: "Avocado", emoji: "🥑" },
    //  { contractName: "BananaToken", name: "Banana", emoji: "🍌" },
    //  { contractName: "TomatoToken", name: "Tomato", emoji: "🍅" },
    //  { contractName: "StrawberryToken", name: "Strawberry", emoji: "🍓" },
    //  { contractName: "AppleToken", name: "Apple", emoji: "🍏" },
    //  { contractName: "LemonToken", name: "Lemon", emoji: "🍋" },
  ]);
}

setup();
