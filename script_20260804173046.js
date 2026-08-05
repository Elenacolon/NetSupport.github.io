import { db, collection, addDoc } from "./firebase.js";

console.log("✅ script.js cargado correctamente");


// CONTROL DEL MODAL


function abrirModal(plan, velocidad, precio) {
    console.log("Intentando abrir modal para:", plan);

    const modal = document.getElementById("modal");
    if (!modal) {
        console.error("❌ No se encontró ningún elemento con id='modal' en el HTML.");
        return;
    }

    const titulo = document.getElementById("tituloPlan");
    const vel = document.getElementById("velocidadPlan");
    const inputPlan = document.getElementById("plan");
    const inputPrecio = document.getElementById("precio");

    if (titulo) titulo.textContent = plan;
    if (vel) vel.textContent = `${velocidad} - ${precio}`;
    if (inputPlan) inputPlan.value = plan;
    if (inputPrecio) inputPrecio.value = precio;

    modal.style.display = "flex";
}

function cerrarModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Asignar al objeto global 'window'
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

// Cierre al dar clic fuera de la caja modal
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
        cerrarModal();
    }
});

// EMAILJS

async function enviarCorreo(nombre, email, plan, precio) {
    const fecha = new Date().toLocaleDateString("es-DO");

    // Verificar si la librería de EmailJS existe en window
    if (typeof emailjs === "undefined") {
        console.warn("⚠️ EmailJS no está cargado en el HTML.");
        return;
    }

    try {
        await emailjs.send(
            "service_y4k9d8m",
            "template_gnmuza7",
            {
                nombre: nombre,
                email: email,
                plan: plan,
                precio: precio,
                fecha: fecha
            }
        );
        console.log("✅ Correo enviado con éxito vía EmailJS");
    } catch (err) {
        console.error("❌ Error enviando correo vía EmailJS:", err);
    }
}


// FORMULARIO & FIRESTORE


const formulario = document.getElementById("formulario");

if (formulario) {
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const btnSubmit = formulario.querySelector('button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Procesando...";
        }

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const cedula = document.getElementById("cedula").value.trim();
        const plan = document.getElementById("plan").value;
        const precio = document.getElementById("precio").value;

        try {
            // 1. Guardar en Firestore
            await addDoc(collection(db, "Solicitudes"), {
                nombre: nombre,
                email: email,
                cedula: cedula,
                plan: plan,
                precio: precio,
                fecha: new Date()
            });

            // 2. Intentar envío de correo (sin bloquear si falla)
            enviarCorreo(nombre, email, plan, precio);

            // 3. Confirmación al usuario
            alert(`🎉 ¡Plan "${plan}" seleccionado exitosamente!\n\nUn asesor se pondrá en contacto contigo a la brevedad.`);

            formulario.reset();
            cerrarModal();

        } catch (error) {
            console.error("❌ Error en Firestore:", error);
            alert("Ocurrió un error al procesar tu solicitud:\n\n" + error.message);
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Solicitar Plan";
            }
        }
    });
}

