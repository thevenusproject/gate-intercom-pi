import _ from "lodash";
import { config as dotenv_config } from "dotenv";
import Blynk from "blynk-library";
// import Telegraf, { Telegram } from "telegraf";
import {exec} from 'child_process';
import {init} from "./sipHelper";
dotenv_config();

const {
  BLYNK_AUTH_TOKEN,
  BLYNK_SERVER
} = process.env;

// const telegraf = new Telegraf(TELEGRAM_TOKEN); // required for replying to messages
// const telegram = new Telegram(TELEGRAM_TOKEN); // required for initiating conversation
var blynk;

async function setupBlynkPins() {
  const v10 = new blynk.VirtualPin(10);
  const v11 = new blynk.VirtualPin(11);
  const blynkRPiReboot = new blynk.VirtualPin(21); // Setup Reboot Button
  blynk = new Blynk.Blynk(BLYNK_AUTH_TOKEN, {
    connector : new Blynk.TcpClient( { addr: BLYNK_SERVER, port: 8080 } )  // This takes all the info and directs the connection to you Local Server.
  });
  v10.on("write", async function (param) {
    // const value = _.get(param, "[0]") !== "0";
    // turn HDMI on
    if (param[0] === '1') {
      // Runs the CLI command if the button on V10 is pressed
      exec("tvservice -p", function (err, stdout, stderr) {
        console.log(stdout);
      });
    }
  });
  v11.on("write", async function (param) {
    // turn HDMI off
    if (param[0] === '1') {
      // Runs the CLI command if the button on V11 is pressed
      exec("tvservice -o", function  (err, stdout, stderr) {
        console.log(stdout);
      });
      await sleep(3000);
      exec("sudo /bin/chvt 2", function  (err, stdout, stderr) {
        console.log(stdout);
      });
    }
  });
  blynkRPiReboot.on("write", function (param) {
    if (param[0] === '1') {
      // Runs the CLI command if the button on V21 is pressed
      exec("sudo /sbin/reboot", function  (err, stdout, stderr) {
        if (err) console.log(stderr)
        else console.log(stdout);
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
}


function killProcess(msg) {
  console.log('killing process', msg)
  process.kill(process.pid, 'SIGTERM')
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

setup().catch((e) => console.log("err in setup", e));
