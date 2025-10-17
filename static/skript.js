const puntosTier = {
    "LT5": 1, "HT5": 2, "LT4": 3, "HT4": 4,
    "LT3": 6, "HT3": 10, "LT2": 16, "HT2": 28,
    "LT1": 44, "HT1": 60
};

function cargarRanking() {
    fetch("/static/ranking.json")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo cargar ranking.json");
            return res.json();
        })
        .then(data => {
            if (!data.usuarios) {
                console.error("El JSON no tiene la propiedad 'usuarios'");
                return;
            }

            const usuarios = data.usuarios;
            const rankingArray = [];

            // Construir datos del ranking
            for (let id in usuarios) {
                const user = usuarios[id];
                const modalidadesObj = {};
                let puntosTotales = 0;

                for (let key in user) {
                    if (key === "discord_name") continue;
                    const tier = user[key];
                    modalidadesObj[key] = tier;
                    puntosTotales += puntosTier[tier] || 0;
                }

                rankingArray.push({
                    nombre: user.discord_name || "Sin nombre",
                    modalidadesObj: modalidadesObj,
                    puntos: puntosTotales
                });
            }

            // Ordenar por puntos
            rankingArray.sort((a, b) => b.puntos - a.puntos);

            // Mostrar en tabla
            const tbody = document.querySelector("#ranking-table tbody");
            tbody.innerHTML = "";

            rankingArray.forEach((user, index) => {
                const tr = document.createElement("tr");

                // Generar HTML con imágenes de modalidades
                const modalidadesHTML = Object.entries(user.modalidadesObj).map(([mod, tier]) => {
                    const filename = mod.toLowerCase().replace(/\s+/g, "_") + ".png";
                    const iconPath = `/static/modalidades/${filename}`;

                    return `
                        <div class="mod-item" title="${mod}: ${tier}">
                            <img src="${iconPath}" alt="${mod}" 
                                 class="mod-icon"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                            <span class="mod-text" style="display:none;">${mod}</span>
                            <span class="tier-label ${tier}">${tier}</span>
                        </div>
                    `;
                }).join("");

                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.nombre}</td>
                    <td class="mods-cell">${modalidadesHTML}</td>
                    <td>${user.puntos}</td>
                `;

                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error cargando ranking.json:", err));
}

document.addEventListener("DOMContentLoaded", cargarRanking);
