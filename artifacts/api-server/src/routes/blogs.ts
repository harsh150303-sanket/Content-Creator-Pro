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

  const systemPrompt = `You are a seasoned human writer and content strategist who has been writing for ${client.name} for years. You know their voice inside and out. You write the way real people talk — with opinions, personality, and the occasional tangent that makes a piece feel alive.

COMPANY CONTEXT:
- Company: ${client.name} (${client.website})
- Industry: ${client.industry || "business"}
${client.targetAudience ? `- Audience: ${client.targetAudience}` : ""}
${client.toneOfVoice ? `- Voice: ${client.toneOfVoice}` : "- Voice: Confident and direct, but never stiff"}

CRITICAL WRITING RULES — follow every single one:

1. SENTENCE VARIETY: Mix very short sentences (3-6 words) with medium and occasionally longer ones. Never write three sentences in a row that are the same length.

2. CONTRACTIONS: Always use contractions. "Don't" not "do not". "It's" not "it is". "You're" not "you are". This is non-negotiable.

3. FORBIDDEN WORDS/PHRASES — never use these ever:
   - "delve", "delve into", "dive deep", "dive into"
   - "in today's fast-paced world", "in today's digital age", "in today's landscape"
   - "it's important to note", "it is worth noting", "it's worth mentioning"
   - "moreover", "furthermore", "additionally" (use "also", "and", "plus", "on top of that")
   - "leverage" (use "use")
   - "comprehensive", "robust", "seamless", "cutting-edge", "state-of-the-art"
   - "in conclusion" (just write the conclusion naturally)
   - "game-changer", "paradigm shift", "holistic approach"
   - "ensure" (use "make sure")
   - Starting with "In summary" or "To summarize"

4. HUMAN QUIRKS — include at least 3 of these:
   - A rhetorical question ("But is it actually worth it?")
   - A personal anecdote or scenario in second person ("Picture this: you're three hours into...")
   - An em-dash for emphasis or aside — like this
   - Starting a sentence with "And" or "But" or "So"
   - A parenthetical aside (even just a small one)
   - A slightly opinionated statement the writer stands behind
   - One specific, concrete example with real numbers or details

5. STRUCTURE: Don't make every section follow the same pattern. Some sections can be just paragraphs. Some can have a short list. Don't use bullet points for everything. Let the structure breathe.

6. OPENING: Never start with a definition, a statistic, or "Are you looking for...". Hook the reader with a scenario, a bold claim, or a surprising fact — then back it up.

7. SEO: Weave the focus keyword in naturally — in the title, first 100 words, at least 2-3 subheadings, and conclusion. Never keyword stuff.`;

  const userPrompt = `Write a blog post for ${client.name} about: "${topic}"
${focusKeyword ? `Focus keyword to weave in naturally: ${focusKeyword}` : ""}
Target length: approximately ${targetWordCount} words
${additionalInstructions ? `Extra context: ${additionalInstructions}` : ""}

Use markdown formatting. Write it like a real person wrote it — someone who actually knows this topic and has opinions about it. The goal is that no AI detector flags this.

Return JSON with exactly these fields:
{
  "title": "A title a real writer would be proud of (not clickbait, not formulaic)",
  "content": "The full blog post in markdown",
  "metaDescription": "A crisp 150-160 character meta description",
  "seoScore": a number between 72 and 91
}`;

  const draftCompletion = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
  });

  const draft = JSON.parse(draftCompletion.choices[0]?.message?.content || "{}");

  const humanizePrompt = `Here's a blog post draft. Your job is to humanize it — make it pass any AI detection tool with flying colors.

DRAFT:
${draft.content}

REWRITE RULES:
- Find any sentence that sounds "AI-written" and rewrite it to sound like a real person said it
- Break up any paragraph that's more than 4 sentences
- If you see 3+ sentences in a row that start the same way, vary them
- Remove any of the forbidden phrases: "delve", "leverage", "comprehensive", "moreover", "furthermore", "it's important to note", "in today's", "ensure", "in conclusion"
- Add at least one more personal/scenario touch that feels grounded
- Make sure contractions are used throughout
- Vary the rhythm: short punch. Then a longer sentence that builds on it. Then medium. Mix it up.
- The opening paragraph should feel like it was written by someone sitting down and just... starting to write
- Return ONLY the rewritten markdown content, nothing else`;

  const humanized = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "user", content: humanizePrompt }
    ],
  });

  const finalContent = humanized.choices[0]?.message?.content || draft.content || "";

  const title = draft.title || topic;
  const wordCount = finalContent.trim().split(/\s+/).length;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const [blog] = await db.insert(blogPostsTable).values({
    clientId,
    title,
    slug,
    content: finalContent,
    metaDescription: draft.metaDescription || null,
    focusKeyword: focusKeyword || null,
    status: "draft",
    wordCount,
    seoScore: draft.seoScore || null,
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
