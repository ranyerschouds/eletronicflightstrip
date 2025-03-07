document.addEventListener("DOMContentLoaded", function () {
    const lists = document.querySelectorAll(".strip-list");

    lists.forEach((list) => {
        new Sortable(list, {
            group: "strips",
            animation: 150,
            ghostClass: "dragging", // Classe visual enquanto arrasta
            forceFallback: true,
            onEnd: function () {
                updateStripColors();
            }
        });
    });

    document.addEventListener("keydown", function (e) {
        if (!selectedStrip) return;
        if (e.key === "Enter") {
            changeStatus(selectedStrip, true);
        } else if (e.key === "Backspace") {
            e.preventDefault();
            changeStatus(selectedStrip, false);
        }
    });
});

let selectedStrip = null;

const statusList = [
    "AGUARDANDO", "SOLICITADO", "AUTORIZADO", "PUSHBACK/ACIONAMENTO",
    "TÁXI", "PONTO DE ESPERA", "DECOLAGEM", "APP", "APROXIMAÇÃO",
    "POUSO AUTORIZADO", "TÁXI", "PÁTIO"
];

function openModal() {
    document.getElementById("form-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("form-modal").style.display = "none";
}

function addStrip() {
    const matricula = document.getElementById("matricula").value.trim();
    const procedencia = document.getElementById("procedencia").value.trim();
    const destino = document.getElementById("destino").value.trim();
    const tipo = document.getElementById("tipo").value.trim();
    const transponder = document.getElementById("transponder").value.trim();
    const velocidade = document.getElementById("velocidade").value.trim();
    const rota = document.getElementById("rota").value.trim();
    const procedimento = document.getElementById("procedimento").value;

    if (!matricula) {
        alert("Matrícula é obrigatória!");
        return;
    }

    const strip = document.createElement("li");
    strip.classList.add("strip");
    strip.dataset.statusIndex = "0";
    strip.innerHTML = `
        <div class="matricula">${matricula}</div>
        <div class="info">📍 ${procedencia} ➝ ${destino}</div>
        <div class="info">✈️ ${tipo} | 🎛️ XPDR: ${transponder}</div>
        <div class="info">⚡ Vel: ${velocidade} | 🛤️ Rota: ${rota}</div>
	<b><div class="status">${statusList[0]}</div></b>
        <button class="delete-btn" onclick="removeStrip(this)">🗑️</button>
    `;

    strip.addEventListener("click", () => selectStrip(strip));
    document.getElementById(procedimento).appendChild(strip);
    closeModal();
    updateStripColors();
}

function removeStrip(btn) {
    if (selectedStrip === btn.parentElement) {
        selectedStrip = null;
    }
    btn.parentElement.remove();
}

function selectStrip(strip) {
    if (selectedStrip) {
        selectedStrip.classList.remove("selected");
    }
    selectedStrip = strip;
    strip.classList.add("selected");
}

function changeStatus(strip, forward = true) {
    let index = parseInt(strip.dataset.statusIndex) || 0;

    if (forward) {
        index = (index + 1) % statusList.length;
    } else {
        index = (index - 1 + statusList.length) % statusList.length;
    }

    strip.dataset.statusIndex = index;
    strip.querySelector(".status").textContent = `${statusList[index]}`;

    // Regras de movimentação automática
    if (statusList[index] === "PONTO DE ESPERA" || statusList[index] === "DECOLAGEM") {
        document.getElementById("partidas-list").appendChild(strip);
    } else if (statusList[index] === "PÁTIO") {
        document.getElementById("solo-list").appendChild(strip);
    } else if (statusList[index] === "APROXIMAÇÃO") {
        document.getElementById("chegadas-list").appendChild(strip);
	}

    updateStripColors(); // Atualiza as cores após a mudança
}

// Atualizar cores das strips ao mover
function updateStripColors() {
    document.querySelectorAll(".strip").forEach(strip => {
        let parentId = strip.parentElement.id;
        let matriculaDiv = strip.querySelector(".matricula");

        if (parentId === "solo-list") {
            matriculaDiv.style.backgroundColor = "yellow";
        } else if (parentId === "partidas-list") {
            matriculaDiv.style.backgroundColor = "lightblue";
            matriculaDiv.style.color = "black";
        } else {
            matriculaDiv.style.backgroundColor = "burlywood";
        }
    });
}
