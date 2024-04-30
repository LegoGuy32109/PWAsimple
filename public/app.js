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
                .then(res => {
                    if(!res.ok)
                    {
                        console.error(res);
                    }
                    return cache.put('/ship-1024x512.png', res)
                });
                // cache.add('/ship-1024x512.png');
            });
    }
    else
    {
        console.error("❌ Browser does not support caching");
    }
});