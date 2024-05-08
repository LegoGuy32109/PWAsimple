const webpush = require("web-push");
webpush.setVapidDetails(
    'mailto:joshua.hale@l3harris.com',
    'BMDcpQEu3C_Wr2-rLt_NNRYyzG5gfLTfjMCycBV61jaw1vAOkHD5OKKMnn3mq2ZLOnvY_nxcj-ibDsuQI-0C7XU',
    '8tSj88gkdtYtm716yN3Jxt5m6PL3fu7u6ZfxhJWm7kY'
);
// get these in console when subscribing to push notifications
const clientEndpoint = "https://fcm.googleapis.com/fcm/send/eW_OQwkvNFQ:APA91bEZSI3xTVRXG1VcKYAhqA2H3Pnfzxcw5MLo_gzFiPq4_OG0qEKl1WxVqTy-zT_-RxsoxiS7g8W-gZikEXenX-VMTajB6L5agrlxbAK3Qo803CUiFYooZBZYxRZd8mRyqIvwIYXO";
const auth = "lNz7lKbEnKlE75ejdG3deA";
const p256dh = "BLIJ4xKEKTWFdBFitZsotHTTkX0jxa8RA2h8K6la05gsVOOLvGk41yZvGewIXhFGXi3MqKRqKYve37-Sj9JubDU";
const pushConfig = {
    endpoint: clientEndpoint,
    keys: {
        auth: auth,
        p256dh: p256dh,
    }
};
webpush.sendNotification(pushConfig, JSON.stringify({
    title: 'New Post', content: 'New Post added!'
}))
    .catch((err) => console.error(err));