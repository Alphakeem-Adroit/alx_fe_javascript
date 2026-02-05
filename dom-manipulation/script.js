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
