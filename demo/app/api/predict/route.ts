import { spawn } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function runPythonPrediction(text: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const repoRoot = path.resolve(cwd, "..");
    const scriptPath = path.join(cwd, "scripts", "predict.py");

    const defaultPython = path.join(repoRoot, ".venv", "bin", "python");
    const pythonBin = process.env.PYTHON_PATH || defaultPython;

    const child = spawn(pythonBin, [scriptPath, text], {
      cwd,
      env: {
        ...process.env,
        REPO_ROOT: repoRoot,
      },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `python exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch {
        reject(new Error("Invalid JSON output from predictor."));
      }
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = body.text?.trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "Input text must be at least 20 characters." },
        { status: 400 },
      );
    }

    const prediction = await runPythonPrediction(text);
    return NextResponse.json(prediction);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Prediction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
