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
`;
document.head.appendChild(layoutFixStyle);

const catalogCoreScript = document.createElement("script");
catalogCoreScript.src = "catalog-core.js";
catalogCoreScript.async = false;
document.body.appendChild(catalogCoreScript);
