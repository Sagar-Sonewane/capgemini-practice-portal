import test from "node:test";
import assert from "node:assert/strict";
import { GET as roundHandler } from "../app/api/round/route";
import { POST as scoreHandler } from "../app/api/score/route";
import { NextRequest } from "next/server";

test("GET /api/round - Reading module returns text", async () => {
  const req = new NextRequest("http://localhost:3000/api/round?module=reading&count=2");
  const res = await roundHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.module, "reading");
  assert.equal(data.items.length, 2);
  assert.ok(data.items[0].id);
  assert.ok(data.items[0].text);
});

test("GET /api/round - Listening module STRICT INTEGRITY: transcript is NEVER included", async () => {
  const req = new NextRequest("http://localhost:3000/api/round?module=listening&count=3");
  const res = await roundHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.module, "listening");
  assert.ok(data.items.length > 0);

  for (const item of data.items) {
    assert.ok(item.id, "Item must have id");
    assert.ok(item.audio, "Item must have audio path");
    assert.equal(
      item.transcript,
      undefined,
      `SECURITY VIOLATION: transcript was exposed in listening item ${item.id}!`
    );
    assert.equal(
      "transcript" in item,
      false,
      `SECURITY VIOLATION: transcript key exists in listening item ${item.id}!`
    );
  }
});

test("GET /api/round - Writing module STRICT INTEGRITY: answer keys are NEVER included", async () => {
  const req = new NextRequest("http://localhost:3000/api/round?module=writing&count=3");
  const res = await roundHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.module, "writing");
  assert.ok(data.items.length > 0);

  for (const item of data.items) {
    assert.ok(item.id, "Item must have id");
    assert.ok(item.audio, "Item must have audio path");
    assert.ok(Array.isArray(item.questions), "Item must have questions");

    for (const q of item.questions) {
      assert.ok(q.q, "Question must have text");
      assert.ok(q.type, "Question must have type");
      assert.equal(
        q.answer,
        undefined,
        `SECURITY VIOLATION: answer key was exposed in question "${q.q}"!`
      );
      assert.equal(
        "answer" in q,
        false,
        `SECURITY VIOLATION: answer key exists in question object "${q.q}"!`
      );
    }
  }
});

test("POST /api/score - Reading & Listening scoring without answer leak by default", async () => {
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: "listening",
      itemId: "l001",
      response: "Effective collaboration across multidisciplinary project teams often determines the eventual success of complex organizational transformations.",
    }),
  });

  const res = await scoreHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.id, "l001");
  assert.equal(data.matchPercentage, 100);
  assert.equal(data.points, 2);
  // Must NOT include originalText when includeAnswer is omitted or false
  assert.equal(data.originalText, undefined);
});

test("POST /api/score - Reading & Listening scoring with includeAnswer: true", async () => {
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: "listening",
      itemId: "l001",
      response: "some wrong sentence",
      includeAnswer: true,
    }),
  });

  const res = await scoreHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.id, "l001");
  assert.ok(data.matchPercentage < 50);
  assert.ok(typeof data.originalText === "string");
});

test("POST /api/score - Writing evaluation for MCQ and text answers", async () => {
  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: "writing",
      itemId: "w001",
      response: [
        "Technological disruption and market agility", // correct MCQ
        "cross functional delivery speed",             // correct text keyword match
      ],
      includeAnswer: true,
    }),
  });

  const res = await scoreHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.id, "w001");
  assert.equal(data.correctCount, 2);
  assert.equal(data.totalQuestions, 2);
  assert.equal(data.percentage, 100);
  assert.equal(data.results[0].correct, true);
  assert.equal(data.results[1].correct, true);
});
