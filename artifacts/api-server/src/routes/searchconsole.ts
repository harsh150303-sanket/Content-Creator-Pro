import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

async function getClientForUser(clientId: number, userId: string) {
  const [client] = await db
    .select()
    .from(clientsTable)
    .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, userId)));
  return client;
}

router.post("/clients/:clientId/search-console/connect", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const { siteUrl } = req.body;
  if (!siteUrl) { res.status(400).json({ error: "siteUrl is required" }); return; }

  await db.update(clientsTable).set({
    searchConsoleConnected: true,
    searchConsoleSiteUrl: siteUrl,
    updatedAt: new Date(),
  }).where(eq(clientsTable.id, clientId));

  res.json({ connected: true, siteUrl });
});

router.get("/clients/:clientId/search-console/keywords", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  if (!client.searchConsoleConnected) {
    res.json([]);
    return;
  }

  const mockKeywords = [
    { keyword: `${client.name} services`, clicks: 342, impressions: 4200, ctr: 0.081, position: 4.2 },
    { keyword: `best ${client.industry || "business"} solutions`, clicks: 218, impressions: 5800, ctr: 0.038, position: 7.1 },
    { keyword: `${client.website?.replace(/https?:\/\//, "").split("/")[0] || "company"}`, clicks: 891, impressions: 2100, ctr: 0.424, position: 1.3 },
    { keyword: `affordable ${client.industry || "professional"} services`, clicks: 156, impressions: 3400, ctr: 0.046, position: 8.9 },
    { keyword: `${client.industry || "business"} near me`, clicks: 423, impressions: 6700, ctr: 0.063, position: 5.5 },
    { keyword: `how to choose ${client.industry || "a service"}`, clicks: 87, impressions: 2200, ctr: 0.040, position: 11.2 },
    { keyword: `${client.name} reviews`, clicks: 234, impressions: 1800, ctr: 0.130, position: 2.8 },
    { keyword: `top ${client.industry || "business"} companies`, clicks: 112, impressions: 4500, ctr: 0.025, position: 13.4 },
  ];

  res.json(mockKeywords);
});

export default router;
