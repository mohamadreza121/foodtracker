document.getElementById('searchButton').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    return alert('Please enter a search term.');
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

    results.forEach(food => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <span>
          ${food.image ? `<img src="/images/${food.image}" alt="${food.name}" class="food-image">` : ''}
          <strong>${food.name}</strong> - ${food.calories} kcal
        </span>
        <button class="btn btn-success btn-sm add-food-btn" data-name="${food.name}" data-calories="${food.calories}">
          <i class="fas fa-plus-circle"></i> Add
        </button>
      `;
      searchResults.appendChild(li);
    });

    // Add event listeners to dynamically created "Add" buttons
    document.querySelectorAll('.add-food-btn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const name = event.target.getAttribute('data-name');
        const calories = event.target.getAttribute('data-calories');

        if (!name || !calories) {
          alert('Invalid food data. Please try again.');
          return;
        }

        try {
          const addResponse = await fetch('/foodroutes/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, calories }),
          });

          if (!addResponse.ok) throw new Error('Failed to add food.');

          alert(`${name} has been added to your food list.`);
          window.location.reload(); // Reload the page to update the food list
        } catch (err) {
          console.error('Error adding food:', err.message);
          alert('Failed to add food.');
        }
      });
    });
  } catch (err) {
    console.error('Error fetching search results:', err.message);
    alert('Failed to search for foods.');
  }
});
