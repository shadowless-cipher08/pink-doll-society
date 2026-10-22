
const CART_KEY = "pinkDollSocietyCart";

const checkoutItems = document.getElementById("checkout-items");
const checkoutEmpty = document.getElementById("checkout-empty");
const summaryCount = document.getElementById("summary-count");
const subtotalElement = document.getElementById("checkout-subtotal");
const totalElement = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");
const checkoutMessage = document.getElementById("checkout-message");
const placeOrderButton = document.getElementById("place-order-button");

function getCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(saved)) return [];

    return saved.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      Number.isFinite(Number(item.price)) &&
      Number(item.price) >= 0 &&
      Number.isFinite(Number(item.quantity)) &&
      Number(item.quantity) > 0
    );
  } catch {
    return [];
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function money(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

function renderCheckout() {
  const cart = getCart();
  const itemCount = cart.reduce(
    (total, item) => total + Number(item.quantity), 0
  );

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity), 0
  );

  summaryCount.textContent =
    `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  subtotalElement.textContent = money(subtotal);
  totalElement.textContent = money(subtotal);

  checkoutEmpty.hidden = cart.length !== 0;
  checkoutItems.hidden = cart.length === 0;
  checkoutForm.hidden = cart.length === 0;
  placeOrderButton.disabled = cart.length === 0;

  checkoutItems.innerHTML = cart.map(item => {
    const image = typeof item.image === "string" ? item.image : "";
    const length = Number(item.length);
    const quantity = Number(item.quantity);
    const lineTotal = Number(item.price) * quantity;

    return `
      <article class="summary-item">
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(item.name)}"
          onerror="this.style.visibility='hidden'"
        >
        <div>
          <h3>${escapeHTML(item.name)}</h3>
          <p>${escapeHTML(item.category || "Premium Hair")}</p>
          <p>Length: ${Number.isFinite(length) ? `${length}"` : "Not selected"}</p>
          <p>Quantity: ${quantity}</p>
          <strong>${money(lineTotal)}</strong>
        </div>
      </article>
    `;
  }).join("");
}

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();

  if (getCart().length === 0) {
    checkoutMessage.textContent =
      "Your bag is empty. Add a hair favorite before checking out.";
    return;
  }

  checkoutMessage.textContent =
    "Your checkout form is ready, but payment processing has not been connected. No order has been placed and no payment has been taken.";
});

renderCheckout();
