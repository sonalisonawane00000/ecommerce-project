const apiUrl = 'https://fakestoreapi.com/products';

const productsContainer = document.getElementById('products-container');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authModal = document.getElementById('auth-modal');

const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const toggleAuth = document.getElementById('toggle-auth');

const adminBtn = document.getElementById('admin-btn');
const adminPanel = document.getElementById('admin-panel');

let isLogin = true;
let currentUser = localStorage.getItem('user');
let cart = JSON.parse(localStorage.getItem('cart')) || [];


// ---------------- AUTH ----------------
loginBtn.onclick = () => authModal.style.display = 'flex';

toggleAuth.onclick = () => {
  isLogin = !isLogin;
  authTitle.innerText = isLogin ? "Login" : "Register";
};

authSubmit.onclick = () => {
  const u = username.value;
  const p = password.value;

  if (isLogin) {
    const user = JSON.parse(localStorage.getItem(u));
    if (user && user.password === p) {
      currentUser = u;
      localStorage.setItem('user', u);
      alert('Login success');
      authModal.style.display = 'none';
      updateUI();
    } else alert('Invalid');
  } else {
    localStorage.setItem(u, JSON.stringify({ password: p }));
    alert('Registered');
  }
};

logoutBtn.onclick = () => {
  localStorage.removeItem('user');
  currentUser = null;
  updateUI();
};

function updateUI() {
  loginBtn.style.display = currentUser ? 'none' : 'block';
  logoutBtn.style.display = currentUser ? 'block' : 'none';
}


// ---------------- PRODUCTS ----------------
async function fetchProducts() {
  const res = await fetch(apiUrl);
  let apiProducts = await res.json();

  const adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];

  displayProducts([...apiProducts, ...adminProducts]);
}

function displayProducts(products) {
  productsContainer.innerHTML = '';

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';

    div.innerHTML = `
      <img src="${p.image}">
      <h4>${p.title}</h4>
      <p>$${p.price}</p>
      <button>Add</button>
    `;

    div.querySelector('button').onclick = () => addToCart(p);

    productsContainer.appendChild(div);
  });
}


// ---------------- CART ----------------
function addToCart(p) {
  if (!currentUser) return alert('Login first');

  const item = cart.find(i => i.id === p.id);
  if (item) item.qty++;
  else cart.push({ ...p, qty: 1 });

  saveCart();
  alert('Added');
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

cartBtn.onclick = () => {
  cartModal.style.display = 'flex';
  displayCart();
};

function closeCart() {
  cartModal.style.display = 'none';
}

function displayCart() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach(i => {
    total += i.price * i.qty;

    const li = document.createElement('li');
    li.innerHTML = `
      ${i.title} x ${i.qty}
      <button onclick="removeItem(${i.id})">X</button>
    `;
    cartItems.appendChild(li);
  });

  const t = document.createElement('h3');
  t.innerText = 'Total: $' + total;
  cartItems.appendChild(t);
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  displayCart();
}


// ---------------- ORDER ----------------
document.getElementById('checkout').onclick = () => {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push({ user: currentUser, items: cart });

  localStorage.setItem('orders', JSON.stringify(orders));
  cart = [];
  saveCart();

  alert('Order placed!');
  closeCart();
};


// ---------------- ADMIN ----------------
adminBtn.onclick = () => {
  const pass = prompt('Admin password');
  if (pass === 'admin123') {
    adminPanel.style.display = 'flex';
    loadAdmin();
  } else alert('Wrong password');
};

function closeAdmin() {
  adminPanel.style.display = 'none';
}

document.getElementById('add-product').onclick = () => {
  const t = document.getElementById('p-title').value;
  const p = document.getElementById('p-price').value;
  const i = document.getElementById('p-image').value;

  const products = JSON.parse(localStorage.getItem('adminProducts')) || [];

  products.push({ id: Date.now(), title: t, price: p, image: i });

  localStorage.setItem('adminProducts', JSON.stringify(products));
  loadAdmin();
};

function loadAdmin() {
  loadProductsAdmin();
  loadOrders();
}

function loadProductsAdmin() {
  const list = document.getElementById('admin-products');
  list.innerHTML = '';

  const products = JSON.parse(localStorage.getItem('adminProducts')) || [];

  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${p.title}
      <button onclick="deleteProduct(${p.id})">X</button>
    `;
    list.appendChild(li);
  });
}

function deleteProduct(id) {
  let products = JSON.parse(localStorage.getItem('adminProducts')) || [];
  products = products.filter(p => p.id !== id);
  localStorage.setItem('adminProducts', JSON.stringify(products));
  loadProductsAdmin();
}

function loadOrders() {
  const list = document.getElementById('admin-orders');
  list.innerHTML = '';

  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  orders.forEach(o => {
    const li = document.createElement('li');
    li.innerText = o.user + ' - ' + o.items.length + ' items';
    list.appendChild(li);
  });
}


// ---------------- INIT ----------------
updateUI();
fetchProducts();