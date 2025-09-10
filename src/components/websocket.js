class Websoc {
  #listener;
  #sender;
  #websocket;
  #senderTem;
  #uids;
  #websocketurl;
  //在这里打断点可能会导致debug错误，然后浏览器打不开页面， 这是为啥？
  constructor(websoc_url) {
    //Id,method,callback
    this.#listener = [];
    //Id,resolve,time
    this.#sender = [];
    this.#senderTem = [];
    this.#uids = [];
    this.#websocketurl = websoc_url;
    this.#websocket = null;
    setInterval(() => {
      let now = Date.now();
      for (let i = 0; i < this.#sender.length; ) {
        if (now - this.#sender[i].time > 120000) {
          let resp = {
            is_success: false,
            msg: "超时！",
          };
          this.#backId(this.#sender[i].uid);
          this.#sender[i].resolve(resp);
          this.#sender.splice(i, 1);
        } else {
          ++i;
        }
      }
    }, 120000);
    this.createWebsocket();
  }
  //   addListener(id, method, callback) {
  //     this.#listener.push({
  //       id: id,
  //       method: method,
  //       callback: callback,
  //     });
  //   }
  createWebsocket() {
    this.#websocket = new WebSocket(this.#websocketurl);
    this.#websocket.onopen = (event) => {
      console.warn("websocket connected!");
      while (this.#senderTem.length > 0) {
        this.#websocket.send(JSON.stringify(this.#senderTem.pop()));
      }
    };
    this.#websocket.onmessage = (event) => {
      this.#msgCome(event.data);
    };
    this.#websocket.onclose = (event) => {
      this.#webSocOnClose(event);
    };
    this.#websocket.onerror = (e) => {
      if (this.#websocket.readyState) {
        //bla bla
      }
    };
  }
  //   removelistener(id) {
  //     for (let i = 0; i < this.#listener.length; ) {
  //       if (this.#listener[i].id == id) {
  //         this.#listener.splice(i, 1);
  //       } else {
  //         i++;
  //       }
  //     }
  //   }
  #getId() {
    let i = 0;
    for (; i < this.#uids.length; ++i) {
      if (!this.#uids[i].isUsed) {
        this.#uids[i].isUsed = true;
        return this.#uids[i].id;
      }
    }
    this.#uids.push({
      id: i, //use str
      isUsed: true,
    });
    return i;
  }
  #backId(id) {
    for (let i = 0; i < this.#uids.length; ++i) {
      if (this.#uids[i].id == id) {
        this.#uids[i].isUsed = false;
        return;
      }
    }
  }
  send(msg) {
    msg.uid = this.#getId();
    return new Promise((resolve) => {
      this.#sender.push({
        uid: msg.uid,
        resolve: resolve,
        time: Date.now(),
      });

      if (this.#websocket.readyState == 1) {
        this.#websocket.send(JSON.stringify(msg));
      } else {
        this.#senderTem.push(msg);
      }
    });
  }
  #msgCome(data) {
    try {
      let ob = JSON.parse(data);
      //msg
      for (let i = 0; i < this.#sender.length; ) {
        if (this.#sender[i].uid == ob.uid) {
          this.#backId(ob.uid);
          this.#sender[i].resolve(ob);
          this.#sender.splice(i, 1);
        } else {
          ++i;
        }
      }
      //listener
      //   for (let i = 0; i < this.#listener.length; ++i) {
      //     if (this.#listener[i].method == ob.method) {
      //       this.#listener[i].callback(ob);
      //     }
      //   }
    } catch (e) {
      console.warn(e);
    }
  }
  #reOpen() {
    console.warn("reopen websocket!");
    if (this.#websocket.readyState == 1) {
      console.warn("had open!");
      return;
    }
    this.#websocket.close();
    this.createWebsocket();
  }
  #webSocOnClose(e_) {
    setTimeout(() => {
      this.#reOpen();
    }, 10000);
  }
}

let ServerNet;
if (import.meta.env.MODE === "development") {
  ServerNet = new Websoc(`ws://127.0.0.1:8846`);
} else {
  fetch("/command", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get_websocket_server_port",
      uid: 0,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      ServerNet = new Websoc(`ws://${window.location.hostname}:${data.data}`);
    });
}

// ServerNet = new Websoc("ws://127.0.0.1:8846");
export default ServerNet;
