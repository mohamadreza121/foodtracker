document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('You are not authorized. Please log in.');
    window.location.href = '/login';
    return;
  }

  const totalCaloriesElement = document.getElementById('totalCalories');
  const remainingCaloriesElement = document.getElementById('remainingCalories');
  const foodListElement = document.getElementById('foodList');
  const addFoodForm = document.getElementById('addFoodForm');
  const logoutButton = document.getElementById('logoutButton');
  const loadingElement = document.getElementById('loading');

  const showLoading = () => (loadingElement.style.display = 'block');
  const hideLoading = () => (loadingElement.style.display = 'none');

  const handleFetchError = async (response) => {
    if (response.status === 401) {
      alert('Your session has expired. Please log in again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
  };

  const fetchFoods = async () => {
    try {
      showLoading();
      const response = await fetch('/foodroutes', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleFetchError(response);
        return;
      }

      const { foods, totalCalories, remainingCalories } = await response.json();
      totalCaloriesElement.textContent = totalCalories;
      remainingCaloriesElement.textContent = remainingCalories > 0 ? remainingCalories : 0;

      foodListElement.innerHTML = '';
      if (foods.length === 0) {
        foodListElement.innerHTML = `
          <li class="list-group-item text-center text-muted">
            No foods logged for today. Start adding your meals!
          </li>
        `;
      } else {
        foods.forEach((food) => {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-center';
          li.innerHTML = `
            <span>${food.name} - ${food.calories} kcal</span>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${food._id}">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          `;
          foodListElement.appendChild(li);
        });
      }
    } catch (err) {
      console.error(err.message);
      alert('Failed to load data. Please try again.');
    } finally {
      hideLoading();
    }
  };

  const addFood = async (name, calories) => {
    try {
      const response = await fetch('/foodroutes/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, calories }),
      });

      if (!response.ok) {
        throw new Error('Failed to add food entry');
      }

      fetchFoods();
    } catch (err) {
      console.error(err.message);
      alert('Failed to add food. Please try again.');
    }
  };

  const deleteFood = async (id) => {
    try {
      const response = await fetch(`/foodroutes/delete/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete food entry');
      }

      fetchFoods();
    } catch (err) {
      console.error(err.message);
      alert('Failed to delete food. Please try again.');
    }
  };

  addFoodForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = addFoodForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const foodName = document.getElementById('foodName').value;
    const foodCalories = parseInt(document.getElementById('foodCalories').value);

    if (!foodName || isNaN(foodCalories) || foodCalories <= 0) {
      alert('Please provide valid food details.');
      submitButton.disabled = false;
      return;
    }

    await addFood(foodName, foodCalories);
    document.getElementById('foodName').value = '';
    document.getElementById('foodCalories').value = '';
    submitButton.disabled = false;
  });

  foodListElement.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
      const deleteButton = e.target.closest('.delete-btn');
      const foodId = deleteButton.getAttribute('data-id');
      if (foodId) deleteFood(foodId);
    }
  });

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    });
  }

  fetchFoods();
});
