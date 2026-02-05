function showRandomQuote() {
  const selectedCategory =
    localStorage.getItem("selectedCategory") || "all";

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    "${quote.text}"
    <span class="category">— ${quote.category}</span>
  `;

  // Optional: session storage demo
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Reset dropdown
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}

// function filterQuotes() {
//   const selectedCategory = document.getElementById("categoryFilter").value;

//   // Save preference
//   localStorage.setItem("selectedCategory", selectedCategory);

//   let filteredQuotes =
//     selectedCategory === "all"
//       ? quotes
//       : quotes.filter(q => q.category === selectedCategory);

//   displayQuotes(filteredQuotes);
// }

function filterQuotes() {
  const selectedCategory =
    document.getElementById("categoryFilter").value;

  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}


function displayQuotes(quotesToDisplay) {
  quoteDisplay.innerHTML = "";

  if (quotesToDisplay.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  quotesToDisplay.forEach(quote => {
    const p = document.createElement("p");
    p.innerHTML = `"${quote.text}" <span class="category">— ${quote.category}</span>`;
    quoteDisplay.appendChild(p);
  });
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  populateCategories();
  filterQuotes();

  textInput.value = "";
  categoryInput.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
});


// SERVER SYNC
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 15000; // 15 seconds

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Normalize server data into quote format
    return data.slice(0, 10).map(post => ({
      text: post.title,
      category: `Server-Category-${post.userId}`,
      source: "server",
      updatedAt: Date.now()
    }));
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

async function sendQuotesToServer(quotesToSend) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quotes: quotesToSend,
        syncedAt: new Date().toISOString()
      })
    });

    const result = await response.json();
    console.log("Quotes successfully sent to server:", result);
  } catch (error) {
    console.error("Failed to send quotes to server:", error);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const localIndex = quotes.findIndex(
      localQuote => localQuote.text === serverQuote.text
    );

    if (localIndex === -1) {
      // New quote from server
      quotes.push(serverQuote);
      updated = true;
    } else {
      // Conflict detected → server wins
      quotes[localIndex] = serverQuote;
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifySyncUpdate();

    // Send merged data back to server (POST)
    sendQuotesToServer(quotes);
  }
}

setInterval(syncQuotes, SYNC_INTERVAL);


function isSameQuote(localQuote, serverQuote) {
  return localQuote.text === serverQuote.text;
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const localIndex = quotes.findIndex(
      localQuote => localQuote.text === serverQuote.text
    );

    if (localIndex === -1) {
      quotes.push(serverQuote);
      updated = true;
    } else {
      quotes[localIndex] = serverQuote;
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifySyncUpdate();

    // 🔥 POST local state back to server (simulation)
    sendQuotesToServer(quotes);
  }
}

function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) return;

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  populateCategories();
  filterQuotes();

  // POST new quote immediately
  sendQuotesToServer([newQuote]);
}



setInterval(syncWithServer, SYNC_INTERVAL);


// function notifySyncUpdate() {
//   const notice = document.getElementById("syncNotice");
//   notice.textContent = "Quotes updated from server. Conflicts resolved automatically.";
//   notice.style.display = "block";

//   setTimeout(() => {
//     notice.style.display = "none";
//   }, 4000);
// }

function notifySyncUpdate() {
  const notice = document.getElementById("syncNotice");

  notice.textContent = "Quotes synced with server!";
  notice.style.display = "block";

  setTimeout(() => {
    notice.style.display = "none";
  }, 4000);
}

if (updated) {
  saveQuotes();
  populateCategories();
  filterQuotes();

  notifySyncUpdate();
  sendQuotesToServer(quotes);
}

function manualSync() {
  if (confirm("Sync with server? Server data will override local conflicts.")) {
    syncWithServer();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
  await syncWithServer();
});
