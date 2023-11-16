
import { constructZupassPcdGetRequestUrl } from "@pcd/passport-interface";
import {
  EdDSATicketFieldsToReveal,
  ZKEdDSAEventTicketPCDArgs,
  ZKEdDSAEventTicketPCDPackage,
} from "@pcd/zk-eddsa-event-ticket-pcd";
import { EdDSATicketPCDPackage } from "@pcd/eddsa-ticket-pcd";
import { Menu, MenuRange } from "@grammyjs/menu";
import { ArgumentTypeName } from "@pcd/pcd-types";
import { SemaphoreIdentityPCDPackage } from "@pcd/semaphore-identity-pcd";

export const DEVCONNECT_VALID_EVENT_IDS = [
  "785e8a0e-6734-11ee-b810-a2b83754f6bc", // AW Assembly
  "0996f5fa-6736-11ee-a3bd-a2b83754f6bc", // Programmable Cryptography
  "f626d630-2f8a-11ee-be83-b2dd9fd377ba", // 0xPARC Event
  "a1c822c4-60bd-11ee-8732-763dbf30819c", // Devconnect Cowork Space
  "3049870c-6cc8-11ee-98f3-7ebd6aca95cd", // Solidity Summit
  "aebcb892-69e5-11ee-b65e-a2b83754f6bc", // EVM Summit
  "7b57a8fc-6bae-11ee-bf2a-9e102a509962", // ETHconomics
  "e1423686-6cc7-11ee-98f3-7ebd6aca95cd", // Next Billion
  "140b208c-6d1d-11ee-8320-126a2f5f3c5e", // Wallet Unconference
   "b03bca82-2d63-11ee-9929-0e084c48e15f" // TEST event
];

export function zupass_menu () { 
  // Initialize zupass menu
  const menu = new Menu("zupass");

  // Define EdDSA fields that will be exposed
  const fieldsToReveal: EdDSATicketFieldsToReveal = {
    revealTicketId: false,
    revealEventId: false,
    revealProductId: false,
    revealTimestampConsumed: false,
    revealTimestampSigned: false,
    revealAttendeeSemaphoreId: true,
    revealIsConsumed: false,
    revealIsRevoked: false,
  };

  // Define ZK edDSA PCD arguments
  const args: ZKEdDSAEventTicketPCDArgs = {
    ticket: {
      argumentType: ArgumentTypeName.PCD,
      pcdType: EdDSATicketPCDPackage.name,
      value: undefined,
      userProvided: true,
      displayName: "Your Ticket",
      description: "",
      validatorParams: {
        eventIds: [],
        productIds: [],
        // TODO: surface which event ticket we are looking for
        notFoundMessage: "You don't have a ticket to this event.",
      },
      hideIcon: true,
    },
    identity: {
      argumentType: ArgumentTypeName.PCD,
      pcdType: SemaphoreIdentityPCDPackage.name,
      value: undefined,
      userProvided: true,
    },
    fieldsToReveal: {
      argumentType: ArgumentTypeName.ToggleList,
      value: fieldsToReveal,
      userProvided: false,
      hideIcon: true,
    },
    externalNullifier: {
      argumentType: ArgumentTypeName.BigInt,
      value: undefined,
      userProvided: false,
    },
    validEventIds: {
      argumentType: ArgumentTypeName.StringArray,
      value: DEVCONNECT_VALID_EVENT_IDS,
      userProvided: false,
    },
    watermark: {
      argumentType: ArgumentTypeName.BigInt,
      value: Date.now().toString(),
      userProvided: false,
      description: `This encodes the current timestamp so that the proof can grant funds via faucet when appropriate.`,
    },
  };

  // Set menu variables
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

  return menu;
}

export function handle_zuconnect(ctx, bot, menu) { 
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
  //await zupass();
}