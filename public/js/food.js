document.getElementById('searchButton').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value.trim(); // Get the search input
  if (!query) {
    return alert('Please enter a search term.'); // Warn if the input is empty
  }

  try {
    const response = await fetch(`/foodroutes/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch search results.');

    const results = await response.json();

    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (results.length === 0) {
      searchResults.innerHTML = '<li class="list-group-item text-muted">No results found</li>';
      return;
    }

    // Populate search results
    results.forEach(food => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <span>
          ${food.image ? `<img src="/images/${food.image}" alt="${food.name}" class="food-image">` : ''}
          <strong>${food.name}</strong> - ${food.calories} kcal
        </span>
        <button class="btn btn-success btn-sm add-food-btn" data-id="${food._id}">
          <i class="fas fa-plus-circle"></i> Add
        </button>
      `;
      searchResults.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching search results:', err.message);
    alert('Failed to search for foods.');
  }
});
