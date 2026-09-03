const layoutFixStyle = document.createElement("style");
layoutFixStyle.textContent = `
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

/* Bigger, easier-to-read desktop header */
.header .nav {
  min-height:150px;
  padding:20px 0;
  gap:38px;
}
.header .brand {
  flex:0 0 22rem;
  width:22rem;
}
.header .menu {
  gap:32px;
  font-size:1.05rem;
}
.header .menu a {
  padding:16px 0;
}
.header .nav-actions {
  gap:15px;
}
.header .header-socials {
  gap:12px;
}
.header .header-icon {
  min-height:58px;
  padding:11px 16px;
  gap:10px;
  border-radius:15px;
}
.header .social-icon-badge {
  width:32px;
  height:32px;
  flex-basis:32px;
  border-radius:9px;
}
.header .social-icon-badge .icon {
  width:18px;
  height:18px;
}
.header .social-label,
.header .location-link .social-label {
  font-size:.94rem;
}
.header .location-link .social-icon-badge {
  width:28px;
  flex-basis:28px;
}
.header .location-link .icon {
  width:22px;
  height:22px;
}
.header .nav-actions > .whatsapp-button {
  min-height:62px;
  padding:14px 21px;
  border-radius:16px;
  font-size:1.02rem;
}
.header .whatsapp-button .icon {
  width:25px;
  height:25px;
}
`;
document.head.appendChild(layoutFixStyle);

const catalogCoreScript = document.createElement("script");
catalogCoreScript.src = "catalog-core.js";
catalogCoreScript.async = false;
document.body.appendChild(catalogCoreScript);
