// FIXED: proper login + signup + OTP UI

export const uiTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-black text-white flex items-center justify-center h-screen">

<div class="w-full max-w-md p-6 bg-zinc-900 rounded-2xl">
  <h1 class="text-xl mb-4">Aether Auth</h1>

  <input id="email" placeholder="Email" class="w-full mb-2 p-2 bg-black border" />
  <input id="pass" type="password" placeholder="Password" class="w-full mb-2 p-2 bg-black border" />
  <input id="otp" placeholder="OTP" class="w-full mb-2 p-2 bg-black border hidden" />

  <button onclick="act('login')" class="w-full bg-white text-black p-2 mb-2">Login</button>
  <button onclick="act('signup')" class="w-full border p-2 mb-2">Signup</button>
  <button onclick="verify()" id="verifyBtn" class="w-full bg-green-500 p-2 hidden">Verify OTP</button>

  <p id="msg"></p>
</div>

<script>
let step = 1;

async function act(type) {
  const email = emailEl.value;
  const password = passEl.value;

  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ action:type, email, password })
  });

  const data = await res.json();

  if(type==='signup' && data.step==='verify'){
    otp.classList.remove('hidden');
    verifyBtn.classList.remove('hidden');
    msg.innerText='OTP sent';
  } else if(data.token){
    localStorage.setItem('token', data.token);
    location.reload();
  } else {
    msg.innerText=data.error;
  }
}

async function verify(){
  const res = await fetch('/api/auth', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      action:'verify',
      email: emailEl.value,
      password: passEl.value,
      otp: otp.value
    })
  });

  const data = await res.json();
  if(data.token){
    localStorage.setItem('token', data.token);
    location.reload();
  } else msg.innerText=data.error;
}

const emailEl = document.getElementById('email');
const passEl = document.getElementById('pass');
const otp = document.getElementById('otp');
const verifyBtn = document.getElementById('verifyBtn');
const msg = document.getElementById('msg');
</script>

</body>
</html>
`;
