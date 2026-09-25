import { defineConfig, devices } from "@playwright/test";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const source=new URL(process.env.QA_DATABASE_URL||process.env.DATABASE_URL!);
if(!process.env.QA_DATABASE_URL)source.pathname=`/${source.pathname.slice(1).replace(/_(qa|test)$/i,"")}_qa`;
process.env.DATABASE_URL=source.toString();
const qaPort=3197;
const qaUrl=`http://127.0.0.1:${qaPort}`;
const testEnv={...process.env,DATABASE_URL:source.toString(),NODE_ENV:"test",LOCAL_STORAGE_FOR_QA:"true",EMAIL_TRANSPORT:"mock",SINPE_MOBILE_NUMBER:"70000000",ADMIN_EMAIL:"admin@orosblooms.qa",ADMIN_PASSWORD_HASH:"scrypt$16384$8$1$xCBXHEuTM9eJoUY2dcZ_nQ$lK-7ca7RQPIdZH5UaDPQAerAOuHR6w7Qz5vkwwjjVo5IGb0kj4vmw16zpwSEFnS1eKckFvn8v6JdQMeusfVNJw",ADMIN_SESSION_SECRET:"qa-only-session-secret-with-at-least-32-characters",NEXT_PUBLIC_SITE_URL:qaUrl};

export default defineConfig({
  testDir:"./e2e",fullyParallel:false,workers:1,retries:0,timeout:60_000,reporter:[["list"]],
  globalSetup:"./e2e/global-setup.ts",
  use:{baseURL:qaUrl,trace:"retain-on-failure",screenshot:"only-on-failure"},
  webServer:{command:`node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${qaPort}`,url:qaUrl,reuseExistingServer:false,timeout:120_000,env:testEnv},
  projects:[{name:"chromium",use:{...devices["Desktop Chrome"]}}],
});
