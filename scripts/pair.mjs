import qrcode from "qrcode-terminal";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.argv[2];
const tokenPath = resolve(process.cwd(), "var/docker/access-token");
if (!base) throw new Error("Uso: node scripts/pair.mjs http://IP:8787");
const token = (process.env.MONOPAD_ACCESS_TOKEN || await readFile(tokenPath, "utf8")).trim();
if (!token) throw new Error(`Token não encontrado em ${tokenPath}`);
const url = new URL(base);
url.searchParams.set("token", token);
console.log("\nEscaneie este QR Code com a câmera do iPad:\n");
qrcode.generate(url.toString(), { small: true });
console.log(`\nEndereço: ${url.origin}`);
console.log("O token não é exibido. Use somente em uma rede confiável.\n");
