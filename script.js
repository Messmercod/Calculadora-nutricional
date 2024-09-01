document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-btn").addEventListener("click", iniciarSesion);
    document.getElementById("generar-menu-btn").addEventListener("click", function() {
        const menu = generarMenuAleatorio();
        document.getElementById("menu-resultados").innerHTML = menu;
    });
    document.getElementById("btn-calcular").addEventListener("click", calcular);
    document.getElementById("exportar-pdf-btn").addEventListener("click", exportarPDF);
    document.getElementById("toggle-pliegues").addEventListener("change", function () {
        document.getElementById("pliegues-section").classList.toggle("active", this.checked);
    });
});

function iniciarSesion() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    activarLicencia(password);
}

function activarLicencia(codigoLicencia) {
    try {
        const licenciaDecodificada = JSON.parse(atob(codigoLicencia));
        const fechaActual = new Date();
        const fechaExpiracion = new Date(licenciaDecodificada.expiracion);

        if (fechaExpiracion > fechaActual) {
            localStorage.setItem('licencia', JSON.stringify(licenciaDecodificada));
            alert("Licencia activada con éxito.");
            mostrarFormulario();
        } else {
            alert("Licencia expirada. Contacte con el soporte.");
        }
    } catch (e) {
        alert("Código de licencia inválido.");
    }
}

function mostrarFormulario() {
    document.getElementById("form-nutricional").style.display = 'block';
    document.getElementById("generar-menu-btn").style.display = 'block';
    document.getElementById("btn-nuevo-calculo").style.display = 'block';
    document.getElementById("exportar-pdf-btn").style.display = 'block';
}

function calcular() {
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const edad = parseInt(document.getElementById("edad").value);
    const genero = document.getElementById("genero").value;
    const actividad = parseFloat(document.getElementById("actividad").value);
    const objetivo = document.getElementById("objetivo").value;
    const carbohidratosPorcentaje = parseFloat(document.getElementById("carbohidratos").value);
    const proteinasPorcentaje = parseFloat(document.getElementById("proteinas").value);
    const grasasPorcentaje = parseFloat(document.getElementById("grasas").value);

    let tmb;
    if (genero === "masculino") {
        tmb = (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
    } else {
        tmb = (10 * peso) + (6.25 * altura) - (5 * edad) - 161;
    }

    let caloriasDiarias = tmb * actividad;
    if (objetivo === "perder_peso") {
        caloriasDiarias -= 500;
    } else if (objetivo === "ganar_musculo") {
        caloriasDiarias += 500;
    }

    const pliegues = document.getElementById("toggle-pliegues").checked ? {
        triceps: parseFloat(document.getElementById("triceps").value) || 0,
        suprailiaco: parseFloat(document.getElementById("suprailiaco").value) || 0,
        subescapular: parseFloat(document.getElementById("subescapular").value) || 0,
        biceps: parseFloat(document.getElementById("biceps").value) || 0,
    } : null;

    const menuManual = document.getElementById("menu-manual")?.value.trim() || generarMenuAleatorio();
    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = `
        <p>Paciente: ${document.getElementById("nombre-paciente").value}</p>
        <p>Peso: ${peso} kg</p>
        <p>Altura: ${altura} cm</p>
        <p>Edad: ${edad} años</p>
        <p>Género: ${genero}</p>
        <p>Tasa Metabólica Basal (TMB): ${tmb.toFixed(2)} kcal/día</p>
        <p>Calorías Diarias necesarias: ${caloriasDiarias.toFixed(2)} kcal/día</p>
        ${pliegues ? `
        <h3>Mediciones de Pliegues Cutáneos</h3>
        <p>Tríceps: ${pliegues.triceps} mm</p>
        <p>Suprailiaco: ${pliegues.suprailiaco} mm</p>
        <p>Subescapular: ${pliegues.subescapular} mm</p>
        <p>Bíceps: ${pliegues.biceps} mm</p>
        ` : ''}
        <h3>Distribución de Macronutrientes</h3>
        <p>Carbohidratos: ${carbohidratosPorcentaje}%</p>
        <p>Proteínas: ${proteinasPorcentaje}%</p>
        <p>Grasas: ${grasasPorcentaje}%</p>
        <h3>Menú Sugerido para la Semana</h3>
        ${menuManual}
    `;
}

function exportarPDF() {
    if (window.jspdf) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.html(document.getElementById("resultados"), {
            callback: function (doc) {
                doc.save("plan_nutricional.pdf");
            },
            x: 10,
            y: 10,
            width: 180
        });
    } else {
        console.error("jsPDF no está disponible.");
        alert("Error al exportar el PDF. Asegúrese de que jsPDF esté correctamente cargado.");
    }
}

function generarMenuAleatorio() {
    const alimentosSaludables = {
        vegetales: ["Espárragos", "Brócoli", "Coles de Bruselas", "Repollo", "Zanahorias", "Apio", "Pepino", "Berenjena", "Col rizada", "Champiñones", "Quimbombó", "Judías verdes", "Pimientos morrones", "Lechuga", "Espinaca", "Calabacín", "Tomates"],
        proteinas: ["Pollo (100g)", "Pavo (100g)", "Huevos", "Salmón (100g)", "Bacalao (100g)", "Atún (100g)", "Camarones (100g)", "Carne de res magra (100g)", "Cerdo magro (100g)", "Queso (30g)"],
        granos: ["Arroz integral (100g)", "Quinoa (100g)", "Avena (50g)", "Pan integral (1 rebanada)", "Pasta integral (100g)"],
        frutas: ["Manzana", "Plátano", "Fresas", "Naranjas", "Peras", "Uvas", "Melón", "Mango"],
        grasas: ["Aceite de oliva (1 cucharadita)", "Aguacate (medio)", "Nueces (30g)", "Mantequilla de maní (1 cucharada)"]
    };

    const desayuno = elegirAleatorio(alimentosSaludables.vegetales) + ", " + elegirAleatorio(alimentosSaludables.proteinas);
    const colacion1 = elegirAleatorio(alimentosSaludables.frutas) + " con " + elegirAleatorio(alimentosSaludables.grasas);
    const comida = elegirAleatorio(alimentosSaludables.vegetales) + ", " + elegirAleatorio(alimentosSaludables.proteinas) + ", " + elegirAleatorio(alimentosSaludables.granos);
    const colacion2 = elegirAleatorio(alimentosSaludables.frutas);
    const cena = elegirAleatorio(alimentosSaludables.vegetales) + ", " + elegirAleatorio(alimentosSaludables.proteinas) + ", " + elegirAleatorio(alimentosSaludables.grasas);

    return `
        <p><strong>Desayuno:</strong> ${desayuno}</p>
        <p><strong>Colación 1:</strong> ${colacion1}</p>
        <p><strong>Comida:</strong> ${comida}</p>
        <p><strong>Colación 2:</strong> ${colacion2}</p>
        <p><strong>Cena:</strong> ${cena}</p>
    `;
}

function elegirAleatorio(lista) {
    const indice = Math.floor(Math.random() * lista.length);
    return lista[indice];
}


