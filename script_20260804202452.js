// ===============================
// SCRIPT.JS (Gestión de Planes)
// ===============================

import { db, auth, collection, addDoc, doc, updateDoc } from "./firebase.js";

console.log("✅ script.js cargado correctamente");

// MODAL
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

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) cerrarModal();
});

// EMAILJS
async function enviarCorreo(nombre, email, plan, precio) {
    if (typeof emailjs === "undefined") return;

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

// FORMULARIO DE CONTRATACIÓN
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
            // 1. Guardar la solicitud en Firestore
            await addDoc(collection(db, "Solicitudes"), {
                nombre: nombre,
                email: email,
                cedula: cedula,
                plan: plan,
                precio: precio,
                uid: auth.currentUser ? auth.currentUser.uid : null,
                fecha: new Date()
            });

            // 2. Si el usuario ya está autenticado, actualizar su perfil de usuario
            if (auth.currentUser) {
                const userRef = doc(db, "usuarios", auth.currentUser.uid);
                await updateDoc(userRef, {
                    plan: plan,
                    precio: precio,
                    cedula: cedula
                });
            } else {
                // Si no ha iniciado sesión, guardamos la elección en storage
                localStorage.setItem("planSeleccionado", plan);
                localStorage.setItem("precioSeleccionado", precio);
            }

            // 3. Notificación vía EmailJS
            enviarCorreo(nombre, email, plan, precio);

            alert(`🎉 ¡Plan "${plan}" solicitado correctamente!`);

            formulario.reset();
            cerrarModal();

            // Redirigir al registro/login si el usuario no tiene cuenta activa
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