const titleInput = document.getElementById("issueTitle");
const repoUrlInput2 = document.getElementById("repoUrl");
const bodyInput = document.getElementById("issueBody");
const generateBtn2 = document.getElementById("generateBtn");
const downloadBtn2 = document.getElementById("downloadBtn");
const output2 = document.getElementById("output");

const BUY_URL = "https://buy.polar.sh/polar_cl_xCoPecUDtNvZIgx8pwhMiztgwoPJ4eSzZbToR2l27Ce";

function hasSignal(text, patterns) {
  const lowered = text.toLowerCase();
  return patterns.some((pattern) => lowered.includes(pattern));
}

function makePreview(title, repoUrl, body) {
  const lowered = body.toLowerCase();
  const hasSteps = hasSignal(lowered, ["steps to reproduce", "reproduce", "1.", "2.", "3.", "step "]);
  const hasExpected = hasSignal(lowered, ["expected", "should"]);
  const hasActual = hasSignal(lowered, ["actual", "instead", "fails", "error", "broken"]);
  const hasEnv = hasSignal(lowered, ["browser", "version", "os", "device", "environment"]);
  const hasLogs = hasSignal(lowered, ["stack trace", "console", "log", "traceback"]);
  const severity =
    hasSignal(lowered, ["security", "loss", "funds", "payment", "auth", "admin"]) ? "high" :
    hasSignal(lowered, ["crash", "cannot", "fails", "blocked"]) ? "medium" :
    "low";

  const ambiguityFlags = [];
  if (!hasSteps) ambiguityFlags.push("- Missing clear reproduction steps.");
  if (!hasExpected) ambiguityFlags.push("- Missing explicit expected behavior.");
  if (!hasActual) ambiguityFlags.push("- Missing explicit actual behavior or error condition.");
  if (!hasEnv) ambiguityFlags.push("- Missing environment details.");
  if (!hasLogs) ambiguityFlags.push("- Missing log, console, or trace evidence.");
  if (!ambiguityFlags.length) ambiguityFlags.push("- Basic issue structure looks usable for automated triage.");

  const checklist = [
    "- Confirm exact component or route involved.",
    "- Reproduce against latest default branch or current production version.",
    "- Capture logs or screenshots if available.",
    "- Isolate expected behavior versus actual behavior.",
    "- Decide whether the issue is valid, stale, underspecified, or blocked on missing info.",
  ];

  return `# Automated Issue Packet Preview

## Input
- Title: ${title}
- Repository: ${repoUrl || "not provided"}
- Generated at: ${new Date().toISOString()}

## Intake Verdict
- Severity hint: ${severity}
- Reproduction detail signal: ${hasSteps ? "present" : "weak"}
- Expected/actual split: ${hasExpected && hasActual ? "present" : "incomplete"}
- Environment signal: ${hasEnv ? "present" : "missing or weak"}
- Log signal: ${hasLogs ? "present" : "missing or weak"}

## Ambiguity Flags
${ambiguityFlags.join("\n")}

## Preview Checklist
${checklist.slice(0, 3).join("\n")}

## Notes
- This preview is intentionally abbreviated.
- The paid product includes the full fixed-format packet and export flow.
`;
}

generateBtn2.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const repoUrl = repoUrlInput2.value.trim();

  if (!title || !body) {
    output2.textContent = "Provide an issue title and issue body.";
    return;
  }

  output2.textContent = makePreview(title, repoUrl, body);
});

downloadBtn2.addEventListener("click", () => {
  window.open(BUY_URL, "_blank", "noopener");
});
