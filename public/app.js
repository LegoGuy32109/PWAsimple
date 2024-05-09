const VAPID_PUBLIC_KEY = "BMDcpQEu3C_Wr2-rLt_NNRYyzG5gfLTfjMCycBV61jaw1vAOkHD5OKKMnn3mq2ZLOnvY_nxcj-ibDsuQI-0C7XU";
if ('serviceWorker' in navigator)
{
    navigator.serviceWorker
        .register('/sw.js') // can pass option obj to clarify scope
        .then(() =>
        {
            console.log("Service Worker registered ✔");
        })
        .catch((err) => console.error(err));
}

document.querySelector('#save').addEventListener('click', (_event) =>
{
    console.log("Button was Clicked 🖱");
    if (window.caches)
    {
        caches.open('user')
            .then((cache) =>
            {
                fetch('/ship-1024x512.png')
                    .then(res =>
                    {
                        if (!res.ok)
                        {
                            console.error(res);
                        }
                        return cache.put('/ship-1024x512.png', res);
                    });
                // same as cache.add('/ship-1024x512.png');
            });
    }
    else
    {
        console.error("❌ Browser does not support caching");
    }
});

const enableButton = document.querySelector("#enable-notifications");
if (!('Notification' in window) || Notification.permission === 'granted')
{
    enableButton.style.display = "none";
}
enableButton.addEventListener("click", () =>
{
    Notification.requestPermission((result) =>
    {
        if (result !== 'granted')
        {
            console.log("No notification permission granted :(");
        }
        else
        {
            console.log("Permission was granted!");
            enableButton.style.display = "none";
        }
    });
});

const pingButton = document.querySelector("#notify");
pingButton.addEventListener("click", () =>
{
    const notifOptions = {
        body: "Isn't that cool?",
        icon: '/144x144.png',
        image: '/ship-1024x512.png', // I love the image that's very cool
        lang: 'en-US',
        // vibrate: [100, 50, 200], // not every browser supports this
        // badge: '/144x144.png', // only for android
        tag: 'confirm-notification', // used for grouping notificaitons not spamming user
        renotify: true, // change tag default behavior to renotify
        // oh nice now I can spam myself clicking the button with tag and renotify
        actions: [
            { action: '/database/db.html', title: 'Database'},
            { action: '/', title: 'Home', icon: '/144x144.png' },
        ],
        requireInteraction: true,
        silent: true, // can't have vibrate
        // data: {
        //     url: `/database/db.html`
        // }
    };
    navigator.serviceWorker?.ready
        .then((swregistration) =>
            swregistration.showNotification(`I'm in a service worker`, notifOptions)
        );
});


const enablePushButton = document.querySelector("#enable-push");
enablePushButton.addEventListener("click", () =>
{
    if (!navigator.serviceWorker)
        return;

    navigator.serviceWorker.ready
        .then(async (swregistration) => 
        {
            const currentSubscription = await swregistration.pushManager.getSubscription();
            return [swregistration, currentSubscription];
        })
        .then(([swreg, sub]) =>
        {
            console.log(swreg, sub);
            // we have a subscription
            if (sub)
            {
                return sub;
            }
            // we don't have a subscription
            else
            {
                const pubKeyAsInts = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                return swreg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: pubKeyAsInts,
                });
            }
        })
        .then((sub) =>
        {
            // fetch('POST subscription to server')
            console.log(JSON.stringify(sub));
            new Notification("🔔 Subscribed to push notifications!");
        });
});

function urlBase64ToUint8Array(base64String)
{
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i)
    {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}