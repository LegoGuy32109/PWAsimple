const startData = [
	{ ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
	{ ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
	{ ssn: "666-66-6666", name: "William", age: 42, email: "william@swag.edu" },
];

const appDatabase = {
	// The IndexedDb object
	db: null,

	/**
	 * Get db object save it to `db`
	 */
	connectDb() {
		return new Promise((resolve, reject) => {
			const request = window.indexedDB.open("TestDB", 1);
			request.onerror = (err) => {
				reject(err);
			};
			request.onsuccess = (event) => {
				this.db = event.target.result;
				resolve(event);
			};
			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				db.createObjectStore("customers", { autoIncrement: true });
			};
		});
	},

	/**
	 * Make customers table empty
	 */
	clearDb() {
		return new Promise((resolve, reject) => {
			if (![...appDatabase.db.objectStoreNames].includes("customers")) {
				reject("Something went wrong 💥 no customers");
			}
			const transaction = appDatabase.db.transaction(
				appDatabase.db.objectStoreNames, // INFO cannot be empty
				"readwrite"
			);
			const clearRequest = transaction.objectStore("customers").clear();
			clearRequest.onerror = (err) => reject(err);
			clearRequest.onsuccess = (event) => resolve(event);
		});
	},

	/**
	 * Get customers from db table `customers` returning all of them in a Promise
	 */
	getCustomers() {
		return new Promise((resolve, reject) => {
			if (!appDatabase.db) {
				reject("Database not instatiated");
			}
			const transaction = appDatabase.db.transaction("customers"); // read-only by default
			transaction.onerror = (err) => reject("Transaction error ❌", err);
			const getRequest = transaction.objectStore("customers").getAll();
			getRequest.onerror = (err) => reject("getAll() error ❌", err);
			getRequest.onsuccess = (event) => resolve(event.target.result);
		});
	},

	/**
	 * Add customer object to database
	 *
	 * @param {any} customer
	 */
	addCustomer(customer) {
		return new Promise((resolve, reject) => {
			const addCustomerTransaction = appDatabase.db.transaction("customers", "readwrite");
			addCustomerTransaction.onerror = (err) => {
				reject("Transaction error ❌", err);
			};

			const customerStore = addCustomerTransaction.objectStore("customers");
			const addRequest = customerStore.add(customer);
			addRequest.onerror = (err) => {
				reject("getAll() error ❌", err);
			};
			addRequest.onsuccess = (_event) => {
				resolve(`Customer added to database ✅`);
			};
		});
	},
};

// try to connect db of certain version, creates one if doesn't exist
appDatabase.connectDb().then(refresh);

// reset db button
document.querySelector("#reset").addEventListener("click", async () => {
	await appDatabase.clearDb();
	refresh();
});

// add customer to page
document.querySelector("#add").addEventListener("click", async () => {
	await appDatabase.addCustomer(startData[Math.floor(Math.random()*startData.length)]);
	refresh();
});

/**
 * Refresh the page displaying customer information
 */
async function refresh() {
	const customerTable = document.querySelector("#customerTable");
	const customers = await appDatabase.getCustomers();
	if (customers.length > 0)
		customerTable.innerHTML = `<table>
      <thead>
          <tr>
              <th>ssn</th>
              <th>name</th>
              <th>age</th>
              <th>email</th>
          </tr>
      </thead>
      <tbody>
          ${customers
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
	else customerTable.innerHTML = `No customers so far`;
}
document.querySelector("#get").addEventListener("click", refresh);
