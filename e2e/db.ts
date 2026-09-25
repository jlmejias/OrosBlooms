import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const url=new URL(process.env.QA_DATABASE_URL||process.env.DATABASE_URL!);if(!process.env.QA_DATABASE_URL)url.pathname=`/${url.pathname.slice(1).replace(/_(qa|test)$/i,"")}_qa`;
export async function query<T extends pg.QueryResultRow>(text:string,values:unknown[]=[]){const client=new pg.Client({connectionString:url.toString()});await client.connect();try{return(await client.query<T>(text,values)).rows;}finally{await client.end();}}
