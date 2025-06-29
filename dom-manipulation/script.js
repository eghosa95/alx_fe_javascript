//  Initial quote data or from localStorage
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "To be or not to be, that is the question.", category: "Philosophy" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

//  DOM References
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

//  Import quotes from JSON file
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

//  Filter quotes by category
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

//  Show notifications
function showNotification(msg, duration = 3000) {
  const notification = document.getElementById("notification");
  notification.textContent = msg;
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), duration);
}

//  Server sync using JSONPlaceholder (mock)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function syncWithServer() {
  try {
    showNotification("🔄 Syncing quotes with server...");
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    let conflictsResolved = 0;
    const merged = [...quotes];

    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(q => q.text === serverQuote.text);
      if (!exists) {
        merged.push(serverQuote);
        conflictsResolved++;
      }
    });

    if (conflictsResolved > 0) {
      quotes = merged;
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification(` Synced ${conflictsResolved} new quote(s) from server.`);
    } else {
      showNotification(" No new updates from server.");
    }
  } catch (err) {
    console.error("Sync failed:", err);
    showNotification("⚠ Failed to sync with server.");
  }
}

//  Auto sync every 60s
setInterval(syncWithServer, 60000);

//  Initial Setup
newQuoteBtn.addEventListener("click", showRandomQuote);
populateCategories();
syncWithServer();
