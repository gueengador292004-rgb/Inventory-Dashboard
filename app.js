const $ = (id) => document.getElementById(id);
const api = '/api/products';
const money = (n) => Number(n).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function loadStats() {
  const s = await (await fetch('/api/stats')).json();
  $('sProducts').textContent = s.totalProducts;
  $('sUnits').textContent = s.totalUnits;
  $('sValue').textContent = money(s.totalValue);
  $('sLow').textContent = s.lowStock;
}

async function loadProducts() {
  const q = encodeURIComponent($('search').value);
  const items = await (await fetch(`${api}?q=${q}`)).json();
  $('rows').innerHTML = items.length
    ? items.map((p) => `
      <tr>
        <td>${p.id}</td><td>${esc(p.name)}</td><td>${esc(p.category)}</td>
        <td>${money(p.price)}</td><td class="${p.quantity <= 5 ? 'low' : ''}">${p.quantity}</td>
        <td>
          <button class="edit" onclick="editItem(${p.id})">Edit</button>
          <button class="danger" onclick="removeItem(${p.id})">Delete</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="6">No products found.</td></tr>';
}

function refresh() { loadStats(); loadProducts(); }

function resetForm() {
  $('productForm').reset();
  $('id').value = '';
  $('category').value = 'General';
  $('formTitle').textContent = 'Add Product';
  $('saveBtn').textContent = 'Add';
  $('cancelBtn').hidden = true;
  $('error').textContent = '';
}

$('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('id').value;
  const body = {
    name: $('name').value, category: $('category').value,
    price: $('price').value, quantity: $('quantity').value,
  };
  const res = await fetch(id ? `${api}/${id}` : api, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { $('error').textContent = (await res.json()).error; return; }
  resetForm();
  refresh();
});

async function editItem(id) {
  const p = await (await fetch(`${api}/${id}`)).json();
  $('id').value = p.id; $('name').value = p.name; $('category').value = p.category;
  $('price').value = p.price; $('quantity').value = p.quantity;
  $('formTitle').textContent = `Edit Product #${p.id}`;
  $('saveBtn').textContent = 'Update';
  $('cancelBtn').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function removeItem(id) {
  if (!confirm('Delete this product?')) return;
  await fetch(`${api}/${id}`, { method: 'DELETE' });
  refresh();
}

$('cancelBtn').addEventListener('click', resetForm);
$('search').addEventListener('input', loadProducts);
refresh();
