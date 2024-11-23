document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = {
        email: formData.get('email'),
        password: formData.get('password'),
      };

      try {
        const response = await fetch('/userroutes/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message || 'Login failed');
          return;
        }

        // Redirect to the profile page
        window.location.href = '/userroutes/profile';
      } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while logging in.');
      }
    });
  }
});
