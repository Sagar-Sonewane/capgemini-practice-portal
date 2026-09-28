import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getMatchPercentage, getScoringDetails } from "@/lib/scoring/matchPercentage";
import { ModuleType, ReadingItem, ListeningItem, WritingItem } from "@/types";

// Helper to safely load server-side data from /data directory
async function loadModuleData(moduleName: ModuleType): Promise<any[]> {
  const filePath = path.join(process.cwd(), "data", `${moduleName}.json`);
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
}

/**
 * Text answer evaluator for writing comprehension:
 * checks for case-insensitive keyword/substring presence or exact normalized match.
 */
function evaluateTextAnswer(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;

  const cleanUser = userAnswer.toLowerCase().trim();
  const cleanCorrect = correctAnswer.toLowerCase().trim();

  if (cleanUser === cleanCorrect) return true;

  // Keyword / Substring check
  if (cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser)) {
    return true;
  }

  // Token overlap check: if at least 70% of key words from correct answer are present
  const correctTokens = cleanCorrect.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const userTokens = new Set(cleanUser.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));

  if (correctTokens.length > 0) {
    const matchedCount = correctTokens.filter((token) => userTokens.has(token)).length;
    if (matchedCount / correctTokens.length >= 0.7) {
      return true;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module: moduleParam, itemId, response: userResponse, includeAnswer } = body;

    if (!moduleParam || !["reading", "listening", "writing"].includes(moduleParam)) {
      return NextResponse.json(
        { error: "Invalid or missing 'module' parameter." },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: "Missing 'itemId' parameter." },
        { status: 400 }
      );
    }

    const rawData = await loadModuleData(moduleParam as ModuleType);
    const item = rawData.find((d: any) => d.id === itemId);

    if (!item) {
      return NextResponse.json(
        { error: `Item with id '${itemId}' not found in module '${moduleParam}'.` },
        { status: 404 }
      );
    }

    if (moduleParam === "reading" || moduleParam === "listening") {
      const targetText =
        moduleParam === "reading"
          ? (item as ReadingItem).text
          : (item as ListeningItem).transcript;

      const transcribed = typeof userResponse === "string" ? userResponse : "";
      const scoreDetails = getScoringDetails(transcribed, targetText);

      return NextResponse.json({
        id: itemId,
        matchPercentage: scoreDetails.matchPercentage,
        points: scoreDetails.points,
        similarity: scoreDetails.similarity,
        completeness: scoreDetails.completeness,
        ...(includeAnswer ? { originalText: targetText } : {}),
      });
    }

    if (moduleParam === "writing") {
      const writingItem = item as WritingItem;
      const questions = writingItem.questions || [];
      const answers: string[] = Array.isArray(userResponse)
        ? userResponse
        : typeof userResponse === "object" && userResponse !== null
        ? Object.values(userResponse)
        : [String(userResponse || "")];

      const results = questions.map((q, idx) => {
        const givenAnswer = answers[idx] || "";
        let isCorrect = false;

        if (q.type === "mcq") {
          isCorrect = givenAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
        } else {
          isCorrect = evaluateTextAnswer(givenAnswer, q.answer);
        }

        return {
          questionIndex: idx,
          correct: isCorrect,
          ...(includeAnswer ? { answer: q.answer } : {}),
        };
      });

      const correctCount = results.filter((r) => r.correct).length;
      const totalQuestions = questions.length;
      const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const points = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 2 * 100) / 100 : 0;

      return NextResponse.json({
        id: itemId,
        results,
        correctCount,
        totalQuestions,
        percentage,
        points,
      });
    }

    return NextResponse.json({ error: "Unsupported module" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
