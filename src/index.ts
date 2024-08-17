import "dotenv/config";
import buildApp from "./infra";

const httpPort = process.env.PORT ? Number(process.env.PORT) : 3000;

const start = async () => {
  const fastify = await buildApp();
  try {
    const result = await fastify.listen({ port: httpPort, host: "0.0.0.0" });
    console.log(`⚡️ Server listening on ${result} ⚡️`);
  } catch (err) {
    console.error(err);
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
