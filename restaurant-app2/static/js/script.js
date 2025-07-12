let cart = []; // Global cart array

document.addEventListener("DOMContentLoaded", () => {
  const addButtons = document.querySelectorAll(".add-btn");
  const confirmBtn = document.getElementById("confirmBtn");
  const cartDetails = document.getElementById("cartDetails");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const voiceBtn = document.getElementById("voiceSearch");

  const table = document.getElementById("tableInfo").innerText || "Unknown";

  // Add item to cart
  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".menu-card");
      const name = card.querySelector("h3").innerText;
      const price = parseFloat(card.querySelector("p").innerText.replace("₹", ""));
      const image = card.querySelector("img").src;
      let qty = parseInt(card.querySelector(".qty-input").value);

      if (isNaN(qty) || qty < 1) qty = 1;

      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({ name, price, qty, image });
      }

      updateCartUI();
    });
  });

  // Confirm order: send WhatsApp message
 confirmBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let message = `🧾 *New Order from Table ${table}*%0A`;
  cart.forEach(item => {
    message += `🍴 *${item.name}* - ₹${item.price} × ${item.qty}%0A`;
  });

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  message += `%0A💰 *Total: ₹${total}*`;

  const phone = "9603282043";

  // Use whatsapp:// URI scheme for direct app open
  const whatsappUrl = `whatsapp://send?phone=${phone}&text=${message}`;

  // Try to open WhatsApp app
  window.location.href = whatsappUrl;

  // Optional fallback: if not installed, open web after delay
  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  }, 2000);
});

  // Category filter
  categoryFilter.addEventListener("change", () => {
    const selected = categoryFilter.value;
    document.querySelectorAll(".menu-section").forEach(section => {
      section.style.display = (selected === "All" || section.dataset.category === selected) ? "flex" : "none";
    });
  });

  // Search filter
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    document.querySelectorAll(".menu-card").forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.style.display = name.includes(keyword) ? "block" : "none";
    });
  });

  // Voice Search
  voiceBtn.addEventListener("click", () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = function (event) {
      const text = event.results[0][0].transcript;
      searchInput.value = text;
      searchInput.dispatchEvent(new Event("input"));
    };
  });

  // Initialize cart UI on page load
  updateCartUI();
});

// Update the cart display area
function updateCartUI() {
  const cartDetails = document.getElementById("cartDetails");
  cartDetails.innerHTML = "";

  if (cart.length === 0) {
    cartDetails.innerHTML = "<em>Your cart is empty</em>";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.qty * item.price;
    cartDetails.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <strong>${item.name}</strong><br>
          ₹${item.price} × ${item.qty}
        </div>
        <button onclick="removeFromCart('${item.name}')">❌</button>
      </div>
    `;
  });

  cartDetails.innerHTML += `<div><strong>Total: ₹${total}</strong></div>`;
}

// Remove item from cart by name
function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCartUI();
}
