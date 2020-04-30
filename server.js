import gpio from "rpi-gpio";
import _ from "lodash";
import { config as dotenv_config } from "dotenv";
import Telegraf, { Telegram } from "telegraf";

dotenv_config();
// console.log(`Your port is ${process.env.PORT}`); // 3000
const {
  MY_CHAT_ID,
  GATE_GROUP_CHAT_ID,
  BLYNK_AUTH_TOKEN,
  TELEGRAM_TOKEN,
} = process.env;
const telegraf = new Telegraf(TELEGRAM_TOKEN); // required for replying to messages
const telegram = new Telegram(TELEGRAM_TOKEN); // required for initiating conversation
var blynk = new Blynk.Blynk(BLYNK_AUTH_TOKEN);

const v10 = new blynk.VirtualPin(10);
const v11 = new blynk.VirtualPin(11);
const blynkRPiReboot = new blynk.VirtualPin(21); // Setup Reboot Button

async function setupBlynkPins() {
  v10.on("write", async function (param) {
    // const value = _.get(param, "[0]") !== "0";
    // turn HDMI on
    if (param === 1) {
      // Runs the CLI command if the button on V10 is pressed
      process.exec("tvservice -p", function (msg) {
        console.log(msg);
      });
    }
  });
  v11.on("write", async function (param) {
    // turn HDMI off
    if (param === 1) {
      // Runs the CLI command if the button on V10 is pressed
      process.exec("tvservice -o", function (msg) {
        console.log(msg);
      });
    }
  });
  blynkRPiReboot.on("write", function (param) {
    if (param === 1) {
      // Runs the CLI command if the button on V10 is pressed
      process.exec("sudo /sbin/reboot -r", function (msg) {
        console.log(msg);
      });
    }
  });
}

// function writePinFromBlynk({ pin, params }) {
//   const value = _.get(params, "[0]") !== "1";
//   // do something
// }

// async function readPinFromBlynk({ pin }) {
  // blynk.virtualWrite(4, value);
// }

async function setup() {
  await setupBlynkPins().catch(e => killProcess(e));
  setupTelegram().catch(e => killProcess(e));
}

// Telegram
async function setupTelegram() {
  telegraf.start((ctx) => {
    ctx.reply("Welcome!");
  });
  telegraf.use(async (ctx, next) => {
    const chat_id = _.get(ctx, "update.message.chat.id")  + "";
    if (chat_id && (chat_id === MY_CHAT_ID || chat_id === GATE_GROUP_CHAT_ID)) next();
    else if (chat_id)
      console.warn(
        `Telegram Message from unauthorized chat! Chat ID ${chat_id}`
      );
    else console.log('Message irrelevant to the bot')
  });
  telegraf.command("open", async (ctx) => {
    // ctx.reply("Gate is opening");
  });

  await telegraf.launch();
  let response = pickRandomFromArray([
    "I'm back online, how long was I out? Minutes? Days? Years???",
    "Reporting back online",
    "Corcen here, working as usual",
    "A lovely day to be back online again!",
  ])
  await sendTelegramAdminMessage(response);
}

async function sendTelegramGroupMessage(message) {
  await telegram.sendMessage(GATE_GROUP_CHAT_ID, message);
}

async function sendTelegramAdminMessage(message) {
  await telegram.sendMessage(MY_CHAT_ID, message);
}

//

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function killProcess(msg) {
  console.log('killing process', msg)
  process.kill(process.pid, 'SIGTERM')
}

setup().catch((e) => console.log("err in setup", e));
