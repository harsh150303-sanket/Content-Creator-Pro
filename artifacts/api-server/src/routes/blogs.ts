import { Router, type IRouter } from "express";
import { db, clientsTable, blogPostsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

async function getClientForUser(clientId: number, userId: string) {
  const [client] = await db
    .select()
    .from(clientsTable)
    .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, userId)));
  return client;
}

function mapBlog(b: typeof blogPostsTable.$inferSelect) {
  return {
    id: b.id,
    clientId: b.clientId,
    title: b.title,
    slug: b.slug,
    content: b.content,
    metaDescription: b.metaDescription,
    focusKeyword: b.focusKeyword,
    status: b.status,
    wordCount: b.wordCount,
    seoScore: b.seoScore,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

router.get("/clients/:clientId/blogs", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const blogs = await db.select().from(blogPostsTable).where(eq(blogPostsTable.clientId, clientId));
  res.json(blogs.map(mapBlog));
});

router.post("/clients/:clientId/blogs", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const { title, content, metaDescription, focusKeyword, status } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }

  const wordCount = content ? content.trim().split(/\s+/).length : null;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const [blog] = await db.insert(blogPostsTable).values({
    clientId,
    title,
    slug,
    content: content || null,
    metaDescription: metaDescription || null,
    focusKeyword: focusKeyword || null,
    status: status || "draft",
    wordCount,
  }).returning();

  res.status(201).json(mapBlog(blog));
});

router.post("/clients/:clientId/blogs/generate", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const { topic, focusKeyword, targetWordCount = 1200, additionalInstructions } = req.body;
  if (!topic) { res.status(400).json({ error: "topic is required" }); return; }

  const systemPrompt = `You are an expert SEO blog writer for ${client.name}, a ${client.industry || "business"} company. 
Their website is ${client.website}.
${client.targetAudience ? `Target audience: ${client.targetAudience}` : ""}
${client.toneOfVoice ? `Tone of voice: ${client.toneOfVoice}` : "Use a professional, engaging tone."}

Write high-quality, SEO-optimized blog posts that:
- Are naturally engaging and informative
- Include the focus keyword naturally throughout
- Have a clear structure with headers (H2, H3)
- Provide real value to the reader
- End with a compelling conclusion`;

  const userPrompt = `Write a comprehensive blog post about: "${topic}"
${focusKeyword ? `Focus keyword: ${focusKeyword}` : ""}
Target word count: approximately ${targetWordCount} words
${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ""}

Format the response as JSON with these fields:
{
  "title": "Compelling SEO title",
  "content": "Full blog post content in markdown format",
  "metaDescription": "SEO meta description (150-160 characters)",
  "seoScore": number between 70-95
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
  });

  const generated = JSON.parse(completion.choices[0]?.message?.content || "{}");
  const title = generated.title || topic;
  const content = generated.content || "";
  const wordCount = content.trim().split(/\s+/).length;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const [blog] = await db.insert(blogPostsTable).values({
    clientId,
    title,
    slug,
    content,
    metaDescription: generated.metaDescription || null,
    focusKeyword: focusKeyword || null,
    status: "draft",
    wordCount,
    seoScore: generated.seoScore || null,
  }).returning();

  res.status(201).json(mapBlog(blog));
});

router.get("/clients/:clientId/blogs/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const id = parseInt(req.params.id);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const [blog] = await db.select().from(blogPostsTable).where(and(eq(blogPostsTable.id, id), eq(blogPostsTable.clientId, clientId)));
  if (!blog) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapBlog(blog));
});

router.put("/clients/:clientId/blogs/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const id = parseInt(req.params.id);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  const { title, content, metaDescription, focusKeyword, status } = req.body;
  const wordCount = content ? content.trim().split(/\s+/).length : undefined;
  const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : undefined;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (slug !== undefined) updates.slug = slug;
  if (content !== undefined) updates.content = content;
  if (metaDescription !== undefined) updates.metaDescription = metaDescription;
  if (focusKeyword !== undefined) updates.focusKeyword = focusKeyword;
  if (status !== undefined) updates.status = status;
  if (wordCount !== undefined) updates.wordCount = wordCount;

  const [blog] = await db.update(blogPostsTable).set(updates).where(and(eq(blogPostsTable.id, id), eq(blogPostsTable.clientId, clientId))).returning();
  if (!blog) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapBlog(blog));
});

router.delete("/clients/:clientId/blogs/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clientId = parseInt(req.params.clientId);
  const id = parseInt(req.params.id);
  const client = await getClientForUser(clientId, req.user.id);
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }

  await db.delete(blogPostsTable).where(and(eq(blogPostsTable.id, id), eq(blogPostsTable.clientId, clientId)));
  res.status(204).end();
});

export default router;
