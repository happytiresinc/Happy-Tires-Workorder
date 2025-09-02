let workOrderCounter = 1;
let servicesList = document.getElementById("servicesList");
let signaturePad = document.getElementById("signaturePad");
let ctx = signaturePad.getContext("2d");
let drawing = false;

function generateWorkOrderNumber() {
  document.getElementById("workOrderNumber").innerText =
    String(workOrderCounter).padStart(3, '0');
}

function addService() {
  let div = document.createElement("div");
  div.className = "service-item";
  div.innerHTML = `
    <label>Description: <input type="text" class="desc"></label>
    <label>Labor ($): <input type="number" class="labor"></label>
    <label>Parts ($): <input type="number" class="parts"></label>
    <button onclick="removeService(this)">Remove</button>
  `;
  servicesList.appendChild(div);
}

function removeService(btn) {
  btn.parentElement.remove();
}

function clearSignature() {
  ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
}

signaturePad.addEventListener("mousedown", e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
signaturePad.addEventListener("mousemove", e => {
  if (drawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});
signaturePad.addEventListener("mouseup", () => drawing = false);
signaturePad.addEventListener("mouseleave", () => drawing = false);

function saveWorkOrder() {
  let customerName = document.getElementById("customerName").value;
  let vehicle = document.getElementById("vehicle").value;
  let date = new Date().toLocaleString();
  let number = String(workOrderCounter).padStart(3, '0');

  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.push({ number, date, customerName, vehicle });
  localStorage.setItem("history", JSON.stringify(history));

  alert("Work Order Saved!");
  workOrderCounter++;
  generateWorkOrderNumber();
}

function printWorkOrder() {
  window.print();
}

function emailWorkOrder() {
  let email = document.getElementById("customerEmail").value || "Happytiresinc@gmail.com";
  window.location.href = `mailto:${email}?subject=Work Order&body=Attached is your work order.`;
}

function toggleHistory() {
  let list = document.getElementById("historyList");
  if (list.style.display === "none") {
    list.style.display = "block";
    let history = JSON.parse(localStorage.getItem("history")) || [];
    list.innerHTML = history.map(h => `<p>#${h.number} - ${h.date} - ${h.customerName} - ${h.vehicle}</p>`).join("");
  } else {
    list.style.display = "none";
  }
}

window.onload = generateWorkOrderNumber;
