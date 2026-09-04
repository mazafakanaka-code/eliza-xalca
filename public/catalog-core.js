const CATALOG_PAGE_SIZE = 12;
let products = [];
let catalogProducts = [];
let visibleProductCount = 0;
let selectedProduct = null;
let returnFocus = null;
let photoSequence = 0;

const byId = id => document.getElementById(id);
const textValue = value => typeof value === "string" ? value.trim() : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
const escapeHtml = value => textValue(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function productImageMarkup(photo, alt, useThumbnail = true) {
  const src = escapeHtml(useThumbnail ? photo.thumbnail || photo.src : photo.src);
  const crop = photo.crop;
  if (crop && [crop.x, crop.y, crop.width, crop.height, crop.sourceWidth, crop.sourceHeight].every(Number.isFinite)
      && crop.x >= 0 && crop.y >= 0 && crop.width > 0 && crop.height > 0
      && crop.x + crop.width <= crop.sourceWidth && crop.y + crop.height <= crop.sourceHeight) {
    const clipId = `photo-crop-${++photoSequence}`;
    return `<svg class="product-image" role="img" aria-label="${escapeHtml(alt)}" width="${crop.width}" height="${crop.height}" viewBox="0 0 ${crop.width} ${crop.height}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${clipId}"><rect width="${crop.width}" height="${crop.height}"/></clipPath></defs><g clip-path="url(#${clipId})"><image href="${src}" x="${-crop.x}" y="${-crop.y}" width="${crop.sourceWidth}" height="${crop.sourceHeight}"/></g></svg>`;
  }
  return `<img class="product-image" src="${src}" alt="${escapeHtml(alt)}" width="${photo.width}" height="${photo.height}" loading="${useThumbnail ? "lazy" : "eager"}" decoding="async">`;
}

function productPrice(product) {
  if (typeof product.price !== "number" && typeof product.price !== "string") return null;
  const value = textValue(product.price);
  if (!value) return null;
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function priceLabel(price) {
  return new Intl.NumberFormat("az-AZ", {maximumFractionDigits:2}).format(price) + " ₼";
}

function productDetails(product) {
  const fields = [["Ölçü", product.size], ["Material", product.material], ["Rəng", product.color], ["Üslub", product.style], ["Otaq", product.room]];
  if (product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)) {
    for (const [label, value] of Object.entries(product.specifications)) fields.push([label, value]);
  }
  return fields.filter(([label, value]) => textValue(label) && textValue(value));
}

function updateCatalogControls() {
  const total = catalogProducts.length;
  const remaining = total - visibleProductCount;
  byId("resultCount").textContent = remaining > 0 ? `${visibleProductCount} / ${total} xalça göstərilir` : `${total} xalça göstərilir`;
  byId("catalogMore").hidden = remaining <= 0;
  byId("loadMoreButton").disabled = remaining <= 0;
  byId("loadMoreCount").textContent = `+${Math.min(CATALOG_PAGE_SIZE, remaining)}`;
}

function appendProductBatch(focusNewCards = false) {
  const grid = byId("productGrid");
  const nextProducts = catalogProducts.slice(visibleProductCount, visibleProductCount + CATALOG_PAGE_SIZE);
  let firstNewCard = null;
  for (const product of nextProducts) {
    const photo = product.images[0];
    const price = productPrice(product);
    const meta = [product.room, product.style, product.size].map(textValue).filter(Boolean);
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.productId = product.id;
    card.innerHTML = `<div class="card-visual">${productImageMarkup(photo, product.name)}</div>
      <div class="card-body"><h3 class="card-title"><button type="button" class="product-open" aria-haspopup="dialog">${escapeHtml(product.name)}</button></h3>
      ${meta.length ? `<p class="card-meta">${meta.map(escapeHtml).join(" · ")}</p>` : ""}
      ${price !== null ? `<div class="card-row"><div class="price">${priceLabel(price)}</div></div>` : ""}</div>`;
    card.querySelector(".product-open").addEventListener("click", () => openModal(product));
    grid.appendChild(card);
    if (!firstNewCard) firstNewCard = card;
  }
  visibleProductCount += nextProducts.length;
  updateCatalogControls();
  if (focusNewCards && firstNewCard) {
    firstNewCard.querySelector(".product-open").focus({preventScroll:true});
    firstNewCard.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start"});
  }
}

function renderProducts(list) {
  catalogProducts = list;
  visibleProductCount = 0;
  byId("productGrid").innerHTML = "";
  if (!list.length) {
    byId("productGrid").innerHTML = '<div class="catalog-empty"><strong>Uyğun xalça tapılmadı</strong><p>Axtarışı dəyişib yenidən yoxlayın.</p></div>';
    updateCatalogControls();
    return;
  }
  appendProductBatch();
}

function loadMoreProducts() { appendProductBatch(true); }

function configureFilters() {
  for (const [id, key, label] of [["roomFilter", "room", "Bütün otaqlar"], ["styleFilter", "style", "Bütün üslublar"]]) {
    const values = [...new Set(products.map(product => textValue(product[key])).filter(Boolean))];
    const select = byId(id);
    select.innerHTML = `<option value="">${label}</option>` + values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
    select.hidden = values.length === 0;
  }
  byId("sortFilter").hidden = !products.some(product => productPrice(product) !== null);
}

function filterProducts() {
  const query = byId("searchInput").value.toLocaleLowerCase("az").trim();
  const room = byId("roomFilter").value;
  const style = byId("styleFilter").value;
  const sort = byId("sortFilter").value;
  const list = products.filter(product => {
    const searchable = `${product.name} ${product.id}`.toLocaleLowerCase("az");
    return searchable.includes(query) && (!room || product.room === room) && (!style || product.style === style);
  });
  if (sort === "low" || sort === "high") {
    list.sort((a,b) => {
      const left = productPrice(a), right = productPrice(b);
      if (left === null) return right === null ? 0 : 1;
      if (right === null) return -1;
      return sort === "low" ? left - right : right - left;
    });
  }
  renderProducts(list);
}

function resetFilters() {
  byId("searchInput").value = "";
  byId("roomFilter").value = "";
  byId("styleFilter").value = "";
  byId("sortFilter").value = "default";
  renderProducts(products);
}

function showProductImage(index) {
  if (!selectedProduct || !selectedProduct.images[index]) return;
  const photo = selectedProduct.images[index];
  const image = byId("modalImage");
  image.src = photo.src;
  image.alt = selectedProduct.name + (selectedProduct.images.length > 1 ? ` — ${index + 1}` : "");
  image.width = photo.width;
  image.height = photo.height;
  image.hidden = !!photo.crop;
  byId("modalImageCrop").hidden = !photo.crop;
  byId("modalImageCrop").innerHTML = photo.crop ? productImageMarkup(photo, image.alt, false) : "";
  byId("modalThumbnails").querySelectorAll("button").forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
}

function openModal(product) {
  returnFocus = document.activeElement;
  selectedProduct = product;
  byId("modalTitle").textContent = product.name;
  const description = textValue(product.description);
  byId("modalDesc").textContent = description;
  byId("modalDesc").hidden = !description;
  const details = productDetails(product);
  byId("modalSpecs").innerHTML = details.map(([label, value]) => `<li><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></li>`).join("");
  byId("modalSpecs").hidden = details.length === 0;
  const price = productPrice(product);
  byId("modalPrice").textContent = price !== null ? priceLabel(price) : "";
  byId("modalPrice").hidden = price === null;
  const message = `Salam! ${product.name} (${product.id}) xalçası ilə maraqlanıram.`;
  byId("modalWhatsApp").href = "https://wa.me/994706328232?text=" + encodeURIComponent(message);
  const thumbnails = byId("modalThumbnails");
  thumbnails.innerHTML = "";
  thumbnails.hidden = product.images.length < 2;
  if (product.images.length > 1) {
    product.images.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "photo-thumbnail";
      button.setAttribute("aria-label", `${index + 1}-ci şəkli göstər`);
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = productImageMarkup(photo, "");
      button.addEventListener("click", () => showProductImage(index));
      thumbnails.appendChild(button);
    });
  }
  showProductImage(0);
  byId("productModal").classList.add("open");
  document.body.style.overflow = "hidden";
  byId("modalClose").focus({preventScroll:true});
}

function closeModal() {
  byId("productModal").classList.remove("open");
  document.body.style.overflow = "";
  selectedProduct = null;
  if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll:true});
}

function closeModalOutside(event) { if (event.target.id === "productModal") closeModal(); }

document.addEventListener("keydown", event => {
  if (!byId("productModal").classList.contains("open")) return;
  if (event.key === "Escape") closeModal();
  if (event.key === "Tab") {
    const targets = [...byId("productModal").querySelectorAll('button:not([disabled]), a[href]')].filter(element => !element.closest("[hidden]"));
    const first = targets[0], last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

async function loadCatalog() {
  byId("productGrid").setAttribute("aria-busy", "true");
  byId("resultCount").textContent = "Kataloq yüklənir…";
  byId("catalogMore").hidden = true;
  try {
    let response;
    try {
      response = await fetch("https://eliza-catalog-data.bubbly-moose-3025.chatgpt.site/api/catalog", {cache:"no-store"});
      if (!response.ok) throw new Error("Remote catalog unavailable");
    } catch (_) {
      response = await fetch("products.json?v=20260904-b04");
    }
    if (!response.ok) throw new Error("Catalog unavailable");
    const data = await response.json();
    if (!Array.isArray(data.products)) throw new Error("Invalid catalog");
    products = data.products;
    configureFilters();
    filterProducts();
  } catch (error) {
    byId("resultCount").textContent = "";
    byId("productGrid").innerHTML = '<div class="catalog-empty"><strong>Kataloq yüklənmədi</strong><p>Zəhmət olmasa, yenidən cəhd edin.</p><button type="button" class="btn-secondary" onclick="loadCatalog()">Yenidən yüklə</button></div>';
  } finally {
    byId("productGrid").setAttribute("aria-busy", "false");
  }
}

const siteHeader = document.querySelector(".header");
function syncHeaderOffset() {
  const sticky = getComputedStyle(siteHeader).position === "sticky";
  document.documentElement.style.setProperty("--header-offset", (sticky ? siteHeader.offsetHeight + 20 : 20) + "px");
}
syncHeaderOffset();
if ("ResizeObserver" in window) new ResizeObserver(syncHeaderOffset).observe(siteHeader);
window.addEventListener("resize", syncHeaderOffset, {passive:true});
loadCatalog();
