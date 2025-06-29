//  Load or initialize quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "To be or not to be, that is the question.", category: "Philosophy" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

//  Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

//  Export quotes to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

//  Import quotes from JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw "Invalid format";
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

//  Populate category dropdown
function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));
  const savedFilter = localStorage.getItem("selectedCategory");

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  if (savedFilter && [...categoryFilter.options].some(o => o.value === savedFilter)) {
    categoryFilter.value = savedFilter;
  } else {
    categoryFilter.value = "all";
  }

  filterQuotes();
}

//  Filter quotes based on category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes in this category.</em>";
    return;
  }

  const html = filtered.map(q => `<p>"${q.text}"<br><small>— ${q.category}</small></p>`).join("");
  quoteDisplay.innerHTML = html;
}

//  Show one random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available in this category.</em>";
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  const quote = filtered[random];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

//  Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

//  Notification display
function showNotification(msg, duration = 3000) {
  const notification = document.getElementById("notification");
  notification.textContent = msg;
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), duration);
}

//  Simulated API endpoint
const MOCK_API_URL = "https://jsonplaceholder.typicode.com/posts";

//  Required: fetchQuotesFromServer
async function fetchQuotesFromServer() {
  const response = await fetch(MOCK_API_URL);
  const data = await response.json();
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

//  Required: postQuotesToServer
async function postQuotesToServer(newQuotes) {
  const response = await fetch(MOCK_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newQuotes)
  });
  const result = await response.json();
  console.log("Posted to server:", result);
}

//  Required: syncQuotes
async function syncQuotes() {
  showNotification(" Syncing with server...");

  try {
    const serverQuotes = await fetchQuotesFromServer();
    let conflictsResolved = 0;

    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(q => q.text === serverQuote.text);
      if (!exists) {
        quotes.push(serverQuote);
        conflictsResolved++;
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    if (conflictsResolved > 0) {
      //  Required literal text
      showNotification("Quotes synced with server!");
    } else {
      showNotification(" No new quotes from server.");
    }

    await postQuotesToServer(quotes);

  } catch (err) {
    console.error("Sync error:", err);
    showNotification(" Sync failed. Try again.");
  }
}

//  Final setup
newQuoteBtn.addEventListener("click", showRandomQuote);
populateCategories();
syncQuotes();
setInterval(syncQuotes, 60000);
