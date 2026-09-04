const viewportMeta = document.querySelector('meta[name="viewport"]');
if (viewportMeta) {
  viewportMeta.setAttribute('content', 'width=1440, user-scalable=yes');
}

const layoutFixStyle = document.createElement("style");
layoutFixStyle.textContent = `
:root {
  --maxw:1360px;
}
html,
body {
  min-width:1440px !important;
}
body {
  overflow-x:hidden;
}
.container {
  width:1360px !important;
  max-width:1360px !important;
  margin-left:auto !important;
  margin-right:auto !important;
}

.catalog-grid {align-items:stretch;}
.card {height:100%;}
.card-visual {
  flex:0 0 292px;
  width:100%;
  height:292px;
  min-height:292px;
  max-height:292px;
  aspect-ratio:auto;
}
.product-image {
  width:100%;
  height:100%;
  max-width:100%;
  max-height:100%;
  object-fit:contain;
}
.delivery-note {
  grid-template-columns:170px minmax(0,1fr);
  align-items:center;
  gap:16px;
}
.delivery-truck {
  display:block;
  width:160px;
  height:auto;
  max-height:none;
  object-fit:contain;
  justify-self:center;
  align-self:center;
  margin:0 auto;
  transform:none;
}

/* Larger desktop header, but kept inside the same 1360px grid as the whole site. */
.header .nav {
  width:1360px !important;
  max-width:1360px !important;
  min-height:146px;
  padding:18px 0;
  gap:32px;
}
.header .brand {
  flex:0 0 20rem;
  width:20rem;
}
.header .menu {
  gap:28px;
  font-size:1.02rem;
}
.header .menu a {
  padding:15px 0;
}
.header .nav-actions {
  gap:12px;
  min-width:0;
}
.header .header-socials {
  gap:10px;
}
.header .header-icon {
  min-height:56px;
  padding:10px 14px;
  gap:9px;
  border-radius:14px;
}
.header .social-icon-badge {
  width:30px;
  height:30px;
  flex-basis:30px;
  border-radius:9px;
}
.header .social-icon-badge .icon {
  width:17px;
  height:17px;
}
.header .social-label,
.header .location-link .social-label {
  font-size:.9rem;
}
.header .location-link .social-icon-badge {
  width:26px;
  flex-basis:26px;
}
.header .location-link .icon {
  width:21px;
  height:21px;
}
.header .nav-actions > .whatsapp-button {
  min-height:58px;
  padding:13px 18px;
  border-radius:15px;
  font-size:.98rem;
}
.header .whatsapp-button .icon {
  width:24px;
  height:24px;
}

/* Larger product viewer with previous/next carpet navigation. */
.modal {
  padding:20px 60px !important;
}
.modal-card {
  width:min(1320px,100%) !important;
  max-height:94vh !important;
  grid-template-columns:minmax(0,1.58fr) minmax(370px,.82fr) !important;
  border-radius:28px !important;
}
.modal-visual {
  padding:28px !important;
}
.modal-photo {
  min-height:580px !important;
}
.modal-photo img,
.modal-photo svg {
  max-height:80vh !important;
}
.modal-content {
  padding:72px 42px 42px !important;
}
.modal-product-nav {
  position:fixed;
  top:50%;
  z-index:103;
  display:grid;
  place-items:center;
  width:52px;
  height:76px;
  padding:0;
  border:1px solid rgba(255,255,255,.68);
  border-radius:18px;
  background:rgba(255,255,255,.94);
  color:#71202b;
  font-family:Arial,sans-serif;
  font-size:46px;
  font-weight:400;
  line-height:1;
  box-shadow:0 14px 34px rgba(0,0,0,.18);
  transform:translateY(-50%);
  transition:transform .18s ease,background .18s ease,box-shadow .18s ease;
}
.modal-product-nav:hover {
  background:#fff;
  box-shadow:0 18px 42px rgba(0,0,0,.24);
}
.modal-product-nav:active {
  transform:translateY(-50%) scale(.96);
}
.modal-product-nav[hidden] {
  display:none !important;
}
.modal-product-prev {left:8px;}
.modal-product-next {right:8px;}

@media (max-height:820px) {
  .modal-photo {min-height:450px !important;}
  .modal-content {padding-top:58px !important;}
}
`;
document.head.appendChild(layoutFixStyle);

const catalogCoreScript = document.createElement("script");
catalogCoreScript.src = "catalog-core.js?v=20260904-b03";
catalogCoreScript.async = false;

catalogCoreScript.addEventListener("load", () => {
  const modal = document.getElementById("productModal");
  if (!modal || typeof openModal !== "function") return;

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.id = "modalProductPrev";
  prevButton.className = "modal-product-nav modal-product-prev";
  prevButton.setAttribute("aria-label", "Əvvəlki xalça");
  prevButton.innerHTML = "‹";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.id = "modalProductNext";
  nextButton.className = "modal-product-nav modal-product-next";
  nextButton.setAttribute("aria-label", "Növbəti xalça");
  nextButton.innerHTML = "›";

  modal.insertBefore(prevButton, modal.firstChild);
  modal.appendChild(nextButton);

  const originalOpenModal = openModal;

  function currentModalList() {
    if (typeof catalogProducts !== "undefined" && Array.isArray(catalogProducts) && catalogProducts.length) return catalogProducts;
    if (typeof products !== "undefined" && Array.isArray(products)) return products;
    return [];
  }

  function updateModalProductNavigation() {
    const list = currentModalList();
    const hide = list.length < 2 || !selectedProduct;
    prevButton.hidden = hide;
    nextButton.hidden = hide;
    if (hide) return;

    const index = list.findIndex(product => product.id === selectedProduct.id);
    if (index < 0) return;
    const previous = list[(index - 1 + list.length) % list.length];
    const next = list[(index + 1) % list.length];
    prevButton.setAttribute("aria-label", `Əvvəlki xalça: ${previous.name}`);
    nextButton.setAttribute("aria-label", `Növbəti xalça: ${next.name}`);
  }

  function navigateModalProduct(direction, focusButton) {
    const list = currentModalList();
    if (list.length < 2 || !selectedProduct) return;
    const index = list.findIndex(product => product.id === selectedProduct.id);
    if (index < 0) return;

    const previousReturnFocus = returnFocus;
    const nextIndex = (index + direction + list.length) % list.length;
    originalOpenModal(list[nextIndex]);
    returnFocus = previousReturnFocus;
    updateModalProductNavigation();

    const card = modal.querySelector(".modal-card");
    if (card) card.scrollTop = 0;
    if (focusButton) requestAnimationFrame(() => focusButton.focus({preventScroll:true}));
  }

  openModal = function(product) {
    originalOpenModal(product);
    updateModalProductNavigation();
  };

  prevButton.addEventListener("click", event => {
    event.stopPropagation();
    navigateModalProduct(-1, prevButton);
  });

  nextButton.addEventListener("click", event => {
    event.stopPropagation();
    navigateModalProduct(1, nextButton);
  });

  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("open")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateModalProduct(-1, null);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateModalProduct(1, null);
    }
  });
});

document.body.appendChild(catalogCoreScript);
