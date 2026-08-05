// ===============================
// SCRIPT.JS (Gestión de Planes)
// ===============================

import { db, auth, collection, addDoc, doc, updateDoc } from "./firebase.js";

console.log("✅ script.js cargado correctamente");

// ===============================
// MODAL DE CONTRATACIÓN
// ===============================
function abrirModal(plan, velocidad, precio) {
    const modal = document.getElementById("modal");
    if (!modal) return;

    const titulo = document.getElementById("tituloPlan");
    const vel = document.getElementById("velocidadPlan");
    const inputPlan = document.getElementById("plan");
    const inputPrecio = document.getElementById("precio");

    if (titulo) titulo.textContent = plan;
    if (vel) vel.textContent = `${velocidad} - ${precio}`;
    if (inputPlan) inputPlan.value = plan;
    if (inputPrecio) inputPrecio.value = precio;

    // Autocompletar correo si hay usuario activo
    if (auth.currentUser) {
        const emailInput = document.getElementById("email");
        if (emailInput && !emailInput.value) {
            emailInput.value = auth.currentUser.email;
        }
    }

    modal.style.display = "flex";
}

function cerrarModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.style.display = "none";
}

// Hacer las funciones globales para invocarlas desde HTML (onclick="abrirModal(...)")
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) cerrarModal();
});

// ===============================
// EMAILJS (Notificación por Correo)
// ===============================
async function enviarCorreo(nombre, email, plan, precio) {
    if (typeof emailjs === "undefined") {
        console.warn("⚠️ EmailJS no está cargado en esta página.");
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
                fecha: new Date().toLocaleDateString("es-DO")
            }
        );
        console.log("✅ Correo enviado con éxito vía EmailJS");
    } catch (err) {
        console.error("❌ Error enviando correo vía EmailJS:", err);
    }
}

// ===============================
// FORMULARIO DE CONTRATACIÓN
// ===============================
const formulario = document.getElementById("formulario");

if (formulario) {
    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        const btnSubmit = formulario.querySelector('button[type="submit"]');
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Procesando...";
        }

        const nombre = document.getElementById("nombre")?.value.trim() || "";
        const email = document.getElementById("email")?.value.trim() || "";
        const cedula = document.getElementById("cedula")?.value.trim() || "";
        const plan = document.getElementById("plan")?.value || "";
        const precio = document.getElementById("precio")?.value || "";

        try {
            // 1. Guardar la solicitud en Firestore (Colección 'Solicitudes')
            await addDoc(collection(db, "Solicitudes"), {
                nombre: nombre,
                email: email,
                cedula: cedula,
                plan: plan,
                precio: precio,
                uid: auth.currentUser ? auth.currentUser.uid : null,
                fecha: new Date()
            });

            // 2. Si el usuario ya inició sesión, actualizar su documento en Firestore
            if (auth.currentUser) {
                const userRef = doc(db, "usuarios", auth.currentUser.uid);
                await updateDoc(userRef, {
                    plan: plan,
                    precio: precio,
                    cedula: cedula
                });
            } else {
                // Si no ha iniciado sesión, guardar en localStorage para asociarlo al registrarse
                localStorage.setItem("planSeleccionado", plan);
                localStorage.setItem("precioSeleccionado", precio);
            }

            // 3. Notificación vía EmailJS
            await enviarCorreo(nombre, email, plan, precio);

            alert(`🎉 ¡Plan "${plan}" solicitado correctamente!`);

            formulario.reset();
            cerrarModal();

            // Redirigir al registro/login si el usuario no tiene sesión activa
            if (!auth.currentUser) {
                window.location.href = "login.html";
            }

        } catch (error) {
            console.error("❌ Error en Firestore:", error);
            alert("Error al procesar la solicitud: " + error.message);
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Solicitar Plan";
            }
        }
    });
}