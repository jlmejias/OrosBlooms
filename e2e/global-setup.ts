import { execFileSync } from "node:child_process";

export default function globalSetup(){execFileSync("npm",["run","qa:setup"],{cwd:process.cwd(),stdio:"inherit",shell:process.platform==="win32"});}
