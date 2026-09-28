import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getRound } from "@/lib/randomization/getRound";
import {
  ModuleType,
  ReadingItem,
  ListeningItem,
  WritingItem,
  ListeningItemClientSafe,
  WritingItemClientSafe,
} from "@/types";

// Helper to safely load server-side data from /data directory
async function loadModuleData(moduleName: ModuleType): Promise<any[]> {
  const filePath = path.join(process.cwd(), "data", `${moduleName}.json`);
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleParam = searchParams.get("module") as ModuleType | null;
    const countParam = parseInt(searchParams.get("count") || "10", 10);
    const recentIdsParam = searchParams.get("recentIds") || "";

    if (!moduleParam || !["reading", "listening", "writing"].includes(moduleParam)) {
      return NextResponse.json(
        { error: "Invalid or missing 'module' parameter. Must be 'reading', 'listening', or 'writing'." },
        { status: 400 }
      );
    }

    const count = isNaN(countParam) || countParam <= 0 ? 10 : countParam;
    const recentIds = recentIdsParam
      ? recentIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
      : [];

    const rawData = await loadModuleData(moduleParam);

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json(
        { error: `No dataset items found for module '${moduleParam}'.` },
        { status: 404 }
      );
    }

    // Select randomized round with recentIds exclusion
    const { selected, updatedRecentIds } = getRound(rawData, count, recentIds);

    // CRITICAL SECURITY FIX: Strip all transcripts and answers before responding
    let clientSafeItems: any[] = [];

    if (moduleParam === "reading") {
      // Reading: full item is fine because sentence must be read on screen
      clientSafeItems = (selected as ReadingItem[]).map((item) => ({
        id: item.id,
        text: item.text,
      }));
    } else if (moduleParam === "listening") {
      // Listening: NEVER send transcript to client
      clientSafeItems = (selected as ListeningItem[]).map((item) => ({
        id: item.id,
        audio: item.audio,
      } as ListeningItemClientSafe));
    } else if (moduleParam === "writing") {
      // Writing: NEVER send question answer keys to client
      clientSafeItems = (selected as WritingItem[]).map((item) => ({
        id: item.id,
        audio: item.audio,
        questions: item.questions.map((q) => {
          const { answer, ...clientSafeQuestion } = q;
          return clientSafeQuestion;
        }),
      } as WritingItemClientSafe));
    }

    return NextResponse.json({
      module: moduleParam,
      count: clientSafeItems.length,
      items: clientSafeItems,
      updatedRecentIds,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
