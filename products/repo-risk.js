const repoUrlInput = document.getElementById("repoUrl");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const output = document.getElementById("output");

const BUY_URL = "https://buy.polar.sh/polar_cl_ygmgGCzRGUflehPPW9HEx9YjfYwYRLTvaAiB81gWYN2";

function parseRepoUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parsed.hostname !== "github.com" || parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

function hasAny(paths, fragments) {
  return paths.some((path) => fragments.some((fragment) => path.includes(fragment)));
}

function countMatches(paths, fragments) {
  return paths.filter((path) => fragments.some((fragment) => path.includes(fragment))).length;
}

function makeChecklist(signals) {
  const items = [];
  if (!signals.hasTests) items.push("- Add or strengthen test coverage around high-change logic.");
  if (!signals.hasCi) items.push("- Add CI validation before merge and release.");
  if (!signals.hasSecurityDocs) items.push("- Publish SECURITY.md and disclosure guidance.");
  if (signals.sensitivePathCount > 0) items.push("- Review auth, payment, wallet, bridge, admin, and proof paths first.");
  if (signals.languageCount > 3) items.push("- Split high-risk review by language/runtime boundary.");
  if (!signals.hasReadme) items.push("- Add top-level README and operational setup notes.");
  if (!items.length) items.push("- Baseline hygiene signals look healthy; review sensitive logic and dependency freshness next.");
  return items.join("\n");
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function buildPreview(owner, repo) {
  const repoMeta = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
  const languages = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/languages`);
  const tree = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoMeta.default_branch}?recursive=1`);
  const paths = (tree.tree || []).map((entry) => entry.path.toLowerCase());
  const rootPaths = paths.filter((path) => !path.includes("/"));
  const languageNames = Object.keys(languages);

  const signals = {
    hasTests: hasAny(paths, ["/test", "/tests", "__tests__", ".spec.", ".test.", "test/"]),
    hasCi: hasAny(paths, [".github/workflows", ".gitlab-ci", "circleci", "azure-pipelines"]),
    hasReadme: hasAny(rootPaths, ["readme"]),
    hasSecurityDocs: hasAny(paths, ["security.md", "security.txt"]),
    hasLockfile: hasAny(paths, ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "cargo.lock", "poetry.lock", "requirements.txt"]),
    hasDocker: hasAny(paths, ["dockerfile", "docker-compose"]),
    sensitivePathCount: countMatches(paths, ["auth", "wallet", "payment", "bridge", "proof", "admin", "signer", "crypto"]),
    languageCount: languageNames.length,
    fileCount: paths.length,
  };

  const languageLine = languageNames.length ? languageNames.join(", ") : "unknown";
  const riskBand =
    signals.sensitivePathCount >= 10 || signals.fileCount > 1500
      ? "elevated"
      : signals.sensitivePathCount >= 4 || signals.fileCount > 400
        ? "moderate"
        : "baseline";

  const previewChecklist = makeChecklist(signals)
    .split("\n")
    .slice(0, 2)
    .join("\n");

  return `# Automated Repo Risk Preview

## Input
- Repository: https://github.com/${owner}/${repo}
- Generated at: ${new Date().toISOString()}

## Repository Signals
- Default branch: ${repoMeta.default_branch}
- Stars: ${repoMeta.stargazers_count}
- Open issues: ${repoMeta.open_issues_count}
- Languages: ${languageLine}
- Files scanned via public tree: ${signals.fileCount}
- Sensitive path hits: ${signals.sensitivePathCount}

## Fixed Heuristic Assessment
- Overall first-pass risk band: ${riskBand}
- Test coverage signal: ${signals.hasTests ? "present" : "not clearly present"}
- CI signal: ${signals.hasCi ? "present" : "not clearly present"}
- Security disclosure signal: ${signals.hasSecurityDocs ? "present" : "not clearly present"}
- Dependency lockfile signal: ${signals.hasLockfile ? "present" : "not clearly present"}
- Containerization signal: ${signals.hasDocker ? "present" : "not clearly present"}

## Preview Next Steps
${previewChecklist}

## Notes
- This preview is intentionally abbreviated.
- The paid product includes the fixed-format markdown report and export flow.
`;
}

generateBtn.addEventListener("click", async () => {
  const parsed = parseRepoUrl(repoUrlInput.value.trim());
  if (!parsed) {
    output.textContent = "Enter a valid public GitHub repo URL.";
    return;
  }

  output.textContent = "Generating preview...";

  try {
    output.textContent = await buildPreview(parsed.owner, parsed.repo);
  } catch (error) {
    output.textContent = `Failed to generate preview.\n\n${error.message}`;
  }
});

downloadBtn.addEventListener("click", () => {
  window.open(BUY_URL, "_blank", "noopener");
});
