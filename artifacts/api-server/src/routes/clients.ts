import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/clients", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const clients = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.userId, req.user.id));
  res.json(clients.map(c => ({
    id: c.id,
    name: c.name,
    website: c.website,
    industry: c.industry,
    targetAudience: c.targetAudience,
    toneOfVoice: c.toneOfVoice,
    searchConsoleConnected: c.searchConsoleConnected,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  })));
});

router.post("/clients", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { name, website, industry, targetAudience, toneOfVoice } = req.body;
  if (!name || !website) {
    res.status(400).json({ error: "name and website are required" });
    return;
  }
  const [client] = await db.insert(clientsTable).values({
    userId: req.user.id,
    name,
    website,
    industry: industry || null,
    targetAudience: targetAudience || null,
    toneOfVoice: toneOfVoice || null,
  }).returning();
  res.status(201).json({
    id: client.id,
    name: client.name,
    website: client.website,
    industry: client.industry,
    targetAudience: client.targetAudience,
    toneOfVoice: client.toneOfVoice,
    searchConsoleConnected: client.searchConsoleConnected,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  });
});

router.get("/clients/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(req.params.id);
  const [client] = await db
    .select()
    .from(clientsTable)
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)));
  if (!client) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: client.id,
    name: client.name,
    website: client.website,
    industry: client.industry,
    targetAudience: client.targetAudience,
    toneOfVoice: client.toneOfVoice,
    searchConsoleConnected: client.searchConsoleConnected,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  });
});

router.put("/clients/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(req.params.id);
  const { name, website, industry, targetAudience, toneOfVoice } = req.body;
  const [client] = await db
    .update(clientsTable)
    .set({
      name,
      website,
      industry: industry || null,
      targetAudience: targetAudience || null,
      toneOfVoice: toneOfVoice || null,
      updatedAt: new Date(),
    })
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)))
    .returning();
  if (!client) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: client.id,
    name: client.name,
    website: client.website,
    industry: client.industry,
    targetAudience: client.targetAudience,
    toneOfVoice: client.toneOfVoice,
    searchConsoleConnected: client.searchConsoleConnected,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  });
});

router.delete("/clients/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = parseInt(req.params.id);
  await db
    .delete(clientsTable)
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)));
  res.status(204).end();
});

export default router;
