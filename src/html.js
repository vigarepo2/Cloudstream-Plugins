// Changes: modern UI polish + better UX states

export const uiTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-black text-white flex items-center justify-center h-screen">

<div class="w-full max-w-md p-6 bg-zinc-900 rounded-2xl shadow-xl">
  <h1 class="text-xl font-semibold mb-4">Aether Login</h1>

  <input id="email" placeholder="Email"
    class="w-full mb-3 p-3 rounded bg-black border border-zinc-700" />

  <input id="pass" type="password" placeholder="Password"
    class="w-full mb-4 p-3 rounded bg-black border border-zinc-700" />

  <button onclick="login()"
    class="w-full bg-white text-black py-2 rounded font-medium">
    Continue
  </button>

  <p id="msg" class="text-sm mt-3 text-red-400"></p>
</div>

<script>
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('pass').value;

  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem('token', data.token);
    location.reload();
  } else {
    document.getElementById('msg').innerText = data.error;
  }
}
</script>

</body>
</html>
`;
