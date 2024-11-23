  // Search functionality
  document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return alert('Please enter a search term.');

    try {
      const response = await fetch(`/foodroutes/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();

      const searchResults = document.getElementById('searchResults');
      searchResults.innerHTML = '';

      if (results.length === 0) {
        searchResults.innerHTML = '<li class="list-group-item text-muted">No results found</li>';
        return;
      }

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
      console.error(err);
      alert('Failed to search for foods.');
    }
  });