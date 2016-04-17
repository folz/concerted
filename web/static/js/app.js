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

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
import {Socket, Presence} from "phoenix";

let socket = new Socket("/socket", {params: {}});
socket.connect();

let userList = document.getElementById('user-list');
let collective = document.getElementById('collective');
let room = socket.channel("rooms:lobby", {});
let presences = {};

let listBy = (id, {metas: [first, ...rest]}) => {
  first.name = id;
  first.jumping = first.ingroup || rest.some((e) => e.ingroup === true);
  return first;
}
let render = (presences) => {
  userList.innerHTML = Presence.list(presences, listBy)
    .map(user => `<li>${user.name}: ${user.jumping}</li>`)
    .join("")
}

room.on("ping", ping => {
  room.push("pong", "pong");
})

room.on("presence_state", state => {
  Presence.syncState(presences, state);
  render(presences);
});

room.on("presence_diff", diff => {
  Presence.syncDiff(presences, diff);
  render(presences);
});

room.on("concerted", counts => {
  let ratio = counts.ingroupers / counts.total * 200;
  collective.innerHTML = `
    <div class="progress">
      <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="${ratio}" aria-valuemin="0" aria-valuemax="50" style="width: ${ratio}%">
        <span class="sr-only">${ratio}% Complete</span>
      </div>
    </div>
  `;
});

room.join();

document.forms.isJumping.addEventListener('change', (e) => {
  if(e.target.name === 'jumping') {
    room.push("effort", {ingroup: e.target.value});
  }
})
