// Simulador de Cuotas

const form = document.getElementById("simulador-form");
const resultadoDiv = document.getElementById("resultado");
const detalleP = document.getElementById("detalle");
const mostrarEstadisticasBtn = document.getElementById("mostrar-estadisticas");
const estadisticasDiv = document.getElementById("estadisticas");
const graficoCanvas = document.getElementById("grafico");

// Botones para guardar y limpiar datos
const guardarBtn = document.createElement("button");
guardarBtn.textContent = "Guardar Datos";
guardarBtn.id = "guardar-datos";
resultadoDiv.appendChild(guardarBtn);

const limpiarBtn = document.createElement("button");
limpiarBtn.textContent = "Limpiar Datos";
limpiarBtn.id = "limpiar-datos";
resultadoDiv.appendChild(limpiarBtn);

// Array para guardar datos de usuarios
let usuarios = [];
let chart = null;

// Tasas de interés cargadas desde JSON local
let tasasInteres = [];

// Cargar tasas de interés desde un archivo JSON
async function cargarTasas() {
    try {
        const response = await fetch("tasas.json");
        tasasInteres = await response.json();
    } catch (error) {
        console.error("Error al cargar las tasas de interés:", error);
    }
}

// Función para calcular cuota y guardar datos
function calcularCuota(monto, cuotas) {
    const tasa = tasasInteres.find((t) => t.cuotas === cuotas)?.interes || 1;
    const total = monto * tasa;
    const cuota = total / cuotas;

    return { total, cuota };
}

// Actualizar gráfico
function actualizarGrafico() {
    const dataCuotas = [
        usuarios.filter((u) => u.cuotas === 3).length,
        usuarios.filter((u) => u.cuotas === 6).length,
        usuarios.filter((u) => u.cuotas === 12).length,
    ];

    if (chart) {
        chart.data.datasets[0].data = dataCuotas;
        chart.update();
    } else {
        const ctx = graficoCanvas.getContext("2d");
        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["3 Cuotas", "6 Cuotas", "12 Cuotas"],
                datasets: [
                    {
                        label: "Cantidad de usuarios",
                        data: dataCuotas,
                        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                    },
                ],
            },
        });
    }
}

// Evento para manejar el formulario
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const monto = parseFloat(document.getElementById("monto").value);
    const cuotas = parseInt(document.getElementById("cuotas").value);

    if (isNaN(monto) || isNaN(cuotas)) {
        alert("Por favor, ingrese datos válidos.");
        return;
    }

    const { total, cuota } = calcularCuota(monto, cuotas);

    usuarios.push({ monto, cuotas, total });

    detalleP.textContent = `Total a pagar: $${total.toFixed(2)}, en ${cuotas} cuotas de $${cuota.toFixed(2)}`;
    resultadoDiv.classList.remove("hidden");

    actualizarGrafico();
});

// Mostrar estadísticas con Chart.js
mostrarEstadisticasBtn.addEventListener("click", () => {
    estadisticasDiv.classList.remove("hidden");
    actualizarGrafico();
});

// Guardar datos en localStorage
guardarBtn.addEventListener("click", () => {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    detalleP.textContent = ""; // Borrar los datos del label
    alert("Datos guardados correctamente.");
});

// Limpiar datos y reiniciar el simulador
limpiarBtn.addEventListener("click", () => {
    if (confirm("¿Está seguro de que desea limpiar los datos?")) {
        usuarios = [];
        localStorage.removeItem("usuarios");
        detalleP.textContent = "";
        resultadoDiv.classList.add("hidden");
        estadisticasDiv.classList.add("hidden");
        if (chart) {
            chart.destroy();
            chart = null;
        }
        alert("Datos limpiados y simulador reiniciado.");
    }
});

// Inicializar
cargarTasas();
