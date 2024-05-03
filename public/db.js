const customerDatabase = {
  db: null,
  startData: [
    { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
  ],

  /**
   * Get db object save it to `db`
   */
  getDb() {
    console.log("Connecting to DB");
    const request = window.indexedDB.open("TestDB", 1);
    request.onerror = (err) => {
      console.error(err);
    };
    request.onsuccess = (event) => {
      this.db = event.target.result;
      console.log("Db opened ✅", event);
    };
    request.onupgradeneeded = (event) => {
      console.log("Upgrading DB", event);
      const db = event.target.result;
      const newStore = db.createObjectStore("customers", {
        autoIncrement: true,
      });
      // not running for some reason
      newStore.onsuccess = async (event) => {
        console.log("Customers store created", event);
        console.log("Creating customers 🧑👩");
        for (const customer of this.startData) {
          console.log("🧑 Adding ", customer);
          await newStore.add(customer);
        }
      };
    };
  },
};

// try to connect db of certain version, creates one if doesn't exist
customerDatabase.getDb();

/**
 * Reset db
 */
function resetDb() {
  console.log("Resetting DB ⏱");
  const reset = customerDatabase.db.transaction(
    customerDatabase.db.objectStoreNames,
    "readwrite"
  );
  reset.oncomplete = async (event) => {
    console.log("Db reset connection made 🔁", event);
    if (![...customerDatabase.db.objectStoreNames].includes("customers")) {
      console.error("Something went wrong 💥 no customers");
      return;
    }
    const customersStore = customerDatabase.db
      .transaction("customers", "readwrite")
      .objectStore("customers");
    console.log("Creating customers 🧑👩");
    for (const customer of customerDatabase.startData) {
      console.log("🧑 Adding ", customer);
      await customersStore.add(customer);
    }
  };
}
document.querySelector("#reset").addEventListener("click", resetDb);

/**
 * Get customers from db
 */
function getCustomers() {
  if (!customerDatabase.db) {
    return;
  }
  console.log("Requesting Customers...");
  const transaction = customerDatabase.db.transaction("customers"); // read-only by default
  transaction.onerror = (err) => {
    console.error("Transaction error ❌", err);
  };

  const curStore = transaction.objectStore("customers");
  const getRequest = curStore.getAll();
  getRequest.onerror = (err) => {
    console.error("getAll() error ❌", err);
  };

  getRequest.onsuccess = (event) => {
    console.log("Customers Retrieved. 👩👨🧑");
    console.table(event.target.result);
    document.querySelector("#customerTable").innerHTML = `<table>
                <thead>
                    <tr>
                        <th>ssn</th>
                        <th>name</th>
                        <th>age</th>
                        <th>email</th>
                    </tr>
                </thead>
                <tbody>
                    ${event.target.result
                      .map(
                        (customer) => `
                    <tr>
                        <th>${customer.ssn}</th>
                        <th>${customer.name}</th>
                        <th>${customer.age}</th>
                        <th>${customer.email}</th>
                    </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>`;
  };
}
// load customers to page
document.querySelector("#get").addEventListener("click", getCustomers);
