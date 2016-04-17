// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html";
import {Gauge} from "./gauge.min";

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
import {Socket, Presence} from "phoenix";
import Shake from 'shake.js';

let socket = new Socket("/socket", {params: {}});
socket.connect();

let userList = document.getElementById('user-list');
let shaked = document.getElementById('shaked');
let gaugeElem = document.getElementById('gauge');
let room = socket.channel("rooms:lobby", {});
let presences = {};
let timeout;

let opts = {
  lines: 12, // The number of lines to draw
  angle: 0.15, // The length of each line
  lineWidth: 0.44, // The line thickness
  pointer: {
    length: 0.9, // The radius of the inner circle
    strokeWidth: 0.035, // The rotation offset
    color: '#000000' // Fill color
  },
  limitMax: 'false',   // If true, the pointer will not go past the end of the gauge
  percentColors: [[0.0, "#ff0000"], [0.70, "#f9c802"], [1.0, "#23df1e"]],
  colorStart: '#6FADCF',   // Colors
  colorStop: '#8FC0DA',    // just experiment with them
  strokeColor: '#E0E0E0',   // to see which ones work best for you
  generateGradient: true
};

let gauge = new Gauge(gaugeElem).setOptions(opts);
gauge.maxValue = 100;
gauge.animationSpeed = 8;
gauge.set(0);

room.on("ping", ping => {
  room.push("pong", "pong");
})

room.on("presence_state", state => {
  Presence.syncState(presences, state);
});

room.on("presence_diff", diff => {
  Presence.syncDiff(presences, diff);
});

room.on("concerted", counts => {
  let ratio = counts.ingroupers / counts.total * 200;
  if (gauge.value !== ratio) {
    gauge.set((ratio || 1));
  }

  console.log("ratio is", ratio);

  if (ratio >= 100) {
    document.body.className = "ingroup";
  } else {
    document.body.className = "";
  }
});

room.join();

let shake = new Shake({threshold: 3});
shake.start();

window.addEventListener("shake", (e) => {
  room.push("effort", {ingroup: true});
  clearTimeout(timeout);
  timeout = setTimeout(stopShaking, 3000);
}, false);

let stopShaking = () => {
  room.push("effort", {ingroup: false});
}

if(!("DeviceOrientationEvent" in window) || window.DeviceOrientationEvent === null) {
  alert("Not Supported");
}
