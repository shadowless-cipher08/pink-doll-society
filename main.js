
document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const cartCount = document.getElementById("cart-count");

  if (cartCount) {
    try {
      const cart = JSON.parse(
        localStorage.getItem("pinkDollSocietyCart") || "[]"
      );

      cartCount.textContent = cart.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0
      );
    } catch {
      cartCount.textContent = "0";
    }
  }
});
