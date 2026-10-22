
const products = [
  {
    id: "pds-straight",
    name: "The Doll Straight",
    category: "Silky Straight",
    description: "Sleek, smooth hair for a flawless finish.",
    price: 85,
    image: "assets/images/doll-straight.jpg",
    badge: "THE CLASSIC"
  },
  {
    id: "pds-body-wave",
    name: "The Society Wave",
    category: "Body Wave",
    description: "Soft, flowing waves with effortless volume.",
    price: 90,
    image: "assets/images/society-body-wave.jpg",
    badge: "BESTSELLER"
  },
  {
    id: "pds-deep-wave",
    name: "The Baddie Wave",
    category: "Deep Wave",
    description: "Defined waves for a bold, glamorous look.",
    price: 95,
    image: "assets/images/baddie-deep-wave.jpg",
    badge: "DOLL FAVORITE"
  }
];

// Available lengths. Confirm your actual stock before launch.
const availableLengths = [14, 16, 18, 20, 22, 24, 26, 28, 30];

// TEMPORARY pricing example:
// Adds $5 for every 2 inches above 14 inches.
// Replace this formula with your actual prices before launch.
function getLengthPrice(basePrice, length) {
  return basePrice + ((length - 14) / 2) * 5;
}

const grid = document.getElementById("product-grid");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("cart-toast");

// Read the shopping cart from browser storage.
function readCart() {
  try {
    const value = JSON.parse(
      localStorage.getItem("pinkDollSocietyCart") || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}

// Save the shopping cart.
function saveCart(cart) {
  localStorage.setItem("pinkDollSocietyCart", JSON.stringify(cart));
}

// Update the cart quantity displayed on the page.
function updateCartCount() {
  const count = readCart().reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  if (cartCount) {
    cartCount.textContent = count;
  }
}

// Display a temporary confirmation message.
function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timer);

  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Display all products.
function renderProducts() {
  if (!grid) return;

  grid.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img
          src="${product.image}"
          alt="${product.category} hair extensions"
          loading="lazy"
        >
        <span class="product-badge">${product.badge}</span>
      </div>

      <div class="product-info">
        <p class="product-category">${product.category}</p>

        <h3>${product.name}</h3>

        <p class="product-description">
          ${product.description}
        </p>

        <p class="product-price" id="price-${product.id}">
          $${getLengthPrice(product.price, 14).toFixed(2)}
        </p>

        <label
          class="product-length-label"
          for="length-${product.id}"
        >
          SELECT LENGTH
        </label>

        <select
          class="product-length"
          id="length-${product.id}"
          aria-label="Select length for ${product.name}"
        >
          ${availableLengths.map(length => `
            <option value="${length}">
              ${length} inches
            </option>
          `).join("")}
        </select>

        <button
          class="add-to-bag"
          type="button"
          data-product-id="${product.id}"
        >
          ADD TO BAG
        </button>
      </div>
    </article>
  `).join("");

  const total = document.getElementById("product-total");

  if (total) {
    total.textContent = `${products.length} styles to explore`;
  }

  // Show a pink fallback if a product image cannot load.
  grid.querySelectorAll(".product-image-wrap img").forEach(img => {
    img.addEventListener("error", () => {
      img.style.display = "none";

      img.parentElement.style.background =
        "linear-gradient(135deg, #f9d6e8, #e9a8c9)";

      img.parentElement.setAttribute(
        "aria-label",
        "Add the correct product photo to the images folder"
      );
    }, { once: true });
  });
}

// Update the displayed price whenever a length changes.
if (grid) {
  grid.addEventListener("change", event => {
    const select = event.target.closest(".product-length");

    if (!select) return;

    const productId = select.id.replace("length-", "");

    const product = products.find(item => item.id === productId);

    if (!product) return;

    const selectedLength = Number(select.value);

    const priceElement = document.getElementById(
      `price-${product.id}`
    );

    if (priceElement) {
      const selectedPrice = getLengthPrice(
        product.price,
        selectedLength
      );

      priceElement.textContent = `$${selectedPrice.toFixed(2)}`;
    }
  });

  // Add the selected product, length, and price to the cart.
  grid.addEventListener("click", event => {
    const button = event.target.closest(".add-to-bag");

    if (!button) return;

    const product = products.find(
      item => item.id === button.dataset.productId
    );

    if (!product) return;

    const lengthSelect = document.getElementById(
      `length-${product.id}`
    );

    if (!lengthSelect) return;

    const length = Number(lengthSelect.value);

    const selectedPrice = getLengthPrice(
      product.price,
      length
    );

    const cart = readCart();

    const existingItem = cart.find(item =>
      item.id === product.id &&
      Number(item.length) === length
    );

    if (existingItem) {
      existingItem.quantity =
        (Number(existingItem.quantity) || 0) + 1;

      // Keep the saved price in sync with the selected length.
      existingItem.price = selectedPrice;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: selectedPrice,
        length: length,
        quantity: 1,
        image: product.image
      });
    }

    saveCart(cart);
    updateCartCount();

    showToast(
      `${product.name}, ${length}" added to your bag.`
    );
  });
}

// Update the copyright year if the element exists.
const footerYear = document.getElementById("footer-year");

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// Start the product page.
renderProducts();
updateCartCount();
