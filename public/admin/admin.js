const API_ROOT = "https://eliza-catalog-data.bubbly-moose-3025.chatgpt.site";

const state = { products: [], editingId: null, existingImages: [], newImages: [], busy: false };
const $ = id => document.getElementById(id);
const fields = {
  name: $("productName"), price: $("productPrice"), size: $("productSize"),
  material: $("productMaterial"), color: $("productColor"), style: $("productStyle"),
  room: $("productRoom"), description: $("productDescription")
};
let imageSequence = 0;
let toastTimer;

function text(value) { return value === null || value === undefined ? "" : String(value).trim(); }
function escapeHtml(value) { return text(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function assetUrl(path) {
  const value = text(path);
  if (/^(data:|blob:|https?:)/i.test(value)) return value;
  return "../" + value.replace(/^(\.\/|\/)+/, "");
}
function photoMarkup(photo, alt) {
  const src = escapeHtml(assetUrl(photo.thumbnail || photo.src));
  const crop = photo.crop;
  if (crop && [crop.x,crop.y,crop.width,crop.height,crop.sourceWidth,crop.sourceHeight].every(Number.isFinite)) {
    const id = `admin-crop-${++imageSequence}`;
    return `<svg role="img" aria-label="${escapeHtml(alt)}" viewBox="0 0 ${crop.width} ${crop.height}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${id}"><rect width="${crop.width}" height="${crop.height}"/></clipPath></defs><g clip-path="url(#${id})"><image href="${src}" x="${-crop.x}" y="${-crop.y}" width="${crop.sourceWidth}" height="${crop.sourceHeight}"/></g></svg>`;
  }
  return `<img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
}
function priceLabel(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? new Intl.NumberFormat("az-AZ", {maximumFractionDigits:2}).format(number) + " ₼" : "";
}
function showToast(message) {
  clearTimeout(toastTimer); const toast = $("toast"); toast.textContent = message; toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
}
function openModal(id) { $(id).hidden = false; document.body.style.overflow = "hidden"; }
function closeModal(id) { $(id).hidden = true; document.body.style.overflow = ""; }

function renderProducts() {
  const query = $("searchInput").value.toLocaleLowerCase("az").trim();
  const list = state.products.filter(p => `${p.name} ${p.id}`.toLocaleLowerCase("az").includes(query));
  $("resultCount").textContent = query ? `${list.length} nəticə · ümumilikdə ${state.products.length} xalça` : `${state.products.length} xalça`;
  const grid = $("productGrid"); grid.innerHTML = "";
  if (!list.length) { const empty = document.createElement("div"); empty.className = "empty"; empty.textContent = query ? "Axtarışa uyğun xalça tapılmadı." : "Kataloqda xalça yoxdur."; grid.appendChild(empty); return; }
  for (const product of list) {
    const card = document.createElement("article"); card.className = "product-card";
    const photo = document.createElement("div"); photo.className = "card-photo";
    photo.innerHTML = product.images?.[0] ? photoMarkup(product.images[0], product.name) : '<span>Şəkil yoxdur</span>';
    const body = document.createElement("div"); body.className = "card-body";
    const code = document.createElement("p"); code.className = "card-code"; code.textContent = product.id;
    const title = document.createElement("h3"); title.className = "card-title"; title.textContent = product.name;
    const meta = document.createElement("p"); meta.className = "card-meta"; meta.textContent = [product.size,product.color].map(text).filter(Boolean).join(" · ") || "Məlumat daxil edilməyib";
    const price = document.createElement("p"); price.className = "card-price"; price.textContent = priceLabel(product.price) || "Qiymət göstərilməyib";
    const actions = document.createElement("div"); actions.className = "card-actions";
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "card-edit"; edit.textContent = "Redaktə et"; edit.addEventListener("click", () => editProduct(product.id));
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "card-delete"; remove.textContent = "×"; remove.setAttribute("aria-label", `${product.name} kartını sil`); remove.addEventListener("click", () => deleteProduct(product.id));
    actions.append(edit,remove); body.append(code,title,meta,price,actions); card.append(photo,body); grid.appendChild(card);
  }
}

async function loadCatalog() {
  try {
    const response = await fetch(`${API_ROOT}/api/catalog?admin=${Date.now()}`, {cache:"no-store"});
    if (!response.ok) throw new Error("Kataloq yüklənmədi");
    const data = await response.json(); if (!Array.isArray(data.products)) throw new Error("Kataloq formatı yanlışdır");
    state.products = data.products; renderProducts();
  } catch (error) { $("resultCount").textContent = "Kataloq yüklənmədi"; $("productGrid").innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; }
}

function resetForm() {
  $("productForm").reset(); state.newImages.forEach(photo => URL.revokeObjectURL(photo.preview)); state.existingImages = []; state.newImages = []; $("specList").innerHTML = ""; $("editorError").textContent = ""; renderPhotos();
}
function nextProductId() {
  const max = state.products.reduce((value,p) => Math.max(value, Number((/^EL-(\d+)$/.exec(p.id)||[])[1])||0), 0);
  return `EL-${String(max+1).padStart(3,"0")}`;
}
function addProduct() {
  resetForm(); state.editingId = null; $("editorTitle").textContent = "Yeni xalça"; openModal("editorModal"); setTimeout(() => fields.name.focus(),0);
}
function editProduct(id) {
  const product = state.products.find(p => p.id === id); if (!product) return;
  resetForm(); state.editingId = id; $("editorTitle").textContent = product.name;
  for (const key of Object.keys(fields)) fields[key].value = text(product[key]);
  state.existingImages = JSON.parse(JSON.stringify(product.images || []));
  for (const [key,value] of Object.entries(product.specifications || {})) addSpecRow(key,value);
  renderPhotos(); openModal("editorModal");
}
function addSpecRow(key = "", value = "") {
  const row = document.createElement("div"); row.className = "spec-row";
  const name = document.createElement("input"); name.placeholder = "Xüsusiyyət"; name.value = text(key); name.maxLength = 70; name.setAttribute("aria-label","Xüsusiyyətin adı");
  const val = document.createElement("input"); val.placeholder = "Dəyər"; val.value = text(value); val.maxLength = 160; val.setAttribute("aria-label","Xüsusiyyətin dəyəri");
  const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label","Xüsusiyyəti sil"); remove.addEventListener("click", () => row.remove());
  row.append(name,val,remove); $("specList").appendChild(row);
}
function renderPhotos() {
  const list = $("photoList"); list.innerHTML = "";
  state.existingImages.forEach((photo,index) => {
    const item = document.createElement("div"); item.className = "photo-item"; item.innerHTML = photoMarkup(photo,"");
    const button = document.createElement("button"); button.type="button"; button.textContent="×"; button.setAttribute("aria-label","Şəkli sil"); button.addEventListener("click",()=>{state.existingImages.splice(index,1);renderPhotos();}); item.appendChild(button); list.appendChild(item);
  });
  state.newImages.forEach((photo,index) => {
    const item = document.createElement("div"); item.className = "photo-item"; const image = document.createElement("img"); image.src=photo.preview; image.alt="Yeni şəkil"; item.appendChild(image);
    const button = document.createElement("button"); button.type="button"; button.textContent="×"; button.setAttribute("aria-label","Şəkli sil"); button.addEventListener("click",()=>{URL.revokeObjectURL(photo.preview);state.newImages.splice(index,1);renderPhotos();}); item.appendChild(button); list.appendChild(item);
  });
}
function canvasBlob(canvas, quality) { return new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Şəkil hazırlana bilmədi")),"image/webp",quality)); }
async function resizeImage(file, maxWidth, maxHeight, quality) {
  const image = await createImageBitmap(file, {imageOrientation:"from-image"}); const ratio = Math.min(1,maxWidth/image.width,maxHeight/image.height);
  const width=Math.max(1,Math.round(image.width*ratio)),height=Math.max(1,Math.round(image.height*ratio)); const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext("2d",{alpha:false});ctx.fillStyle="#f5f1ed";ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0,width,height);image.close();
  return {blob:await canvasBlob(canvas,quality),width,height};
}
async function addPhotos(files) {
  const input = $("photoInput"); const error=$("editorError"); error.textContent="";
  if (state.existingImages.length + state.newImages.length + files.length > 10) { error.textContent="Bir kartda ən çox 10 şəkil ola bilər."; input.value=""; return; }
  input.disabled=true;
  try {
    for (const file of files) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: fayl formatı dəstəklənmir.`);
      const [full,thumb]=await Promise.all([resizeImage(file,1400,1600,.87),resizeImage(file,600,900,.82)]);
      state.newImages.push({full,thumb,preview:URL.createObjectURL(full.blob)}); renderPhotos();
    }
  } catch(err) { error.textContent=err.message; } finally { input.disabled=false; input.value=""; }
}
async function api(path, options = {}) {
  const response = await fetch(API_ROOT + path, options);
  let data = null; try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data?.error || `Server xətası (${response.status})`);
  return data;
}
async function uploadImage(blob) {
  const data = await api("/api/upload", {method:"POST",headers:{"Content-Type":"image/webp"},body:blob});
  if (!data?.url) throw new Error("Şəkil ünvanı alınmadı.");
  return data.url;
}
async function saveCatalog(products) {
  await api("/api/catalog", {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({schemaVersion:1,products})});
}
function collectSpecifications() {
  const result={}; for(const row of $("specList").children){const inputs=row.querySelectorAll("input");const key=text(inputs[0].value),value=text(inputs[1].value);if(key&&value)result[key]=value;} return result;
}
async function saveProduct(event) {
  event.preventDefault(); if (state.busy) return;
  const error=$("editorError"),button=$("saveProductButton");error.textContent="";const name=text(fields.name.value);
  if(!name){error.textContent="Xalçanın adını daxil edin.";fields.name.focus();return;}
  if(!state.existingImages.length&&!state.newImages.length){error.textContent="Ən azı bir şəkil yükləyin.";return;}
  state.busy=true;button.disabled=true;button.textContent="Yadda saxlanılır…";
  try {
    const uploaded=[];
    for(let i=0;i<state.newImages.length;i++){
      const item=state.newImages[i];
      const [src,thumbnail]=await Promise.all([uploadImage(item.full.blob),uploadImage(item.thumb.blob)]);
      uploaded.push({src,thumbnail,width:item.full.width,height:item.full.height});
    }
    const priceText=text(fields.price.value);const product={
      id:state.editingId||nextProductId(),name,images:[...state.existingImages,...uploaded],description:text(fields.description.value),price:priceText===""?null:Number(priceText),
      room:text(fields.room.value),style:text(fields.style.value),size:text(fields.size.value),material:text(fields.material.value),color:text(fields.color.value),specifications:collectSpecifications()
    };
    const next=state.editingId?state.products.map(p=>p.id===state.editingId?product:p):[product,...state.products];
    await saveCatalog(next);
    state.products=next;closeModal("editorModal");renderProducts();showToast("Dəyişiklik saxlanıldı və saytda görünür.");
  }catch(err){error.textContent=err.message;}
  finally{state.busy=false;button.disabled=false;button.textContent="Yadda saxla";}
}
async function deleteProduct(id) {
  if(state.busy)return;const product=state.products.find(p=>p.id===id);if(!product)return;
  if(!confirm(`“${product.name}” kartı kataloqdan silinsin?`))return;state.busy=true;
  try{const next=state.products.filter(p=>p.id!==id);await saveCatalog(next);state.products=next;renderProducts();showToast("Kart kataloqdan silindi.");}
  catch(err){showToast("Silmək alınmadı: "+err.message);}finally{state.busy=false;}
}

$("searchInput").addEventListener("input",renderProducts);
$("addProductButton").addEventListener("click",addProduct);
$("addSpecButton").addEventListener("click",()=>addSpecRow());
$("photoInput").addEventListener("change",event=>addPhotos([...event.target.files]));
$("productForm").addEventListener("submit",saveProduct);
document.querySelectorAll('[data-close="editor"]').forEach(button=>button.addEventListener("click",()=>{if(!state.busy)closeModal("editorModal");}));
document.addEventListener("keydown",event=>{if(event.key!=="Escape"||state.busy)return;if(!$("editorModal").hidden)closeModal("editorModal");});
loadCatalog();
