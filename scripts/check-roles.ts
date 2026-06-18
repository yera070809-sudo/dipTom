import { db } from '../lib/db'; async function main() { const users = await db.user.findMany({ select: { email: true, role: true } }); console.log(users); } main();
