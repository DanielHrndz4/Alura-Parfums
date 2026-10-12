// Verification script for Supabase connection & schema
const https = require('https');

const SUPABASE_URL = 'https://zctdslmtqjqcadbsykez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Tq8n2CzxfFwN_MnfG3nPXg_Vriy35OR';

const tables = [
  'perfumes',
  'clients',
  'sales_transactions',
  'abonos_transactions',
  'supplier_invoices',
  'supplier_payments',
  'cash_drawer_summary',
  'weekly_audit_records',
];

console.log('--- Comprobando conexión a Supabase (' + SUPABASE_URL + ') ---\n');

function checkTable(table) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'zctdslmtqjqcadbsykez.supabase.co',
      path: `/rest/v1/${table}?select=*&limit=1`,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    };

    https
      .get(options, (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`[OK - 200] Tabla "${table}" activa y accesible.`);
            resolve(true);
          } else if (res.statusCode === 404) {
            console.log(`[NO EXISTE - 404] Tabla "${table}" no encontrada en Supabase.`);
            resolve(false);
          } else {
            console.log(`[HTTP ${res.statusCode}] Tabla "${table}": ${body}`);
            resolve(false);
          }
        });
      })
      .on('error', (err) => {
        console.error(`[ERROR] Conexión fallida para "${table}":`, err.message);
        resolve(false);
      });
  });
}

async function run() {
  let createdCount = 0;
  for (const t of tables) {
    const ok = await checkTable(t);
    if (ok) createdCount++;
  }
  console.log(`\nEstado: ${createdCount} de ${tables.length} tablas existen en Supabase.`);
  if (createdCount === 0) {
    console.log(
      '\n=> Las tablas aún NO han sido creadas en tu proyecto Supabase.\nPara crearlas en 30 segundos:\n1. Abre: https://supabase.com/dashboard/project/zctdslmtqjqcadbsykez/sql/new\n2. Pega el contenido de "supabase/schema.sql"\n3. Haz clic en "RUN".\n'
    );
  }
}

run();
