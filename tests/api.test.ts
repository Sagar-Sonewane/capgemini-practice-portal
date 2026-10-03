import test from "node:test";
import assert from "node:assert/strict";
import { GET as roundHandler } from "../app/api/round/route";
import { POST as scoreHandler } from "../app/api/score/route";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

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

test("GET /api/round - Listening module difficulty filtering (low & medium)", async () => {
  const reqLow = new NextRequest("http://localhost:3000/api/round?module=listening&difficulty=low&count=5");
  const resLow = await roundHandler(reqLow);
  assert.equal(resLow.status, 200);
  const dataLow = await resLow.json();
  assert.ok(dataLow.items.length > 0);
  for (const item of dataLow.items) {
    assert.equal(item.difficulty, "low");
  }

  const reqMed = new NextRequest("http://localhost:3000/api/round?module=listening&difficulty=medium&count=5");
  const resMed = await roundHandler(reqMed);
  assert.equal(resMed.status, 200);
  const dataMed = await resMed.json();
  assert.ok(dataMed.items.length > 0);
  for (const item of dataMed.items) {
    assert.equal(item.difficulty, "medium");
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
  const readingData = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "data/reading.json"), "utf-8")
  );
  const sample = readingData[0];

  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: "reading",
      itemId: sample.id,
      response: sample.text,
    }),
  });

  const res = await scoreHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.id, sample.id);
  assert.equal(data.matchPercentage, 100);
  assert.equal(data.points, 2);
  // Must NOT include originalText when includeAnswer is omitted or false
  assert.equal(data.originalText, undefined);
});

test("POST /api/score - Reading & Listening scoring with includeAnswer: true", async () => {
  const readingData = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "data/reading.json"), "utf-8")
  );
  const sample = readingData[0];

  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: "reading",
      itemId: sample.id,
      response: "some completely wrong sentence",
      includeAnswer: true,
    }),
  });

  const res = await scoreHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.id, sample.id);
  assert.ok(data.matchPercentage < 50);
  assert.ok(typeof data.originalText === "string");
  assert.equal(data.originalText, sample.text);
});

test("POST /api/score - Writing evaluation handles questions array", async () => {
  const writingData = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "data/writing.json"), "utf-8")
  );
  const sample = writingData[0];

  const req = new NextRequest("http://localhost:3000/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: "writing",
      itemId: sample.id,
      response: ["Answer 1"],
      includeAnswer: true,
    }),
  });

  const res = await scoreHandler(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.id, sample.id);
  assert.ok(typeof data.percentage === "number");
});
