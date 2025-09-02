/* Happy Tires Work Order - iPad-ready
 * - Responsive layout (portrait/landscape)
 * - Checkbox approval + signature pad (touch-friendly)
 * - Reset work order (keeps history)
 * - History persisted in localStorage
 * - Print / Email / Export to PDF (jsPDF)
 */

const $ = (sel) => document.querySelector(sel);
const servicesList = $("#servicesList");
const subtotalEl = $("#subtotal");
const taxEl = $("#tax");
const grandTotalEl = $("#grandTotal");

/* --- Work Order Number (persistent across sessions) --- */
function nextWorkOrderNumber(){
  let n = parseInt(localStorage.getItem("workOrderCounter") || "0", 10);
  n = isNaN(n) ? 0 : n;
  n += 1;
  localStorage.setItem("workOrderCounter", String(n));
  return String(n).padStart(3,'0');
}
function setCurrentWO(num){ $("#workOrderNumber").textContent = num; }

/* --- Date --- */
$("#currentDate").textContent = new Date().toLocaleDateString();

/* --- Services --- */
function addService({desc="", hours="", rate="", parts=""}={}){
  const row = document.createElement("div");
  row.className = "service-item";
  row.innerHTML = `
    <input class="desc col-span" type="text" placeholder="Description" value="${desc}">
    <input class="hours" type="number" inputmode="decimal" placeholder="Hours" step="0.1" value="${hours}">
    <input class="rate" type="number" inputmode="decimal" placeholder="Rate" step="0.01" value="${rate}">
    <input class="parts" type="number" inputmode="decimal" placeholder="Parts $" step="0.01" value="${parts}">
    <button class="btn sm" type="button">Remove</button>
  `;
  row.querySelector("button").addEventListener("click", () => { row.remove(); calcTotals(); });
  row.querySelectorAll("input").forEach(inp => inp.addEventListener("input", calcTotals));
  servicesList.appendChild(row);
  calcTotals();
}
function getServices(){
  return [...servicesList.querySelectorAll('.service-item')].map(row => ({
    desc: row.querySelector('.desc').value.trim(),
    hours: parseFloat(row.querySelector('.hours').value) || 0,
    rate: parseFloat(row.querySelector('.rate').value) || 0,
    parts: parseFloat(row.querySelector('.parts').value) || 0
  })).filter(s => s.desc || s.hours || s.rate || s.parts);
}
function calcTotals(){
  let subtotal = 0;
  for(const s of getServices()){
    subtotal += (s.hours * s.rate) + s.parts;
  }
  const tax = subtotal * 0.13;
  const grand = subtotal + tax;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  grandTotalEl.textContent = `$${grand.toFixed(2)}`;
}

/* --- Signature Pad (touch-smooth) --- */
const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
let drawing = false;
let last = null;

function resizeCanvas(){
  // Maintain crisp drawing on retina displays
  const ratio = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth;
  const displayHeight = 180;
  canvas.width = displayWidth * ratio;
  canvas.height = displayHeight * ratio;
  canvas.style.height = displayHeight + 'px';
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000';
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, {passive:true});

function posFromEvent(e){
  if(e.touches && e.touches.length){
    const rect = canvas.getBoundingClientRect();
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  } else {
    return { x: e.offsetX, y: e.offsetY };
  }
}
function startDraw(e){ drawing = true; last = posFromEvent(e); e.preventDefault(); }
function endDraw(){ drawing = false; last = null; }
function moveDraw(e){
  if(!drawing) return;
  const p = posFromEvent(e);
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  last = p;
  e.preventDefault();
}
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', moveDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', startDraw, {passive:false});
canvas.addEventListener('touchmove', moveDraw, {passive:false});
canvas.addEventListener('touchend', endDraw);

document.getElementById('sigClearBtn').addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
});

/* --- Save / History --- */
function saveWorkOrder(){
  const wo = {
    number: $('#workOrderNumber').textContent,
    date: $('#currentDate').textContent,
    name: $('#customerName').value.trim(),
    phone: $('#customerPhone').value.trim(),
    email: $('#customerEmail').value.trim(),
    vehicle: $('#vehicle').value.trim(),
    vin: $('#vin').value.trim(),
    plate: $('#plate').value.trim(),
    odometer: $('#odometer').value.trim(),
    approved: $('#approveCheckbox').checked,
    services: getServices(),
    subtotal: subtotalEl.textContent,
    tax: taxEl.textContent,
    total: grandTotalEl.textContent,
    signatureDataUrl: canvas.toDataURL('image/png')
  };
  const history = JSON.parse(localStorage.getItem('workOrders') || '[]');
  history.push(wo);
  localStorage.setItem('workOrders', JSON.stringify(history));
  renderHistory();
  alert('Work order saved.');
}
function renderHistory(){
  const history = JSON.parse(localStorage.getItem('workOrders') || '[]').reverse();
  const list = $('#historyList');
  list.innerHTML = history.map(h => `
    <div class="history-item">
      <span class="tag">#${h.number}</span>
      <span>${h.date}</span>
      <span class="tag">${h.name || 'Customer'}</span>
      <span>${h.vehicle || ''}</span>
      <span>${h.phone ? '☎ ' + h.phone : ''}</span>
    </div>
  `).join('');
}
renderHistory();

/* --- Print / Email / Reset --- */
function printWO(){ window.print(); }
function emailWO(){
  const subject = `Work Order #${$('#workOrderNumber').textContent} - Happy Tires Automotive Centre`;
  const body = [
    `Customer: ${$('#customerName').value}`,
    `Phone: ${$('#customerPhone').value}`,
    `Vehicle: ${$('#vehicle').value}`,
    `VIN: ${$('#vin').value}`,
    `Plate: ${$('#plate').value}`,
    `Total: ${grandTotalEl.textContent}`,
    `Date: ${$('#currentDate').textContent}`
  ].join('\n');
  window.location.href = `mailto:Happytiresinc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function resetForm(){
  ['customerName','customerPhone','customerEmail','vehicle','vin','plate','odometer'].forEach(id => { $("#"+id).value=''; });
  $('#approveCheckbox').checked = false;
  servicesList.innerHTML = '';
  addService(); // keep one empty row
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // Increment WO number for new customer
  setCurrentWO(nextWorkOrderNumber());
  calcTotals();
}

/* --- PDF Export (branded header) --- */
async function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' }); // 612x792

  const left = 40, line = 18;
  let y = 50;

  // Header
  doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text('Happy Tires Automotive Centre', left, y); y += line;
  doc.setFont('helvetica','normal'); doc.setFontSize(11);
  doc.text('321 Grays Road, Hamilton Ontario L8E2Z1', left, y); y += line;
  doc.text('Phone: 905-741-3377   Email: Happytiresinc@gmail.com', left, y); y += line * 1.5;

  // Meta
  doc.setFont('helvetica','bold'); doc.text(`Work Order # ${$('#workOrderNumber').textContent}`, left, y);
  doc.setFont('helvetica','normal'); doc.text(`Date: ${$('#currentDate').textContent}`, 400, y); y += line * 1.5;

  // Customer
  doc.setFont('helvetica','bold'); doc.text('Customer Information', left, y); y += line;
  doc.setFont('helvetica','normal');
  doc.text(`Name: ${$('#customerName').value}`, left, y); y += line;
  doc.text(`Phone: ${$('#customerPhone').value}`, left, y); y += line;
  doc.text(`Email: ${$('#customerEmail').value}`, left, y); y += line;
  doc.text(`Vehicle: ${$('#vehicle').value}`, left, y); y += line;
  doc.text(`VIN: ${$('#vin').value}`, left, y); y += line;
  doc.text(`Plate: ${$('#plate').value}`, left, y); y += line * 1.2;

  // Services
  doc.setFont('helvetica','bold'); doc.text('Services', left, y); y += line;
  doc.setFont('helvetica','normal');
  const services = getServices();
  if(services.length === 0){
    doc.text('- No services listed -', left, y); y += line;
  } else {
    services.forEach(s => {
      const total = (s.hours * s.rate + s.parts);
      const row = `• ${s.desc}  |  Hrs: ${s.hours}  Rate: $${s.rate.toFixed(2)}  Parts: $${s.parts.toFixed(2)}  Line Total: $${total.toFixed(2)}`;
      const lines = doc.splitTextToSize(row, 520);
      lines.forEach((ln) => { doc.text(ln, left, y); y += line; });
      y += 2;
    });
  }
  y += 6;
  doc.setFont('helvetica','bold');
  doc.text(`Subtotal: ${subtotalEl.textContent}`, left, y); y += line;
  doc.text(`HST (13%): ${taxEl.textContent}`, left, y); y += line;
  doc.text(`Grand Total: ${grandTotalEl.textContent}`, left, y); y += line * 1.2;

  // Approval
  doc.setFont('helvetica','bold'); doc.text('Approval', left, y); y += line;
  doc.setFont('helvetica','normal');
  const approved = $('#approveCheckbox').checked ? '☑ Approved' : '☐ Not Approved';
  const ack = 'By checking the box and/or signing, the customer acknowledges and approves the listed repairs and authorizes Happy Tires Automotive Centre to proceed.';
  doc.text(approved, left, y); y += line;
  doc.text(doc.splitTextToSize(ack, 520), left, y); y += line * 2;

  // Signature (if any)
  const sigData = canvas.toDataURL('image/png');
  // Simple check: if canvas is blank (all white), skip; otherwise embed
  // (We won't do pixel-by-pixel check here to keep fast; user can clear if unwanted)
  doc.text('Signature:', left, y); y += 6;
  try{
    doc.addImage(sigData, 'PNG', left, y, 300, 90);
    y += 100;
  }catch(e){
    // ignore if empty or error
  }

  // Disclaimer
  const disclaimer =
    'This estimate is based on preliminary inspection and reported concerns. Pricing may vary due to diagnostic results, required parts, or additional labour. Parts removed during repairs may be disposed of unless requested otherwise. Happy Tires Automotive Centre is not responsible for loss or damage to vehicles or articles left in vehicles in the event of fire, theft, accident, or other causes beyond our control. Warranties on parts and/or labour apply only as stated on the final invoice and may be subject to manufacturer terms. By approving this work order, you authorize us to proceed and to operate the vehicle for testing, diagnosis and quality control.';
  doc.setFont('helvetica','bold'); doc.text('Estimate & Repair Terms', left, y); y += line;
  doc.setFont('helvetica','normal'); doc.text(doc.splitTextToSize(disclaimer, 520), left, y);

  doc.save(`HappyTires_WorkOrder_${$('#workOrderNumber').textContent}.pdf`);
}

/* --- UI wiring --- */
document.getElementById('addServiceBtn').addEventListener('click', () => addService());
document.getElementById('saveBtn').addEventListener('click', saveWorkOrder);
document.getElementById('printBtn').addEventListener('click', printWO);
document.getElementById('emailBtn').addEventListener('click', emailWO);
document.getElementById('pdfBtn').addEventListener('click', exportPDF);
document.getElementById('resetFormBtn').addEventListener('click', resetForm);
document.getElementById('toggleHistoryBtn').addEventListener('click', () => {
  const h = document.getElementById('history');
  h.hidden = !h.hidden;
});

// init
setCurrentWO(nextWorkOrderNumber());
addService();
calcTotals();
