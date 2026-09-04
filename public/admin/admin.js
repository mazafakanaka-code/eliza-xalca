const REPOSITORY = "mazafakanaka-code/eliza-xalca";
const BRANCH = "main";
const API_ROOT = "https://api.github.com";

const state = { products: [], token: "", editingId: null, existingImages: [], newImages: [], busy: false };
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
function setConnection(connected) {
  $("connectionStatus").classList.toggle("connected", connected);
  $("connectionStatus").querySelector("span").textContent = connected ? "Redaktə açıqdır" : "Redaktə bağlıdır";
  $("connectButton").textContent = connected ? "Çıxış" : "Giriş açarı";
  $("lockedNotice").hidden = connected;
}
function openModal(id) { $(id).hidden = false; document.body.style.overflow = "hidden"; }
function closeModal(id) { $(id).hidden = true; document.body.style.overflow = ""; }
function requireConnection() { if (state.token) return true; openModal("accessModal"); setTimeout(() => $("tokenInput").focus(), 0); return false; }

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
    const response = await fetch(`../products.json?admin=${Date.now()}`, {cache:"no-store"});
    if (!response.ok) throw new Error("Kataloq yüklənmədi");
    const data = await response.json(); if (!Array.isArray(data.products)) throw new Error("Kataloq formatı yanlışdır");
    state.products = data.products; renderProducts();
  } catch (error) { $("resultCount").textContent = "Kataloq yüklənmədi"; $("productGrid").innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; }
}

async function github(path, options = {}) {
  if (!state.token) throw new Error("Giriş açarı daxil edilməyib");
  const response = await fetch(API_ROOT + path, {
    ...options,
    headers: {"Accept":"application/vnd.github+json","Authorization":`Bearer ${state.token}`,"X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...(options.headers||{})}
  });
  let data = null; try { data = await response.json(); } catch (_) {}
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub xətası (${response.status})`); error.status = response.status; throw error;
  }
  return data;
}
async function connect() {
  const token = $("tokenInput").value.trim(); const button = $("tokenSubmit"); const error = $("accessError");
  error.textContent = ""; if (!token) { error.textContent = "Giriş açarını daxil edin."; return; }
  state.token = token; button.disabled = true; button.textContent = "Yoxlanılır…";
  try {
    const repo = await github(`/repos/${REPOSITORY}`);
    if (!repo.permissions?.push) throw new Error("Bu hesabın kataloqu dəyişmək icazəsi yoxdur.");
    $("tokenInput").value = ""; setConnection(true); closeModal("accessModal"); showToast("Redaktə girişi açıldı.");
  } catch (err) { state.token = ""; error.textContent = err.status === 401 ? "Giriş açarı yanlışdır və ya müddəti bitib." : err.message; }
  finally { button.disabled = false; button.textContent = "Qoşul"; }
}
function disconnect() { state.token = ""; setConnection(false); showToast("Redaktə girişi bağlandı."); }

function resetForm() {
  $("productForm").reset(); state.newImages.forEach(photo => URL.revokeObjectURL(photo.preview)); state.existingImages = []; state.newImages = []; $("specList").innerHTML = ""; $("editorError").textContent = ""; renderPhotos();
}
function nextProductId() {
  const max = state.products.reduce((value,p) => Math.max(value, Number((/^EL-(\d+)$/.exec(p.id)||[])[1])||0), 0);
  return `EL-${String(max+1).padStart(3,"0")}`;
}
function addProduct() {
  if (!requireConnection()) return; resetForm(); state.editingId = null; $("editorTitle").textContent = "Yeni xalça"; openModal("editorModal"); setTimeout(() => fields.name.focus(),0);
}
function editProduct(id) {
  if (!requireConnection()) return; const product = state.products.find(p => p.id === id); if (!product) return;
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
function blobBase64(blob) { return blob.arrayBuffer().then(buffer => { const bytes=new Uint8Array(buffer);let binary="";for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary); }); }
function bytesBase64(value) { const bytes=new TextEncoder().encode(value);let binary="";for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary); }
async function commitCatalog(products, imageFiles, message) {
  const ref=await github(`/repos/${REPOSITORY}/git/ref/heads/${BRANCH}`); const parent=ref.object.sha;
  const commit=await github(`/repos/${REPOSITORY}/git/commits/${parent}`); const tree=[];
  for (const file of imageFiles) {
    const blob=await github(`/repos/${REPOSITORY}/git/blobs`,{method:"POST",body:JSON.stringify({content:await blobBase64(file.blob),encoding:"base64"})});
    tree.push({path:file.path,mode:"100644",type:"blob",sha:blob.sha});
  }
  const catalog=JSON.stringify({schemaVersion:1,products},null,2)+"\n";
  const catalogBlob=await github(`/repos/${REPOSITORY}/git/blobs`,{method:"POST",body:JSON.stringify({content:bytesBase64(catalog),encoding:"base64"})});
  tree.push({path:"public/products.json",mode:"100644",type:"blob",sha:catalogBlob.sha});
  const newTree=await github(`/repos/${REPOSITORY}/git/trees`,{method:"POST",body:JSON.stringify({base_tree:commit.tree.sha,tree})});
  const newCommit=await github(`/repos/${REPOSITORY}/git/commits`,{method:"POST",body:JSON.stringify({message,tree:newTree.sha,parents:[parent]})});
  await github(`/repos/${REPOSITORY}/git/refs/heads/${BRANCH}`,{method:"PATCH",body:JSON.stringify({sha:newCommit.sha,force:false})});
}
function collectSpecifications() {
  const result={}; for(const row of $("specList").children){const inputs=row.querySelectorAll("input");const key=text(inputs[0].value),value=text(inputs[1].value);if(key&&value)result[key]=value;} return result;
}
async function saveProduct(event) {
  event.preventDefault(); if (!requireConnection() || state.busy) return;
  const error=$("editorError"),button=$("saveProductButton");error.textContent="";const name=text(fields.name.value);
  if(!name){error.textContent="Xalçanın adını daxil edin.";fields.name.focus();return;}
  if(!state.existingImages.length&&!state.newImages.length){error.textContent="Ən azı bir şəkil yükləyin.";return;}
  state.busy=true;button.disabled=true;button.textContent="Yadda saxlanılır…";
  try {
    const stamp=Date.now();const imageFiles=[];const uploaded=[];
    for(let i=0;i<state.newImages.length;i++){
      const item=state.newImages[i],base=`assets/catalog/admin-${stamp}-${i+1}`;
      imageFiles.push({path:`public/${base}.webp`,blob:item.full.blob},{path:`public/${base}-small.webp`,blob:item.thumb.blob});
      uploaded.push({src:`${base}.webp`,thumbnail:`${base}-small.webp`,width:item.full.width,height:item.full.height});
    }
    const priceText=text(fields.price.value);const product={
      id:state.editingId||nextProductId(),name,images:[...state.existingImages,...uploaded],description:text(fields.description.value),price:priceText===""?null:Number(priceText),
      room:text(fields.room.value),style:text(fields.style.value),size:text(fields.size.value),material:text(fields.material.value),color:text(fields.color.value),specifications:collectSpecifications()
    };
    const next=state.editingId?state.products.map(p=>p.id===state.editingId?product:p):[product,...state.products];
    await commitCatalog(next,imageFiles,state.editingId?`Update ${product.id} in carpet catalog`:`Add ${product.id} to carpet catalog`);
    state.products=next;closeModal("editorModal");renderProducts();showToast("Dəyişiklik saxlanıldı. Saytda bir neçə dəqiqəyə görünəcək.");
  }catch(err){error.textContent=err.status===422?"Kataloq bu vaxt dəyişib. Səhifəni yeniləyib təkrar cəhd edin.":err.message;}
  finally{state.busy=false;button.disabled=false;button.textContent="Yadda saxla";}
}
async function deleteProduct(id) {
  if(!requireConnection()||state.busy)return;const product=state.products.find(p=>p.id===id);if(!product)return;
  if(!confirm(`“${product.name}” kartı kataloqdan silinsin?`))return;state.busy=true;
  try{const next=state.products.filter(p=>p.id!==id);await commitCatalog(next,[],`Remove ${id} from carpet catalog`);state.products=next;renderProducts();showToast("Kart kataloqdan silindi.");}
  catch(err){showToast("Silmək alınmadı: "+err.message);}finally{state.busy=false;}
}

$("searchInput").addEventListener("input",renderProducts);
$("addProductButton").addEventListener("click",addProduct);
$("addSpecButton").addEventListener("click",()=>addSpecRow());
$("photoInput").addEventListener("change",event=>addPhotos([...event.target.files]));
$("productForm").addEventListener("submit",saveProduct);
$("tokenSubmit").addEventListener("click",connect);
$("tokenInput").addEventListener("keydown",event=>{if(event.key==="Enter")connect();});
$("connectButton").addEventListener("click",()=>state.token?disconnect():openModal("accessModal"));
$("noticeConnect").addEventListener("click",()=>openModal("accessModal"));
document.querySelectorAll('[data-close="access"]').forEach(button=>button.addEventListener("click",()=>closeModal("accessModal")));
document.querySelectorAll('[data-close="editor"]').forEach(button=>button.addEventListener("click",()=>{if(!state.busy)closeModal("editorModal");}));
document.addEventListener("keydown",event=>{if(event.key!=="Escape"||state.busy)return;if(!$("editorModal").hidden)closeModal("editorModal");else if(!$("accessModal").hidden)closeModal("accessModal");});
setConnection(false);loadCatalog();
