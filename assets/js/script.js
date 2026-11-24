/**
 * Atelier Véla — Clothing Apparel Catalog Application Logic
 * Features:
 * 1. Dynamic Product Catalog Rendering + Real-time Search, Multi-Criteria Filtering (Category, Size, Max Price), and Sorting
 * 2. Persistent Shopping Bag & Saved Lookbook (Wishlist) powered by localStorage with dynamic subtotal, tax, shipping, and promo calculations
 * 3. Quick-View Product Detail Modal + Interactive Size Guide / Unit Converter (CM / IN)
 * 4. Comprehensive Form Validation (Order/Reservation Checkout Form & Style Inquiry Form) with real-time accessible error feedback
 */

"use strict";

const CATALOG_PRODUCTS = [
  {
    id: "AV-101",
    name: "Relaxed Linen Camp Shirt",
    category: "Tops",
    price: 78.00,
    sizes: ["XS", "S", "M", "L", "XL"],
    color: "Oatmeal Cream",
    fabric: "100% European Flax Linen",
    featured: true,
    image: "linen-shirt.svg",
    description: "Breathable open-collar camp shirt crafted from stone-washed European flax linen with mother-of-pearl buttons."
  },
  {
    id: "AV-102",
    name: "Japanese Selvedge Denim",
    category: "Bottoms",
    price: 145.00,
    sizes: ["S", "M", "L", "XL"],
    color: "Raw Indigo",
    fabric: "13.5oz Okayama Cotton Denim",
    featured: true,
    image: "selvedge-denim.svg",
    description: "Mid-rise straight-leg jeans woven on vintage shuttle looms in Okayama, designed to develop rich natural fades."
  },
  {
    id: "AV-103",
    name: "Fine Merino Crewneck",
    category: "Knitwear",
    price: 112.00,
    sizes: ["XS", "S", "M", "L"],
    color: "Warm Terracotta",
    fabric: "100% Extra-Fine Merino Wool",
    featured: true,
    image: "merino-knit.svg",
    description: "Temperature-regulating lightweight knit with fully-fashioned raglan sleeves and ribbed cuffs."
  },
  {
    id: "AV-104",
    name: "Storm-Proof Trench Coat",
    category: "Outerwear",
    price: 240.00,
    sizes: ["S", "M", "L", "XL"],
    color: "Stone Khaki",
    fabric: "Organic Cotton Gabardine (PFC-Free DWR)",
    featured: true,
    image: "trench-coat.svg",
    description: "Double-breasted heritage trench tailored with storm flaps, belted waist, and breathable cupro lining."
  },
  {
    id: "AV-105",
    name: "Tailored Wool Trousers",
    category: "Bottoms",
    price: 132.00,
    sizes: ["XS", "S", "M", "L"],
    color: "Charcoal Slate",
    fabric: "98% Virgin Wool, 2% Elastane",
    featured: false,
    image: "pleated-trousers.svg",
    description: "Double-pleated relaxed trousers featuring crisp front creases, side adjusters, and an ankle-grazing taper."
  },
  {
    id: "AV-106",
    name: "Heavyweight Supima Tee",
    category: "Tops",
    price: 44.00,
    sizes: ["XS", "S", "M", "L", "XL"],
    color: "Alabaster White",
    fabric: "280gsm Organic Supima Cotton",
    featured: false,
    image: "cotton-tee.svg",
    description: "Structured boxy crewneck tee engineered with a dense collar rib that holds its shape wash after wash."
  },
  {
    id: "AV-107",
    name: "Canvas Workwear Jacket",
    category: "Outerwear",
    price: 168.00,
    sizes: ["S", "M", "L", "XL"],
    color: "Forest Sage",
    fabric: "12oz Organic Cotton Duck Canvas",
    featured: false,
    image: "chore-jacket.svg",
    description: "French-inspired chore coat finished with triple-needle felled seams and three reinforced patch pockets."
  },
  {
    id: "AV-108",
    name: "Brushed Cashmere Cardigan",
    category: "Knitwear",
    price: 195.00,
    sizes: ["XS", "S", "M", "L"],
    color: "Chestnut Clay",
    fabric: "100% Grade-A Inner Mongolian Cashmere",
    featured: false,
    image: "cashmere-cardigan.svg",
    description: "Plush V-neck cardigan with natural corozo nut buttons and dropped shoulders for effortless layering."
  },
  {
    id: "AV-109",
    name: "Bias-Cut Mulberry Dress",
    category: "Dresses",
    price: 185.00,
    sizes: ["XS", "S", "M", "L"],
    color: "Blush Sand",
    fabric: "100% Bluesign Certified Mulberry Silk",
    featured: false,
    image: "silk-midi.svg",
    description: "Fluid midi-length slip dress cut on the bias for natural stretch and luminous drape."
  }
];

const STORAGE_KEYS = {
  CART: "atelier_vela_cart_v1",
  WISHLIST: "atelier_vela_wishlist_v1",
  ORDERS: "atelier_vela_orders_v1"
};

/* ---------- Path Resolver (handles root index.html vs /pages/*.html) ---------- */
function getAssetPrefix() {
  return window.location.pathname.includes("/pages/") ? "../assets/images/" : "assets/images/";
}

function getPagePrefix() {
  return window.location.pathname.includes("/pages/") ? "" : "pages/";
}

/* ---------- Browser Storage Helpers ---------- */
function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading cart from localStorage:", err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateNavbarBadges();
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
  }
}

function getWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading wishlist from localStorage:", err);
    return [];
  }
}

function saveWishlist(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    updateNavbarBadges();
  } catch (err) {
    console.error("Error saving wishlist to localStorage:", err);
  }
}

function updateNavbarBadges() {
  const cart = getCart();
  const wishlist = getWishlist();
  const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

  document.querySelectorAll(".js-cart-count").forEach((el) => {
    el.textContent = totalCartItems;
  });
  document.querySelectorAll(".js-wishlist-count").forEach((el) => {
    el.textContent = wishlist.length;
  });
}

/* ---------- Toast Notification Helper ---------- */
function showToastNotification(message, variant = "dark") {
  let container = document.getElementById("atelierToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "atelierToastContainer";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "1080";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${variant} border-0 show`;
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close notification"></button>
    </div>
  `;

  toastEl.querySelector("button").addEventListener("click", () => toastEl.remove());
  container.appendChild(toastEl);

  setTimeout(() => {
    if (toastEl.parentNode) toastEl.remove();
  }, 3200);
}

/* ---------- Cart & Wishlist Actions ---------- */
function addToCart(productId, selectedSize = "M") {
  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const validSize = product.sizes.includes(selectedSize) ? selectedSize : product.sizes[0];
  const cart = getCart();
  const existingIndex = cart.findIndex(
    (item) => item.id === productId && item.size === validSize
  );

  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: validSize,
      image: product.image,
      qty: 1
    });
  }

  saveCart(cart);
  showToastNotification(`Added <strong>${product.name}</strong> (Size ${validSize}) to your bag.`);
  if (document.getElementById("cartItemsContainer")) {
    renderCartPage();
  }
}

function toggleWishlist(productId) {
  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  let wishlist = getWishlist();
  const exists = wishlist.includes(productId);

  if (exists) {
    wishlist = wishlist.filter((id) => id !== productId);
    showToastNotification(`Removed <strong>${product.name}</strong> from saved Lookbook.`, "secondary");
  } else {
    wishlist.push(productId);
    showToastNotification(`Saved <strong>${product.name}</strong> to your Lookbook.`);
  }

  saveWishlist(wishlist);

  // Refresh active views if present
  if (document.getElementById("featuredCatalogGrid")) renderFeaturedProducts();
  if (document.getElementById("catalogGrid")) applyCatalogFilters();
  if (document.getElementById("lookbookGrid")) renderLookbookWishlist();
}

/* ---------- Product Card Template ---------- */
function createProductCardHTML(product) {
  const wishlist = getWishlist();
  const isSaved = wishlist.includes(product.id);
  const imgSrc = `${getAssetPrefix()}${product.image}`;

  const sizeOptions = product.sizes
    .map((sz) => `<option value="${sz}" ${sz === "M" ? "selected" : ""}>${sz}</option>`)
    .join("");

  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <article class="product-card" aria-label="${product.name}">
        <div class="product-img-wrapper">
          <img src="${imgSrc}" alt="${product.name} in ${product.color}" loading="lazy">
          <span class="badge-category">${product.category}</span>
          <button
            type="button"
            class="btn-wishlist-toggle ${isSaved ? "saved" : ""}"
            data-action="toggle-wishlist"
            data-id="${product.id}"
            aria-label="${isSaved ? "Remove from saved lookbook" : "Save to lookbook"}: ${product.name}"
            aria-pressed="${isSaved}"
            title="${isSaved ? "Saved in Lookbook" : "Save to Lookbook"}"
          >
            ${isSaved ? "&#9829;" : "&#9825;"}
          </button>
        </div>
        <div class="product-card-body">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <h3 class="h5 mb-0">${product.name}</h3>
            <span class="product-price">$${product.price.toFixed(2)}</span>
          </div>
          <p class="text-muted small mb-2">${product.color} &bull; ${product.fabric}</p>
          <p class="small mb-3">${product.description}</p>

          <div class="mt-auto pt-2 border-top">
            <div class="row g-2 align-items-center">
              <div class="col-5">
                <label for="size-${product.id}" class="visually-hidden">Select size for ${product.name}</label>
                <select id="size-${product.id}" class="form-select form-select-sm js-card-size" aria-label="Size for ${product.name}">
                  ${sizeOptions}
                </select>
              </div>
              <div class="col-7 d-grid">
                <button
                  type="button"
                  class="btn btn-atelier btn-sm"
                  data-action="add-to-cart"
                  data-id="${product.id}"
                >
                  Add to Bag
                </button>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-link btn-sm text-decoration-none px-0 mt-2 text-dark fw-semibold"
              data-action="quick-view"
              data-id="${product.id}"
            >
              View Garment Details &rarr;
            </button>
          </div>
        </div>
      </article>
    </div>
  `;
}

/* ---------- Quick View Modal ---------- */
function openQuickViewModal(productId) {
  const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  let modalEl = document.getElementById("garmentQuickViewModal");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "garmentQuickViewModal";
    modalEl.className = "modal fade";
    modalEl.tabIndex = -1;
    modalEl.setAttribute("aria-labelledby", "quickViewTitle");
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h4" id="quickViewTitle">Garment Details</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close modal"></button>
          </div>
          <div class="modal-body" id="quickViewBody"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  const bodyEl = document.getElementById("quickViewBody");
  const sizeOptions = product.sizes
    .map((sz) => `<option value="${sz}" ${sz === "M" ? "selected" : ""}>${sz}</option>`)
    .join("");

  bodyEl.innerHTML = `
    <div class="row g-4 align-items-center">
      <div class="col-md-5">
        <img src="${getAssetPrefix()}${product.image}" alt="${product.name}" class="img-fluid rounded border">
      </div>
      <div class="col-md-7">
        <span class="badge bg-dark mb-2">${product.category} &bull; SKU ${product.id}</span>
        <h3 class="h3 mb-1">${product.name}</h3>
        <p class="h4 text-danger mb-3">$${product.price.toFixed(2)}</p>
        <p>${product.description}</p>
        <ul class="list-unstyled small bg-light p-3 rounded border mb-3">
          <li class="mb-1"><strong>Colorway:</strong> ${product.color}</li>
          <li class="mb-1"><strong>Composition:</strong> ${product.fabric}</li>
          <li><strong>Available Sizes:</strong> ${product.sizes.join(", ")}</li>
        </ul>
        <div class="row g-2 align-items-end">
          <div class="col-sm-4">
            <label for="modalSizeSelect" class="form-label small fw-semibold">Size</label>
            <select id="modalSizeSelect" class="form-select">${sizeOptions}</select>
          </div>
          <div class="col-sm-8 d-grid">
            <button type="button" class="btn btn-atelier" id="modalAddBtn">Add Garment to Bag</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("modalAddBtn").onclick = () => {
    const chosenSize = document.getElementById("modalSizeSelect").value;
    addToCart(product.id, chosenSize);
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
  };

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

/* ---------- Page 1: Home Featured Grid ---------- */
function renderFeaturedProducts() {
  const grid = document.getElementById("featuredCatalogGrid");
  if (!grid) return;
  const featured = CATALOG_PRODUCTS.filter((p) => p.featured);
  grid.innerHTML = featured.map(createProductCardHTML).join("");
}

/* ---------- Page 2: Full Catalog Filtering, Search & Sorting ---------- */
function applyCatalogFilters() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categoryFilter");
  const sizeSelect = document.getElementById("sizeFilter");
  const priceRange = document.getElementById("priceRange");
  const priceOutput = document.getElementById("priceRangeValue");
  const sortSelect = document.getElementById("sortFilter");
  const resultCount = document.getElementById("catalogResultCount");

  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const category = categorySelect ? categorySelect.value : "All";
  const size = sizeSelect ? sizeSelect.value : "All";
  const maxPrice = priceRange ? parseFloat(priceRange.value) : 300;
  const sortBy = sortSelect ? sortSelect.value : "featured";

  if (priceOutput) {
    priceOutput.textContent = `$${maxPrice}`;
  }

  let filtered = CATALOG_PRODUCTS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.fabric.toLowerCase().includes(query) ||
      item.color.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchesCategory = category === "All" || item.category === category;
    const matchesSize = size === "All" || item.sizes.includes(size);
    const matchesPrice = item.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesSize && matchesPrice;
  });

  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (resultCount) {
    resultCount.textContent = `Showing ${filtered.length} of ${CATALOG_PRODUCTS.length} garments`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border text-center py-5" role="status">
          <h3 class="h5">No garments match your active filters</h3>
          <p class="text-muted mb-3">Try broadening your search keyword, size, or maximum budget.</p>
          <button type="button" class="btn btn-atelier-outline btn-sm" id="emptyResetBtn">Reset All Filters</button>
        </div>
      </div>
    `;
    const emptyReset = document.getElementById("emptyResetBtn");
    if (emptyReset) emptyReset.addEventListener("click", resetCatalogFilters);
    return;
  }

  grid.innerHTML = filtered.map(createProductCardHTML).join("");
}

function resetCatalogFilters() {
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categoryFilter");
  const sizeSelect = document.getElementById("sizeFilter");
  const priceRange = document.getElementById("priceRange");
  const sortSelect = document.getElementById("sortFilter");

  if (searchInput) searchInput.value = "";
  if (categorySelect) categorySelect.value = "All";
  if (sizeSelect) sizeSelect.value = "All";
  if (priceRange) priceRange.value = "250";
  if (sortSelect) sortSelect.value = "featured";

  applyCatalogFilters();
}

function initCatalogControls() {
  if (!document.getElementById("catalogGrid")) return;

  // Check URL parameters (e.g., ?category=Outerwear)
  const params = new URLSearchParams(window.location.search);
  const urlCat = params.get("category");
  const categorySelect = document.getElementById("categoryFilter");
  if (urlCat && categorySelect) {
    const validOptions = Array.from(categorySelect.options).map((o) => o.value);
    if (validOptions.includes(urlCat)) {
      categorySelect.value = urlCat;
    }
  }

  ["searchInput", "categoryFilter", "sizeFilter", "priceRange", "sortFilter"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", applyCatalogFilters);
      el.addEventListener("change", applyCatalogFilters);
    }
  });

  const resetBtn = document.getElementById("resetFiltersBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetCatalogFilters);
  }

  applyCatalogFilters();
}

/* ---------- Page 3: Lookbook Wishlist & Size Guide Unit Converter ---------- */
function renderLookbookWishlist() {
  const grid = document.getElementById("lookbookGrid");
  if (!grid) return;

  const wishlistIds = getWishlist();
  const savedProducts = CATALOG_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  if (savedProducts.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="p-4 bg-white border rounded text-center">
          <h3 class="h5">Your Lookbook Wishlist is Currently Empty</h3>
          <p class="text-muted mb-3">Click the heart icon on any garment in the catalog to save outfits here for quick comparison.</p>
          <a href="${getPagePrefix()}catalog.html" class="btn btn-atelier btn-sm">Explore Full Catalog</a>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = savedProducts.map(createProductCardHTML).join("");
}

function initSizeUnitConverter() {
  const toggleBtn = document.getElementById("toggleUnitBtn");
  const unitLabel = document.getElementById("currentUnitLabel");
  const cells = document.querySelectorAll(".js-measure");
  if (!toggleBtn || cells.length === 0) return;

  let isInches = false;

  toggleBtn.addEventListener("click", () => {
    isInches = !isInches;
    unitLabel.textContent = isInches ? "Inches (in)" : "Centimeters (cm)";
    toggleBtn.textContent = isInches ? "Switch to Centimeters (cm)" : "Switch to Inches (in)";

    cells.forEach((cell) => {
      const cmVal = parseFloat(cell.dataset.cm);
      if (!Number.isNaN(cmVal)) {
        cell.textContent = isInches ? `${(cmVal / 2.54).toFixed(1)}"` : `${cmVal} cm`;
      }
    });
  });
}

/* ---------- Page 4: Shopping Bag Calculations & Checkout Validation ---------- */
let activePromoDiscount = 0;

function renderCartPage() {
  const container = document.getElementById("cartItemsContainer");
  if (!container) return;

  const cart = getCart();
  const subtotalEl = document.getElementById("summarySubtotal");
  const shippingEl = document.getElementById("summaryShipping");
  const taxEl = document.getElementById("summaryTax");
  const discountEl = document.getElementById("summaryDiscount");
  const totalEl = document.getElementById("summaryTotal");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="p-5 bg-white border rounded text-center">
        <h2 class="h4">Your Shopping Bag is Empty</h2>
        <p class="text-muted mb-3">Browse our seasonal collection to add garments to your bag.</p>
        <a href="${getPagePrefix()}catalog.html" class="btn btn-atelier">Browse Apparel Catalog</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    if (shippingEl) shippingEl.textContent = "$0.00";
    if (taxEl) taxEl.textContent = "$0.00";
    if (discountEl) discountEl.textContent = "-$0.00";
    if (totalEl) totalEl.textContent = "$0.00";
    return;
  }

  container.innerHTML = cart
    .map(
      (item, index) => `
      <div class="card mb-3 border">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-3 col-sm-2">
              <img src="${getAssetPrefix()}${item.image}" alt="${item.name}" class="img-fluid rounded border">
            </div>
            <div class="col-9 col-sm-5">
              <h3 class="h6 mb-1">${item.name}</h3>
              <p class="small text-muted mb-1">Size: <strong>${item.size}</strong> &bull; SKU ${item.id}</p>
              <span class="fw-semibold">$${item.price.toFixed(2)} each</span>
            </div>
            <div class="col-7 col-sm-3">
              <div class="input-group input-group-sm" style="max-width: 130px;">
                <button class="btn btn-outline-secondary" type="button" data-action="qty-dec" data-index="${index}" aria-label="Decrease quantity of ${item.name}">&minus;</button>
                <input type="text" class="form-control text-center" value="${item.qty}" readonly aria-label="Quantity for ${item.name}">
                <button class="btn btn-outline-secondary" type="button" data-action="qty-inc" data-index="${index}" aria-label="Increase quantity of ${item.name}">+</button>
              </div>
            </div>
            <div class="col-5 col-sm-2 text-end">
              <div class="fw-bold mb-1">$${(item.price * item.qty).toFixed(2)}</div>
              <button type="button" class="btn btn-link btn-sm text-danger p-0 text-decoration-none" data-action="remove-item" data-index="${index}">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal * activePromoDiscount;
  const taxableAmount = Math.max(0, subtotal - discount);
  const shipping = taxableAmount >= 150 ? 0 : 12.0;
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + shipping + tax;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function initCartControls() {
  const container = document.getElementById("cartItemsContainer");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = parseInt(btn.dataset.index, 10);
    const cart = getCart();

    if (!cart[idx]) return;

    if (action === "qty-inc") {
      cart[idx].qty += 1;
    } else if (action === "qty-dec") {
      if (cart[idx].qty > 1) {
        cart[idx].qty -= 1;
      } else {
        cart.splice(idx, 1);
      }
    } else if (action === "remove-item") {
      cart.splice(idx, 1);
    }

    saveCart(cart);
    renderCartPage();
  });

  const promoBtn = document.getElementById("applyPromoBtn");
  if (promoBtn) {
    promoBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("promoCodeInput");
      const feedback = document.getElementById("promoFeedback");
      const code = codeInput ? codeInput.value.trim().toUpperCase() : "";

      if (code === "VELA15") {
        activePromoDiscount = 0.15;
        feedback.className = "small mt-1 text-success fw-semibold";
        feedback.textContent = "Promo code VELA15 applied (15% off subtotal).";
      } else if (code === "") {
        activePromoDiscount = 0;
        feedback.className = "small mt-1 text-danger";
        feedback.textContent = "Please enter a promo code (try VELA15).";
      } else {
        activePromoDiscount = 0;
        feedback.className = "small mt-1 text-danger";
        feedback.textContent = "Invalid promo code. Use VELA15 for 15% off.";
      }
      renderCartPage();
    });
  }

  renderCartPage();
}

/* ---------- Form Validation Helpers ---------- */
function setFieldValidity(input, isValid, errorMessage = "") {
  const feedbackEl = input.parentElement.querySelector(".invalid-feedback");
  if (isValid) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    input.setAttribute("aria-invalid", "false");
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    if (feedbackEl && errorMessage) {
      feedbackEl.textContent = errorMessage;
    }
  }
  return isValid;
}

function initCheckoutFormValidation() {
  const form = document.getElementById("checkoutDemoForm");
  if (!form) return;

  const fullName = document.getElementById("custName");
  const email = document.getElementById("custEmail");
  const phone = document.getElementById("custPhone");
  const address = document.getElementById("custAddress");
  const zip = document.getElementById("custZip");
  const alertBox = document.getElementById("checkoutAlertBox");

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^[+]?[\d\s\-()]{7,18}$/;
    const zipRegex = /^[A-Za-z0-9\s\-]{4,10}$/;

    const vName = setFieldValidity(
      fullName,
      fullName.value.trim().length >= 3,
      "Please enter your full name (at least 3 characters)."
    );
    const vEmail = setFieldValidity(
      email,
      emailRegex.test(email.value.trim()),
      "Please enter a valid email address (e.g., alex@example.com)."
    );
    const vPhone = setFieldValidity(
      phone,
      phoneRegex.test(phone.value.trim()),
      "Please enter a valid contact number (7–18 digits)."
    );
    const vAddress = setFieldValidity(
      address,
      address.value.trim().length >= 8,
      "Please provide a complete street address (minimum 8 characters)."
    );
    const vZip = setFieldValidity(
      zip,
      zipRegex.test(zip.value.trim()),
      "Please enter a valid postal or ZIP code (4–10 characters)."
    );

    return vName && vEmail && vPhone && vAddress && vZip;
  };

  [fullName, email, phone, address, zip].forEach((field) => {
    field.addEventListener("input", () => {
      if (field.classList.contains("is-invalid") || field.classList.contains("is-valid")) {
        validateForm();
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cart = getCart();

    if (cart.length === 0) {
      alertBox.className = "alert alert-warning mt-3";
      alertBox.textContent = "Your shopping bag is empty. Add at least one garment before placing a demo reservation.";
      alertBox.classList.remove("d-none");
      return;
    }

    if (!validateForm()) {
      alertBox.className = "alert alert-danger mt-3";
      alertBox.textContent = "Please correct the highlighted fields above before submitting your order.";
      alertBox.classList.remove("d-none");
      return;
    }

    const orderRef = "AV-" + Math.floor(100000 + Math.random() * 900000);
    const existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    existingOrders.push({
      orderRef,
      customer: fullName.value.trim(),
      email: email.value.trim(),
      itemsCount: cart.reduce((s, i) => s + i.qty, 0),
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));

    saveCart([]);
    activePromoDiscount = 0;
    renderCartPage();
    form.reset();
    form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));

    alertBox.className = "alert alert-success mt-3";
    alertBox.innerHTML = `<strong>Demo Order Confirmed!</strong> Reference <code>${orderRef}</code> has been saved to browser storage. Thank you for exploring Atelier Véla.`;
    alertBox.classList.remove("d-none");
  });
}

function initStylingInquiryForm() {
  const form = document.getElementById("stylingInquiryForm");
  if (!form) return;

  const nameInput = document.getElementById("inquiryName");
  const emailInput = document.getElementById("inquiryEmail");
  const topicSelect = document.getElementById("inquiryTopic");
  const notesInput = document.getElementById("inquiryNotes");
  const statusBox = document.getElementById("inquiryStatusAlert");

  const validateInquiry = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const okName = setFieldValidity(
      nameInput,
      nameInput.value.trim().length >= 2,
      "Please enter your name."
    );
    const okEmail = setFieldValidity(
      emailInput,
      emailRegex.test(emailInput.value.trim()),
      "Please enter a valid email address."
    );
    const okTopic = setFieldValidity(
      topicSelect,
      topicSelect.value !== "",
      "Please select an inquiry topic."
    );
    const okNotes = setFieldValidity(
      notesInput,
      notesInput.value.trim().length >= 15,
      "Please include at least 15 characters describing your sizing or styling question."
    );
    return okName && okEmail && okTopic && okNotes;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateInquiry()) {
      statusBox.className = "alert alert-danger mt-3";
      statusBox.textContent = "Please review and fix the invalid fields marked in red.";
      statusBox.classList.remove("d-none");
      return;
    }

    statusBox.className = "alert alert-success mt-3";
    statusBox.textContent = `Thank you, ${nameInput.value.trim()}! Your styling consultation request (${topicSelect.value}) has been recorded.`;
    statusBox.classList.remove("d-none");
    form.reset();
    form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
  });
}

/* ---------- Global Event Delegation for Product Cards ---------- */
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const productId = target.dataset.id;

  if (action === "add-to-cart") {
    const card = target.closest(".product-card");
    const sizeSelect = card ? card.querySelector(".js-card-size") : null;
    const chosenSize = sizeSelect ? sizeSelect.value : "M";
    addToCart(productId, chosenSize);
  } else if (action === "toggle-wishlist") {
    toggleWishlist(productId);
  } else if (action === "quick-view") {
    openQuickViewModal(productId);
  }
});

/* ---------- Initialize on DOM Ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateNavbarBadges();
  renderFeaturedProducts();
  initCatalogControls();
  renderLookbookWishlist();
  initSizeUnitConverter();
  initCartControls();
  initCheckoutFormValidation();
  initStylingInquiryForm();
});
