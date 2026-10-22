
document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "pinkDollSocietyCart";

  const cartItemsContainer = document.getElementById("cart-items");
  const itemCountElement = document.getElementById("item-count");
  const subtotalElement = document.getElementById("subtotal");
  const grandTotalElement = document.getElementById("grand-total");
  const checkoutButton = document.getElementById("checkout-button");
  const checkoutMessage = document.getElementById("checkout-message");

  function getCart() {
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
      console.error("Pink Doll Society cart could not be loaded:", error);
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(price) || 0);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    });
  }

  function updateCartCount(cart) {
    const totalQuantity = cart.reduce((total, item) => {
      return total + Math.max(0, Number(item.quantity) || 0);
    }, 0);

    document.querySelectorAll(
      "#cart-count, #cart-badge, #bag-count"
    ).forEach((element) => {
      element.textContent = totalQuantity;
    });

    if (itemCountElement) {
      itemCountElement.textContent =
        `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;
    }
  }

  function renderCart() {
    if (!cartItemsContainer) {
      console.error('Cart container "#cart-items" was not found.');
      return;
    }

    const cart = getCart();

    updateCartCount(cart);

    const subtotal = cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Math.max(0, Number(item.quantity) || 0);

      return total + price * quantity;
    }, 0);

    if (subtotalElement) {
      subtotalElement.textContent = formatPrice(subtotal);
    }

    if (grandTotalElement) {
      grandTotalElement.textContent = formatPrice(subtotal);
    }

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <h2>Your dollhouse bag is empty</h2>
          <p>Your next hair obsession is waiting.</p>
          <a class="continue-shopping" href="products.html">
            SHOP THE COLLECTION
          </a>
        </div>
      `;

      if (checkoutButton) {
        checkoutButton.disabled = true;
      }

      if (checkoutMessage) {
        checkoutMessage.textContent = "";
      }

      return;
    }

    if (checkoutButton) {
      checkoutButton.disabled = false;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => {
      const name = escapeHTML(item.name || "Pink Doll Society Hair");
      const category = escapeHTML(item.category || "Luxury Hair");
      const length = escapeHTML(item.length || "Not selected");
      const image = escapeHTML(item.image || "");
      const price = Number(item.price) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      const imageHTML = image
        ? `<img src="${image}" alt="${name}" class="cart-item-image"
             onerror="this.style.display='none'">`
        : "";

      return `
        <article class="cart-item">
          <div class="cart-item-photo">
            ${imageHTML}
          </div>

          <div class="cart-item-details">
            <h3>${name}</h3>
            <p>${category}</p>
            <p>Length: ${length}"</p>
            <p class="cart-item-price">${formatPrice(price)}</p>

            <div class="cart-item-controls">
              <div class="quantity-control">
                <button
                  type="button"
                  data-action="decrease"
                  data-index="${index}"
                  aria-label="Decrease quantity"
                >−</button>

                <span>${quantity}</span>

                <button
                  type="button"
                  data-action="increase"
                  data-index="${index}"
                  aria-label="Increase quantity"
                >+</button>
              </div>

              <button
                type="button"
                class="remove-item"
                data-action="remove"
                data-index="${index}"
              >Remove</button>
            </div>
          </div>

          <div class="cart-item-total">
            ${formatPrice(price * quantity)}
          </div>
        </article>
      `;
    }).join("");
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");

      if (!button) {
        return;
      }

      const action = button.dataset.action;
      const index = Number(button.dataset.index);
      const cart = getCart();

      if (!Number.isInteger(index) || index < 0 || index >= cart.length) {
        return;
      }

      if (action === "increase") {
        cart[index].quantity = (Number(cart[index].quantity) || 1) + 1;
      }

      if (action === "decrease") {
        cart[index].quantity = (Number(cart[index].quantity) || 1) - 1;

        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      }

      if (action === "remove") {
        cart.splice(index, 1);
      }

      saveCart(cart);
      renderCart();
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      const cart = getCart();

      if (cart.length === 0) {
        if (checkoutMessage) {
          checkoutMessage.textContent = "Your bag is empty.";
        }

        return;
      }

      window.location.href = "checkout.html";
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === CART_KEY) {
      renderCart();
    }
  });

  renderCart();
});
