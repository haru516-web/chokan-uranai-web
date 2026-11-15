// GET /api/config … 決済の設定があるか。ないあいだは、アプリは、有料の枠を開いたままにする。
import legal from '../content/legal.json' with { type: 'json' };
import { billingConfigured, guard, json } from './_lib/http.js';

export const GET = guard(async () => json({ billing: billingConfigured(), monthlyYen: legal.plan.monthlyYen }));
