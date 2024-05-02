// This is what our customer data looks like.
const customerData = [
    { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
];

/**
 * Get db object
 */
function getDb()
{
    console.log("Connecting to DB");
    const request = window.indexedDB.open('TestDB', 1);
    request.onerror = (err) =>
    {
        console.error(err);
    };
    request.onsuccess = (event) =>
    {
        db = event.target.result;
        console.log("Db opened ✅", event);
    };
    request.onupgradeneeded = (event) =>
    {
        console.log("Upgrading DB", event);
        const db = event.target.result;
        const newStore = db.createObjectStore("customers", { autoIncrement: true });
        // not running for some reason
        // newStore.onsuccess = async (event) =>
        // {
        //     console.log("Customers store created", event);
        //     console.log("Creating customers 🧑👩");
        //     for (const customer of customerData)
        //     {
        //         console.log("🧑 Adding ", customer);
        //         await newStore.add(customer);
        //     }
        // };
    };
}

// try to connect db of certain version, creates one if doesn't exist

/**
 * Reset db
 */
function resetDb()
{
    console.log("Resetting DB ⏱");
    const reset = db.transaction(db.objectStoreNames, "readwrite");
    reset.oncomplete = async (event) =>
    {
        console.log("Db reset connection made 🔁", event);
        if (![...db.objectStoreNames].includes("customers"))
        {
            console.error("Something went wrong 💥 no customers");
            return;
        }
        const customersStore = db
            .transaction("customers", "readwrite")
            .objectStore("customers");
        console.log("Creating customers 🧑👩");
        for (const customer of customerData)
        {
            console.log("🧑 Adding ", customer);
            await customersStore.add(customer);
        }
    };
}
document.querySelector("#reset").addEventListener('click', resetDb);

/**
 * Get customers from db
 */
function getCustomers()
{
    if (!db)
    {
        return;
    }
    console.log("Requesting Customers...");
    const transaction = db.transaction("customers"); // read-only by default
    transaction.onerror = (err) =>
    {
        console.error("Transaction error ❌", err);
    };

    const curStore = transaction.objectStore("customers");
    const getRequest = curStore.getAll();
    getRequest.onerror = (err) =>
    {
        console.error("getAll() error ❌", err);
    };

    getRequest.onsuccess = (event) =>
    {
        console.log("Customers Retrieved. 👩👨🧑");
        console.table(event.target.result);
        document.querySelector("#customerTable").innerHTML =
            `<table>
                <thead>
                    <tr>
                        <th>ssn</th>
                        <th>name</th>
                        <th>age</th>
                        <th>email</th>
                    </tr>
                </thead>
                <tbody>
                    ${event.target.result.map((customer) => `
                    <tr>
                        <th>${customer.ssn}</th>
                        <th>${customer.name}</th>
                        <th>${customer.age}</th>
                        <th>${customer.email}</th>
                    </tr>
                    `).join('')}
                </tbody>
            </table>`;
    };
}
// load customers to page
// getCustomers();
document.querySelector("#get").addEventListener('click', getCustomers);