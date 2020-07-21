import * as JsSIP from 'jssip'
import {sleep} from "./server"
import { config as dotenv_config } from "dotenv";
dotenv_config();

const {
  SIP_SERVER_URI,
  SIP_USER,
  SIP_PASSWORD
} = process.env;

export async function init() {
  var socket = new JsSIP.WebSocketInterface(`ws://${SIP_SERVER_URI}`);
  console.log('socket', socket)
  // console.log('JsSIP', JsSIP)
  var configuration = {
    sockets  : [ socket ],
    uri      : `sip:${SIP_USER}@${SIP_SERVER_URI}`,
    password : SIP_PASSWORD
  };

  var ua = new JsSIP.UA(configuration);
  ua.on('connected', function(e){
    console.log('ua connected');

  });

  ua.start();

// Register callbacks to desired call events
  var eventHandlers = {
    'progress': function(e) {
      console.log('call is in progress');
    },
    'failed': function(e) {
      console.log('call failed with cause: '+ e.data.cause);
    },
    'ended': function(e) {
      console.log('call ended with cause: '+ e.data.cause);
    },
    'confirmed': function(e) {
      console.log('call confirmed');
    }

  };

  var options = {
    'eventHandlers'    : eventHandlers,
    'mediaConstraints' : { 'audio': true, 'video': false }
  };

  var session = ua.call('sip:103@192.168.2.32', options);
  while (true) {
    await sleep(10000)
    console.log('in while')
  }
}
