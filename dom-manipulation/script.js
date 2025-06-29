// Initial quotes array
let quotes = [
  { text: "Believe you can and you're halfway there.", category: "Motivation" },
  { text: "To be or not to be, that is the question.", category: "Philosophy" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Display a random quote
function displayRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes in this category.</em>";
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  const quote = filtered[random];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>— ${quote.category}</small>`;
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Both quote and category are required.");
    return;
  }

  // Add to array
  quotes.push({ text, category });

  // Add category to dropdown if not exists
  if (![...categoryFilter.options].some(opt => opt.value === category)) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  }

  // Clear input fields
  textInput.value = '';
  categoryInput.value = '';
  alert("Quote added successfully!");
}

// Event listeners
newQuoteBtn.addEventListener('click', displayRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', displayRandomQuote);
