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
`;
document.head.appendChild(layoutFixStyle);

const catalogCoreScript = document.createElement("script");
catalogCoreScript.src = "catalog-core.js";
catalogCoreScript.async = false;
document.body.appendChild(catalogCoreScript);
