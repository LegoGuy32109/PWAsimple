const GENDER = { MALE: 0, FEMALE: 1 };
const startData = [
	{ ssn: "444-44-4444", gender: GENDER.MALE, name: "Bill", age: 35, email: "bill@company.com" },
	{ ssn: "555-55-5555", gender: GENDER.FEMALE, name: "Donna", age: 32, email: "donna@home.org" },
	{ ssn: "666-66-6666", gender: GENDER.MALE, name: "William", age: 42, email: "william@swag.edu" },
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
			const getKeysRequest = transaction.objectStore("customers").getAllKeys();
			getRequest.onerror = (err) => reject("getAll() error ❌", err);
			getKeysRequest.onerror = (err) => reject("getAllKeys() error ❌", err);
			// Don't need to handle errors in Promise.all, onerror already rejected above
			const requestsToComplete = [
				new Promise((resolve, _reject) => {
					getRequest.addEventListener("success", resolve);
				}),
				new Promise((resolve, _reject) => {
					getKeysRequest.addEventListener("success", resolve);
				}),
			];
			Promise.all(requestsToComplete).then(([getRes, getKeysRes]) => {
				const customers = getRes.target.result;
				const keys = getKeysRes.target.result;
				resolve(customers.map((customer, index) => ({ key: keys[index], ...customer })));
			});
		});
	},

	/**
	 * Add customer object to database
	 *
	 * @param {any} customer
	 * @returns {Promise} Promise to add `customer` to database in `customers` table
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

	/**
	 * Delete customer item by key
	 *
	 * @param {number} key auto-indexed key of item to delete
	 * @returns {Promise} Promise to delete key in `customers` table
	 */
	deleteCustomer(key) {
		return new Promise((resolve, reject) => {
			if (typeof key !== "number") reject("Key is not number");
			const delTransaction = appDatabase.db.transaction("customers", "readwrite");
			delTransaction.onerror = (err) => {
				reject("Transaction error ❌", err);
			};

			const delRequest = delTransaction.objectStore("customers").delete(key);
			delRequest.onerror = (err) => {
				reject("delete() error ❌", err);
			};
			delRequest.onsuccess = (_event) => {
				resolve(`Customer deleted from database 🗑️`);
			};
		});
	},
};

// try to connect db of certain version, creates one if it didn't exist
appDatabase.connectDb().then(refresh);

// reset db button
document.querySelector("#reset").addEventListener("click", async () => {
	await appDatabase.clearDb();
	refresh();
});

// add customer to page
document.querySelector("#add").addEventListener("click", async () => {
	await appDatabase.addCustomer(startData[Math.floor(Math.random() * startData.length)]);
	refresh();
});

/**
 * Refresh the page displaying customer information
 */
async function refresh() {
	const customerTable = document.querySelector("#customerTable");
	customerTable.innerHTML = "";
	const customers = await appDatabase.getCustomers();
	if (customers.length === 0) {
		customerTable.innerHTML = `No customers so far`;
		return;
	}
	const tableHeader = document.createElement("thead");
	tableHeader.innerHTML = `
		<tr>
			<th>ssn</th>
			<th>name</th>
			<th>age</th>
			<th>email</th>
			<th>Delete?</th>
		</tr>`;
	const tableBody = document.createElement("tbody");
	tableBody.innerHTML = customers
		.map(
			(customer) => `
          <tr>
              <th>${customer.ssn}</th>
              <th>${customer.name} ${customer.gender === GENDER.MALE ? "♂️" : "♀️"}
              <th>${customer.age}</th>
              <th>${customer.email}</th>
			  <th><button id="delete-customer-${customer.key}">🗑️</button></th>
          </tr>`
		)
		.join("");
	customerTable.appendChild(tableHeader);
	customerTable.appendChild(tableBody);
	// user won't be clicking that fast, so show the elements before attaching event listeners
	const deleteButtons = tableBody.querySelectorAll("button");
	deleteButtons.forEach((button) => {
		button.addEventListener("click", async () => {
			const userAnswer = confirm(`Are you sure you want to delete?`);
			if (userAnswer) {
				const result = await appDatabase.deleteCustomer(Number(button.id.split("-").at(-1)));
				console.log(result);
				refresh();
			}
		});
	});
}
