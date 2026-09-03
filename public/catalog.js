const viewportMeta = document.querySelector('meta[name="viewport"]');
if (viewportMeta) {
  viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

const layoutFixStyle = document.createElement("style");
layoutFixStyle.textContent = `
html, body {overflow-x:hidden;}
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

/* Bigger desktop header */
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
.header .menu a {padding:16px 0;}
.header .nav-actions {gap:15px;}
.header .header-socials {gap:12px;}
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
.header .social-icon-badge .icon {width:18px;height:18px;}
.header .social-label,
.header .location-link .social-label {font-size:.94rem;}
.header .location-link .social-icon-badge {width:28px;flex-basis:28px;}
.header .location-link .icon {width:22px;height:22px;}
.header .nav-actions > .whatsapp-button {
  min-height:62px;
  padding:14px 21px;
  border-radius:16px;
  font-size:1.02rem;
}
.header .whatsapp-button .icon {width:25px;height:25px;}

@media (max-width: 900px) {
  body {
    min-width:0 !important;
    width:100% !important;
  }
  .container {
    width:calc(100% - 28px) !important;
    max-width:none !important;
  }

  .header {position:relative !important;}
  .header .nav {
    display:grid !important;
    grid-template-columns:1fr !important;
    min-height:0 !important;
    padding:14px 0 16px !important;
    gap:12px !important;
  }
  .header .brand {
    grid-column:1 !important;
    grid-row:1 !important;
    justify-self:center !important;
    flex:none !important;
    width:220px !important;
    max-width:70vw !important;
  }
  .header .menu {
    grid-column:1 !important;
    grid-row:2 !important;
    display:flex !important;
    justify-content:center !important;
    gap:24px !important;
    font-size:.96rem !important;
  }
  .header .menu a {padding:6px 0 !important;}
  .header .nav-actions {
    grid-column:1 !important;
    grid-row:3 !important;
    display:grid !important;
    grid-template-columns:1fr 1fr !important;
    gap:9px !important;
    width:100% !important;
  }
  .header .header-socials {
    grid-column:1 / -1 !important;
    grid-row:1 !important;
    display:grid !important;
    grid-template-columns:1fr 1fr !important;
    gap:9px !important;
    width:100% !important;
  }
  .header .location-link {
    grid-column:1 !important;
    grid-row:2 !important;
  }
  .header .nav-actions > .whatsapp-button {
    grid-column:2 !important;
    grid-row:2 !important;
  }
  .header .header-icon,
  .header .nav-actions > .whatsapp-button {
    width:100% !important;
    min-width:0 !important;
    min-height:48px !important;
    padding:9px 10px !important;
    justify-content:center !important;
    border-radius:12px !important;
    font-size:.9rem !important;
  }
  .header .social-label,
  .header .location-link .social-label {
    font-size:.78rem !important;
    overflow:hidden !important;
    text-overflow:ellipsis !important;
  }
  .header .social-icon-badge {
    width:28px !important;
    height:28px !important;
    flex-basis:28px !important;
  }

  .hero {padding:18px 0 10px !important;}
  .hero-card {
    padding:20px !important;
    border-radius:22px !important;
  }
  .hero-copy {
    display:block !important;
  }
  .hero-copy > .eyebrow,
  .hero-copy > h1,
  .hero-copy > p,
  .hero-copy > .hero-actions {
    display:flex;
    width:auto;
    max-width:none !important;
    margin-left:0 !important;
    margin-right:0 !important;
  }
  .hero-copy > h1 {
    display:block !important;
    margin:14px 0 12px !important;
    font-size:clamp(2rem,9vw,2.8rem) !important;
    line-height:1.08 !important;
  }
  .hero-copy > p {
    display:block !important;
    margin:0 !important;
    font-size:1rem !important;
    line-height:1.65 !important;
  }
  .hero-copy > .hero-actions {margin-top:18px !important;}
  .hero-side {margin-top:24px !important;}
  .hero-collage {
    display:grid !important;
    grid-template-columns:1fr 1fr !important;
    grid-template-rows:auto !important;
    gap:12px !important;
    width:100% !important;
    aspect-ratio:auto !important;
  }
  .interior-photo-main {
    grid-column:1 / -1 !important;
    grid-row:auto !important;
    aspect-ratio:4 / 3 !important;
  }
  .interior-photo-light,
  .interior-photo-detail,
  .interior-photo-ivory,
  .interior-photo-evening {
    grid-column:auto !important;
    grid-row:auto !important;
    aspect-ratio:1 / 1 !important;
  }
  .interior-photo {
    border-width:3px !important;
    border-radius:14px !important;
  }

  .section {padding:34px 0 !important;}
  .section-head {
    display:flex !important;
    flex-direction:column !important;
    align-items:flex-start !important;
    gap:12px !important;
    margin-bottom:18px !important;
  }
  .section-head h2 {
    margin-bottom:8px !important;
    font-size:1.8rem !important;
  }
  .section-head p {font-size:.96rem !important;}
  .section-head .btn-secondary {
    align-self:flex-start !important;
    min-height:42px !important;
    padding:9px 13px !important;
  }
  .filters {
    grid-template-columns:1fr !important;
    padding:8px !important;
    border-radius:14px !important;
  }
  .control {height:46px !important;}
  .results {margin:0 1px 14px !important;}
  .catalog-grid {
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
    gap:12px !important;
  }
  .card {border-radius:15px !important;}
  .card-visual {
    flex:0 0 auto !important;
    width:100% !important;
    height:auto !important;
    min-height:0 !important;
    max-height:none !important;
    aspect-ratio:1 / 1 !important;
    padding:6px !important;
  }
  .card-body {padding:12px 12px 14px !important;}
  .card-title {
    min-height:2.9em !important;
    font-size:.92rem !important;
    line-height:1.45 !important;
  }
  .card-meta {
    margin:8px 0 0 !important;
    font-size:.78rem !important;
  }
  .card-row {margin-top:10px !important;padding-top:10px !important;}
  .price {font-size:1.08rem !important;}
  .load-more-button {
    min-width:0 !important;
    width:100% !important;
    min-height:50px !important;
  }

  #about {padding-top:24px !important;}
  .about-box {grid-template-columns:1fr !important;}
  .info-card,
  .info-card-store {
    padding:20px !important;
    border-radius:18px !important;
  }
  .info-card-store {
    grid-template-columns:1fr !important;
    gap:20px !important;
  }
  .info-card-store > div {max-width:none !important;}
  .info-card.info-card-store h3 {font-size:1.55rem !important;}
  .info-card-store p {font-size:.96rem !important;}
  .store-photo {
    width:100% !important;
    height:280px !important;
    border-radius:15px !important;
  }
  .order-steps {
    grid-template-columns:1fr !important;
    gap:16px !important;
  }

  .contact {padding:8px 0 44px !important;}
  .contact-box {
    grid-template-columns:1fr !important;
    gap:20px !important;
    padding:18px !important;
    border-radius:20px !important;
  }
  .contact-details {padding:0 !important;}
  .phone-link {width:100% !important;}
  .delivery-note {
    grid-template-columns:1fr !important;
    gap:8px !important;
    text-align:center !important;
    margin-top:22px !important;
    padding-top:18px !important;
  }
  .delivery-truck {
    width:170px !important;
    max-width:70vw !important;
  }
  .map-frame,
  .map-frame iframe {min-height:260px !important;}

  .modal {padding:10px !important;}
  .modal-card {
    grid-template-columns:1fr !important;
    width:100% !important;
    max-height:94vh !important;
    border-radius:18px !important;
  }
  .modal-photo {min-height:260px !important;}
  .modal-content {padding:52px 20px 24px !important;}
  .footer-row {justify-content:center !important;text-align:center !important;}
}

@media (max-width: 480px) {
  .container {width:calc(100% - 20px) !important;}
  .header .brand {width:190px !important;}
  .header .menu {font-size:.9rem !important;gap:20px !important;}
  .header .header-icon,
  .header .nav-actions > .whatsapp-button {
    min-height:44px !important;
    padding:8px 8px !important;
  }
  .header .social-label,
  .header .location-link .social-label {font-size:.72rem !important;}
  .header .social-icon-badge {
    width:26px !important;
    height:26px !important;
    flex-basis:26px !important;
  }
  .hero-card {padding:16px !important;}
  .hero-copy > h1 {font-size:2rem !important;}
  .hero-copy > p {font-size:.93rem !important;}
  .catalog-grid {gap:10px !important;}
  .card-body {padding:10px !important;}
  .card-title {font-size:.84rem !important;}
  .section-head h2 {font-size:1.65rem !important;}
}
`;
document.head.appendChild(layoutFixStyle);

const catalogCoreScript = document.createElement("script");
catalogCoreScript.src = "catalog-core.js";
catalogCoreScript.async = false;
document.body.appendChild(catalogCoreScript);
