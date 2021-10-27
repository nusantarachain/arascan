import io from 'socket.io-client';

export default ({ app }, inject) => {
  console.log('connecting to ws server...');

  console.log('🚀 ~ file: ws.js ~ line 6 ~ app.$config.socketUrl', app.$config.socketUrl);

  const socket = io(app.$config.socketUrl, { path: '/socket' });

  // const wsc = new WebSocket(app.$config.socketUrl);

  // // const self = this;
  // wsc.onmessage = (msgEvent) => {
  //   // console.log(incomingMessage)
  //   console.log('got ws message from server: ' + msgEvent.data);
  //   const jd = JSON.parse(msgEvent.data);
  //   if (jd != null) {
  //     if (window.$nuxt) {
  //       if (jd.type == 'stats') {
  //         window.$nuxt.$root.$emit('stats-update', jd);
  //       } else {
  //         window.$nuxt.$root.$emit(jd.type, jd);
  //       }
  //     }
  //   }
  // };
  // window.onNuxtReady((app) => {
  // your have access to `window.$nuxt.$root` here
  // });
  // function waitForConnection(callback, interval) {
  //   if (wsc.readyState === 1) {
  //     callback();
  //   } else {
  //     setTimeout(function () {
  //       waitForConnection(callback, interval);
  //     }, interval);
  //   }
  // }
  inject('ws', {
    socket,
    send(key, data) {
      // waitForConnection(() => wsc.send(data), 1000);
      socket.emit(key, data);
    },
  });
};
