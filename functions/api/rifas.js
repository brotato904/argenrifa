export async function onRequest(context) {

    const { request, env } = context;

    const db = env.ARGENRIFA_DB;

    const metodo = request.method;


    // =========================
    // GET: Listar todas las rifas
    // =========================

    if (metodo === "GET") {

        try {

            const { results } = await db
                .prepare("SELECT * FROM rifas")
                .all();

            const rifas = results.map(function (r) {

                return {
                    id: r.id,
                    titulo: r.titulo,
                    descripcion: r.descripcion,
                    cantidad: r.cantidad,
                    precio: r.precio,
                    pais: r.pais,
                    provincia: r.provincia,
                    creador: r.creador,
                    imagen: r.imagen,
                    estado: r.estado,
                    ganador: r.ganador,
                    usuarioGanador: r.usuarioGanador,
                    numerosOcupados: JSON.parse(r.numerosOcupados || "[]"),
                    participantes: JSON.parse(r.participantes || "[]")
                };

            });

            return new Response(
                JSON.stringify(rifas),
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

        } catch (error) {

            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
            );

        }

    }


    // =========================
    // POST: Guardar / actualizar rifa
    // =========================

    if (metodo === "POST") {

        try {

            const rifa = await request.json();

            await db.prepare(`
                INSERT OR REPLACE INTO rifas (
                    id, titulo, descripcion, cantidad, precio,
                    pais, provincia, creador, imagen, estado,
                    ganador, usuarioGanador, numerosOcupados,
                    participantes, fechaCreacion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                String(rifa.id),
                rifa.titulo,
                rifa.descripcion,
                rifa.cantidad,
                rifa.precio,
                rifa.pais,
                rifa.provincia,
                rifa.creador,
                rifa.imagen || null,
                rifa.estado || "activa",
                rifa.ganador || null,
                rifa.usuarioGanador || null,
                JSON.stringify(rifa.numerosOcupados || []),
                JSON.stringify(rifa.participantes || []),
                new Date().toISOString()
            ).run();

            return new Response(
                JSON.stringify({ ok: true }),
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

        } catch (error) {

            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
            );

        }

    }


    // =========================
    // DELETE: Borrar rifa
    // =========================

    if (metodo === "DELETE") {

        try {

            const url = new URL(request.url);
            const id = url.searchParams.get("id");

            if (!id) {
                return new Response("Falta el id", { status: 400 });
            }

            await db
                .prepare("DELETE FROM rifas WHERE id = ?")
                .bind(id)
                .run();

            return new Response(
                JSON.stringify({ ok: true }),
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

        } catch (error) {

            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                }
            );

        }

    }


    return new Response("Método no permitido", { status: 405 });

}