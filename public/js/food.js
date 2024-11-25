// Handle Add Food Form Submission
document.getElementById('addFoodForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  const name = document.getElementById('name').value.trim();
  const calories = document.getElementById('calories').value.trim();
  const messageDiv = document.getElementById('message'); // Optional message div for feedback

  if (!name || !calories) {
    messageDiv.textContent = 'Please provide valid food details.';
    messageDiv.style.color = 'red';
    return;
  }

  try {
    const response = await fetch('/foodroutes/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, calories }),
    });

    if (response.ok) {
      const newFood = await response.json(); // Get the newly added food details
      messageDiv.textContent = 'Food successfully added!';
      messageDiv.style.color = 'green';

      // Reset the form fields
      document.getElementById('name').value = '';
      document.getElementById('calories').value = '';

      // Dynamically update the Foods Consumed section
      const foodList = document.querySelector('.list-group'); // Select the list under Foods Consumed
      const newFoodItem = document.createElement('li');
      newFoodItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      newFoodItem.innerHTML = `
        <span>
          ${newFood.image ? `<img src="/images/${newFood.image}" alt="${newFood.name}" class="food-image">` : ''}
          <strong>${newFood.name}</strong> - ${newFood.calories} kcal
        </span>
        <a href="/foodroutes/delete/${newFood._id}" class="btn btn-danger btn-sm">
          <i class="fas fa-trash-alt"></i> Delete
        </a>
      `;
      foodList.appendChild(newFoodItem); // Append the new item to the correct list

      // Reload the page after the first food is added
      if (!localStorage.getItem('foodAddedOnce')) {
        localStorage.setItem('foodAddedOnce', 'true');
        window.location.reload(); // Refresh the page
      }
    } else {
      const errorData = await response.json();
      messageDiv.textContent = errorData.message || 'Failed to add food.';
      messageDiv.style.color = 'red';
    }
  } catch (error) {
    console.error('Error adding food:', error.message);
    messageDiv.textContent = 'An error occurred. Please try again.';
    messageDiv.style.color = 'red';
  }
});


// Handle Search Button Click (Existing functionality)
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
          alert('Invalid food details. Please try again.');
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
    
          const addedFood = await addResponse.json(); // Optionally log the response
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
