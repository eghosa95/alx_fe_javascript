// ✅ Load quotes from localStorage or fallback to default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "To be or not to be, that is the question.", category: "Philosophy" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// ✅ DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

// ✅ Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Create form for adding quotes
function createAddQuoteForm() {
  const formDiv = document.createElement('div');

  const quoteInput = document.createElement('input');
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement('input');
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement('button');
  addButton.textContent = "Add Quote";
  addButton.id = "addQuoteBtn";
  addButton.addEventListener('click', addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);
  document.body.appendChild(formDiv);
}

// ✅ Display random quote & store in sessionStorage
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available in this category.</em>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ✅ Add new quote to array and localStorage
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  // Add category to dropdown if not present
  if (![...categoryFilter.options].some(opt => opt.value === category)) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  }

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added successfully!");
}

// ✅ Import quotes from uploaded JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw "Invalid format";

      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import. Please upload a valid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ Export current quotes to a downloadable JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// ✅ Initialize category dropdown options
function populateCategoryFilter() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// ✅ Load last viewed quote from sessionStorage
function loadLastQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
  }
}

// ✅ Setup page
createAddQuoteForm();
populateCategoryFilter();
loadLastQuote();

// ✅ Event Listeners
newQuoteBtn.a
