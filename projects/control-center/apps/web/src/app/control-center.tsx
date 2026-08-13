"use client";

import { useMemo, useState } from "react";

import { ACTIONS, actionById } from "../lib/actions";
import {
  AGENTS,
  DOCTOR_CHECKS,
  GATES,
  KNOWLEDGE,
  NEXT_ACTIONS,
  PACKAGES,
  PROJECTS,
  RISK_COPY,
  SAFETY_LABEL,
  STATUS_LABEL,
  TASK_STATES,
  UNUSED_PACKS,
} from "../lib/catalog";
import {
  type ControlAction,
  type LiveFeature,
  type LiveSnapshot,
  NAV,
  type NavId,
  type SafetyClass,
  SITE,
} from "../lib/control-center";

const LIVE_STATUS_LABEL: Record<string, string> = {
  connected: "Connected",
  "partially-connected": "Partially connected",
  "not-yet-connected": "Not yet connected",
  "requires-configuration": "Requires configuration",
  "requires-human-action": "Requires human action",
  error: "Error",
};

/** Attention first: an operator should not have to hunt for what is wrong. */
const LIVE_STATUS_ORDER = [
  "error",
  "requires-human-action",
  "requires-configuration",
  "partially-connected",
  "not-yet-connected",
  "connected",
];

/**
 * Machine identities that commit to this repository. Matching on the author
 * name is a heuristic, not an authority — a human can set any name — so the
 * count is presented as an observation about names, never as a security claim.
 */
const AGENT_AUTHORS = /codex|claude|cursor|droid|agent|bot/i;

function liveStatusClass(status: string) {
  if (status === "error") return "status status--fail";
  if (status === "connected") return "status status--pass";
  return "status status--warn";
}

function byAttention(a: LiveFeature, b: LiveFeature) {
  const delta =
    LIVE_STATUS_ORDER.indexOf(a.status) - LIVE_STATUS_ORDER.indexOf(b.status);
  return delta !== 0 ? delta : a.name.localeCompare(b.name, "id");
}

const HOME_ACTION_IDS = [
  "doctor",
  "status",
  "setup",
  "dev",
  "test",
  "deploy-production",
] as const;

function statusClass(safety: SafetyClass) {
  if (safety === "destructive") return "status status--fail";
  if (safety === "approval") return "status status--warn";
  if (safety === "caution") return "status status--warn";
  return "status status--pass";
}

function SentraMark() {
  return (
    <svg className="mark" viewBox="0 0 1000 1000" aria-hidden="true">
      <g transform="translate(106.54 60.00) scale(1.08241) translate(-270 -227)">
        <path
          className="mk-accent"
          d="M890.70 227.38 L766.99 226.87 L262.40 626.09 L386.11 626.60 Z"
        />
        <path
          className="mk-body"
          d="M262.23 869.92 L754.48 480.46 L753.02 478.60 A146.02 146.02 0 0 1 934.22 707.63 L932.76 705.78 L509.10 1040.97 L385.39 1040.45 L884.88 645.26 L880.54 639.78 A59.50 59.50 0 0 0 806.71 546.46 L802.36 540.97 L385.94 870.44 Z"
        />
      </g>
    </svg>
  );
}

function ActionPanel({
  action,
  onOpen,
  selected,
}: {
  action: ControlAction;
  onOpen: (id: string) => void;
  selected: boolean;
}) {
  return (
    <article className={selected ? "panel panel--active" : "panel"}>
      <div className="panel__body">
        <p className="t-label">
          {action.risk} · {SAFETY_LABEL[action.safety]}
        </p>
        <h3>{action.name}</h3>
        <p className="t-compact muted">{action.purpose}</p>
        <p>
          <span className={statusClass(action.safety)}>
            {STATUS_LABEL[action.status]}
          </span>
        </p>
        <div className="actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled
            aria-disabled="true"
          >
            Run here
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => onOpen(action.id)}
          >
            {selected ? "Hide explanation" : "Review decision"}
          </button>
        </div>
        {selected ? <ActionDisclosure action={action} /> : null}
      </div>
    </article>
  );
}

function ActionDisclosure({ action }: { action: ControlAction }) {
  return (
    <div className="stack">
      <div className="notice">
        <strong>What this is.</strong> {action.purpose}
        <br />
        <strong>Why it is used.</strong> {action.why}
        <br />
        <strong>Is it safe?</strong> {action.approval} Effect: {action.effect}
        <br />
        <strong>If it were run.</strong> {action.expected}
        <br />
        <strong>Result here.</strong> Not executed.{" "}
        {STATUS_LABEL[action.status]}.
        <br />
        <strong>Next.</strong> {action.next}
      </div>
      <details className="disclosure">
        <summary>Details</summary>
        <dl className="factlist">
          <div>
            <dt>Risk</dt>
            <dd>{action.risk}</dd>
          </div>
          <div>
            <dt>Safety class</dt>
            <dd>{SAFETY_LABEL[action.safety]}</dd>
          </div>
          <div>
            <dt>Mutation</dt>
            <dd>{action.mutation ? "Changes state" : "Read only"}</dd>
          </div>
          <div>
            <dt>Time limit</dt>
            <dd>{action.timeout}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{action.source}</dd>
          </div>
        </dl>
        <p className="t-compact muted">{action.confirmation}</p>
      </details>
      <details className="disclosure">
        <summary>Advanced</summary>
        <pre>{action.command}</pre>
      </details>
    </div>
  );
}

function HomeSection({
  selectedAction,
  onOpen,
  live,
}: {
  selectedAction: string | null;
  onOpen: (id: string) => void;
  live: LiveSnapshot;
}) {
  const actions = HOME_ACTION_IDS.map((id) => actionById(id)).filter(
    (action): action is ControlAction => Boolean(action),
  );

  const attention = live.features
    .filter((feature) => feature.status !== "connected")
    .sort(byAttention);

  return (
    <>
      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Command Center</p>
          <h1 className="t-display">{SITE.title}</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            {SITE.promise}
          </p>
        </div>
        <div className="pagehead__verdict">
          <div className="verdict">
            <p className="t-label">Current declaration</p>
            <p className="verdict__word">{SITE.declaration}</p>
            <p
              className="t-compact muted"
              style={{ marginTop: "var(--space-3)" }}
            >
              Controlled, Secure, and Regulated are not claimed. The main branch
              is not yet proven to be protected.
            </p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="alert">
          <h2>Board limits</h2>
          <p>{SITE.honesty}</p>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-section">Repository, as read just now</h2>
          <span className="rulelabel">
            {live.gitAvailable
              ? `${live.branch} · ${live.head}`
              : "Git unavailable"}
          </span>
        </div>
        <div className="grid">
          <div className="span-7">
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">Read from disk and git</p>
                <dl className="factlist">
                  <div>
                    <dt>Working tree</dt>
                    <dd>{live.dirtyPaths} changed paths</dd>
                  </div>
                  <div>
                    <dt>Checkout</dt>
                    <dd>{live.repoRoot}</dd>
                  </div>
                  <div>
                    <dt>Features registered</dt>
                    <dd>{live.features.length}</dd>
                  </div>
                  <div>
                    <dt>Need attention</dt>
                    <dd>{attention.length}</dd>
                  </div>
                  <div>
                    <dt>Unmerged branches</dt>
                    <dd>{live.unmergedBranches.length}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
          <div className="span-4">
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">Not on main</p>
                <p className="t-data">{live.unmergedBranches.length}</p>
                <p className="t-compact muted">
                  {live.unmergedBranches.length === 0
                    ? "Everything local is on main."
                    : live.unmergedBranches
                        .map((item) => `${item.name} (${item.commitsAhead})`)
                        .join(", ")}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {attention.length > 0 ? (
        <section className="section">
          <div className="section__head">
            <h2 className="t-section">What needs attention</h2>
            <span className="rulelabel">
              Derived from evidence, not hand-authored
            </span>
          </div>
          <div className="stack">
            {attention.map((feature) => (
              <article className="panel" key={feature.id}>
                <div className="panel__body">
                  <p className="t-label">
                    {feature.risk} · {feature.area}
                  </p>
                  <h3>{feature.name}</h3>
                  <p className="t-compact muted">{feature.purpose}</p>
                  <p>
                    <span className={liveStatusClass(feature.status)}>
                      {LIVE_STATUS_LABEL[feature.status] ?? feature.status}
                    </span>
                  </p>
                  <p className="t-compact">{feature.statusReason}</p>
                  {feature.caveat ? (
                    <p className="t-compact muted">{feature.caveat}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {live.problems.length > 0 ? (
        <section className="section">
          <div className="alert">
            <h2>Problems while reading the repository</h2>
            <ul>
              {live.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section__head">
          <h2 className="t-section">Next steps</h2>
          <span className="rulelabel">
            From recorded evidence, not guesswork
          </span>
        </div>
        <div className="grid">
          <div className="span-7 stack">
            {NEXT_ACTIONS.map((item) => {
              const action = actionById(item.actionId);
              return (
                <article className="panel" key={item.id}>
                  <div className="panel__body">
                    <p className="t-label">{action?.risk ?? "R0"}</p>
                    <h3>{item.title}</h3>
                    <p className="t-compact muted">{item.reason}</p>
                    {action ? (
                      <div className="actions">
                        <button
                          type="button"
                          className="btn"
                          onClick={() => onOpen(action.id)}
                        >
                          Review {action.name}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="span-4">
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">What is visible now</p>
                <dl className="factlist">
                  <div>
                    <dt>Active product</dt>
                    <dd>Golden Path</dd>
                  </div>
                  <div>
                    <dt>Running services</dt>
                    <dd>{STATUS_LABEL.unknown}</dd>
                  </div>
                  <div>
                    <dt>Pending approvals</dt>
                    <dd>{STATUS_LABEL.unknown}</dd>
                  </div>
                  <div>
                    <dt>Active tasks</dt>
                    <dd>{STATUS_LABEL.unknown}</dd>
                  </div>
                  <div>
                    <dt>Production deploy</dt>
                    <dd>Blocked</dd>
                  </div>
                </dl>
              </div>
            </article>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-section">Actions that are safe to understand</h2>
          <span className="rulelabel">Not executed here</span>
        </div>
        <div className="grid">
          {actions.map((action) => (
            <div className="span-7" key={action.id}>
              <ActionPanel
                action={action}
                onOpen={onOpen}
                selected={selectedAction === action.id}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ProjectsSection({
  selectedAction,
  onOpen,
  live,
}: {
  selectedAction: string | null;
  onOpen: (id: string) => void;
  live: LiveSnapshot;
}) {
  const projectActions = ACTIONS.filter((action) =>
    ["dev", "test", "capability-preview", "capability-apply"].includes(
      action.id,
    ),
  );

  const workspace = live.workspace;
  const byReach = [...workspace.members].sort(
    (a, b) => b.blastRadius.length - a.blastRadius.length,
  );

  return (
    <>
      <section className="section">
        <div className="section__head">
          <h2 className="t-section">Repository map</h2>
          <span className="rulelabel">
            Read from pnpm-workspace.yaml and every package.json
          </span>
        </div>

        <div className="grid">
          <div className="span-7">
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">Workspace members</p>
                <dl className="factlist">
                  {workspace.groups.map((group) => (
                    <div key={group.group}>
                      <dt>{group.group}</dt>
                      <dd>{group.count}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>Total</dt>
                    <dd>{workspace.members.length}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </div>
          <div className="span-4">
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">Widest reach</p>
                <p className="t-data">
                  {byReach[0] ? byReach[0].blastRadius.length : 0}
                </p>
                <p className="t-compact muted">
                  {byReach[0]
                    ? `${byReach[0].name} moves ${byReach[0].blastRadius.length} other members`
                    : "No workspace dependency recorded."}
                </p>
              </div>
            </article>
          </div>
        </div>

        {workspace.problems.length > 0 ? (
          <div className="notice">
            {workspace.problems.map((problem) => (
              <p key={problem}>{problem}</p>
            ))}
          </div>
        ) : null}
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-section">Blast radius</h2>
          <span className="rulelabel">What moves when one member changes</span>
        </div>
        <p className="t-compact muted">
          The question only a monorepo has. Change a member here and everything
          in its reach column is affected — that is the number to know before
          approving a change to a shared package.
        </p>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Location</th>
                <th>Reach</th>
                <th>Affected</th>
                <th>Depends on</th>
              </tr>
            </thead>
            <tbody>
              {byReach.map((member) => (
                <tr key={member.name}>
                  <td>{member.name}</td>
                  <td>{member.path}</td>
                  <td>{member.blastRadius.length}</td>
                  <td>
                    {member.blastRadius.length === 0
                      ? "Nothing depends on it"
                      : member.blastRadius.join(", ")}
                  </td>
                  <td>
                    {member.dependsOn.length === 0
                      ? "No workspace dependency"
                      : member.dependsOn.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Projects</p>
          <h1 className="t-page">One product capsule, one template</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            Only Golden Path is a real product. The capsule template is
            governance scaffolding, not a second application.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="grid">
          {PROJECTS.map((project) => (
            <article className="span-7 panel" key={project.id}>
              <div className="panel__body">
                <p className="t-label">{project.kind}</p>
                <h2>{project.name}</h2>
                <p>{project.purpose}</p>
                <p className="t-compact muted">{project.boundary}</p>
                <dl className="factlist">
                  <div>
                    <dt>Recorded state</dt>
                    <dd>{project.state}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{project.owner}</dd>
                  </div>
                </dl>
                {project.capabilities.length ? (
                  <ul className="stack">
                    {project.capabilities.map((item) => (
                      <li className="t-compact" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="t-compact muted">{project.notes}</p>
                {project.commands.length ? (
                  <details className="disclosure">
                    <summary>Advanced</summary>
                    <pre>{project.commands.join("\n")}</pre>
                  </details>
                ) : null}
              </div>
            </article>
          ))}
          <aside className="span-4 stack">
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">Shared packages</p>
                <ul className="stack">
                  {PACKAGES.map((item) => (
                    <li key={item.id}>
                      <strong>{item.name}</strong>
                      <p className="t-compact muted">{item.purpose}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">Optional unused packages</p>
                <p className="t-compact muted">
                  {UNUSED_PACKS.join(", ")}. Recorded as reserves, not live
                  capability.
                </p>
              </div>
            </article>
          </aside>
        </div>
      </section>
      <section className="section">
        <div className="section__head">
          <h2 className="t-section">Project actions</h2>
          <span className="rulelabel">Allowlist only</span>
        </div>
        <div className="stack">
          {projectActions.map((action) => (
            <ActionPanel
              key={action.id}
              action={action}
              onOpen={onOpen}
              selected={selectedAction === action.id}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function AgentsSection() {
  return (
    <>
      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Agents</p>
          <h1 className="t-page">Capability is not authority</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            Human roles and automation identities are kept separate. No agent
            may deploy production from this board.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>May</th>
                <th>May not</th>
                <th>Limit</th>
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((agent) => (
                <tr key={agent.id}>
                  <td>
                    <strong>{agent.name}</strong>
                    <p className="t-compact muted">{agent.purpose}</p>
                  </td>
                  <td>{agent.kind === "role" ? "Role" : "Automation"}</td>
                  <td>{agent.may}</td>
                  <td>{agent.mayNot}</td>
                  <td>{agent.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function TasksSection({
  selectedAction,
  onOpen,
}: {
  selectedAction: string | null;
  onOpen: (id: string) => void;
}) {
  const taskActions = ACTIONS.filter((action) =>
    [
      "doctor",
      "setup",
      "dev",
      "test",
      "check",
      "governance",
      "db-start",
      "db-stop",
      "db-migrate",
      "db-seed",
      "db-reset",
      "db-studio",
      "task-list",
      "task-claim",
      "task-state",
      "task-close",
      "deploy-production",
    ].includes(action.id),
  );

  return (
    <>
      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Tasks and flows</p>
          <h1 className="t-page">Only operations that are already allowed</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            Every button refers to a known action identity. Free-form commands
            from the browser are not accepted.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="section__head">
          <h2 className="t-section">Task status</h2>
          <span className="rulelabel">No live trail here</span>
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Meaning</th>
                <th>Mutation</th>
              </tr>
            </thead>
            <tbody>
              {TASK_STATES.map((state) => (
                <tr key={state.id}>
                  <td className="t-data">{state.id}</td>
                  <td>{state.meaning}</td>
                  <td>
                    {state.mutation ? "Actively changing" : "Does not change"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section stack">
        {taskActions.map((action) => (
          <ActionPanel
            key={action.id}
            action={action}
            onOpen={onOpen}
            selected={selectedAction === action.id}
          />
        ))}
      </section>
    </>
  );
}

function HealthSection({
  selectedAction,
  onOpen,
  live,
}: {
  selectedAction: string | null;
  onOpen: (id: string) => void;
  live: LiveSnapshot;
}) {
  const healthActions = ACTIONS.filter((action) =>
    ["doctor", "setup", "db-start", "db-reset"].includes(action.id),
  );

  const health = live.health;
  const ready = health.checks.filter((check) => check.ok);
  const blocked = health.checks.filter((check) => !check.ok);
  const unsafe = blocked.filter((check) => check.severity === "unsafe");

  return (
    <>
      {health.available && health.problem === null ? (
        <>
          <section className="section">
            <div className="section__head">
              <h2 className="t-section">Machine readiness, checked just now</h2>
              <span className="rulelabel">
                Run by tools/doctor, not re-implemented here
              </span>
            </div>

            <div className="grid">
              <div className="span-7">
                <article className="panel">
                  <div className="panel__body">
                    <p className="t-label">Checked by tools/doctor</p>
                    <dl className="factlist">
                      <div>
                        <dt>Verdict</dt>
                        <dd>{health.ok ? "Ready" : "Not ready"}</dd>
                      </div>
                      <div>
                        <dt>Checks passed</dt>
                        <dd>
                          {ready.length} of {health.checks.length}
                        </dd>
                      </div>
                      <div>
                        <dt>Blocked</dt>
                        <dd>{blocked.length}</dd>
                      </div>
                      <div>
                        <dt>Rejected as unsafe</dt>
                        <dd>{unsafe.length}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </div>
              <div className="span-4">
                <article className="panel">
                  <div className="panel__body">
                    <p className="t-label">Verdict</p>
                    <p
                      className={
                        health.ok
                          ? "status status--pass"
                          : "status status--warn"
                      }
                    >
                      {health.ok ? "Ready" : "Not ready"}
                    </p>
                    <p className="t-compact muted">
                      {health.ok
                        ? "Semua prasyarat lokal terpenuhi."
                        : `${blocked.length} dari ${health.checks.length} pemeriksaan belum siap.`}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {blocked.length > 0 ? (
            <section className="section">
              <div className="section__head">
                <h2 className="t-section">What is blocking you</h2>
                <span className="rulelabel">
                  Each one carries its own recovery step
                </span>
              </div>
              <div className="stack">
                {blocked.map((check) => (
                  <article className="panel" key={check.id}>
                    <div className="panel__body">
                      <p className="t-label">{check.area}</p>
                      <h3>{check.summary}</h3>
                      <p>
                        <span
                          className={
                            check.severity === "unsafe"
                              ? "status status--fail"
                              : "status status--warn"
                          }
                        >
                          {check.severity === "unsafe"
                            ? "Ditolak — tidak aman"
                            : "Belum siap"}
                        </span>
                      </p>
                      <p className="t-compact">{check.recovery}</p>
                      {check.technical ? (
                        <details className="disclosure">
                          <summary>Advanced</summary>
                          <pre>{check.technical}</pre>
                        </details>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="section">
            <div className="section__head">
              <h2 className="t-section">Checks that passed</h2>
              <span className="rulelabel">{ready.length} ready</span>
            </div>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {ready.map((check) => (
                    <tr key={check.id}>
                      <td>{check.area}</td>
                      <td>{check.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="section">
          <div className="alert">
            <h2>Kesiapan mesin tidak terbaca</h2>
            <p>
              {health.problem ??
                "Pemeriksaan kesiapan tidak dapat dijalankan pada checkout ini."}
            </p>
          </div>
        </section>
      )}

      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Health</p>
          <h1 className="t-page">Problem, meaning, then recovery</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            These checks exist in the repository. Their results are not visible
            from this board until they are run on the local machine.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Check</th>
                <th>If ready</th>
                <th>If not</th>
                <th>Recovery</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DOCTOR_CHECKS.map((check) => (
                <tr key={check.id}>
                  <td>
                    <strong>{check.label}</strong>
                    <p className="t-compact muted">{check.meaning}</p>
                  </td>
                  <td>{check.ready}</td>
                  <td>{check.blocked}</td>
                  <td>{check.recovery}</td>
                  <td>
                    <span className="status status--idle">
                      {STATUS_LABEL.unknown}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section stack">
        {healthActions.map((action) => (
          <ActionPanel
            key={action.id}
            action={action}
            onOpen={onOpen}
            selected={selectedAction === action.id}
          />
        ))}
      </section>
    </>
  );
}

function ActivitySection({ live }: { live: LiveSnapshot }) {
  const activity = live.activity;
  const agentCommits = activity.contributors
    .filter((contributor) => AGENT_AUTHORS.test(contributor.name))
    .reduce((total, contributor) => total + contributor.commits, 0);

  return (
    <>
      {activity.available ? (
        <>
          <section className="section">
            <div className="section__head">
              <h2 className="t-section">Change flow</h2>
              <span className="rulelabel">Last 30 days on {live.branch}</span>
            </div>

            <div className="grid">
              <div className="span-7">
                <article className="panel">
                  <div className="panel__body">
                    <p className="t-label">Last 30 days</p>
                    <dl className="factlist">
                      <div>
                        <dt>Commits landed</dt>
                        <dd>{activity.lastMonth}</dd>
                      </div>
                      <div>
                        <dt>Written by agents</dt>
                        <dd>{agentCommits}</dd>
                      </div>
                      <div>
                        <dt>Written by people</dt>
                        <dd>{activity.lastMonth - agentCommits}</dd>
                      </div>
                      <div>
                        <dt>Branches not on main</dt>
                        <dd>{live.unmergedBranches.length}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              </div>
              <div className="span-4">
                <article className="panel">
                  <div className="panel__body">
                    <p className="t-label">Written by agents</p>
                    <p className="t-data">{agentCommits}</p>
                    <p className="t-compact muted">
                      of {activity.lastMonth} commits, by machine identities
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section__head">
              <h2 className="t-section">Recent commits</h2>
              <span className="rulelabel">Read from git, newest first</span>
            </div>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Commit</th>
                    <th>Subject</th>
                    <th>Author</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.recent.map((commit) => (
                    <tr key={commit.hash}>
                      <td>{commit.relative}</td>
                      <td>{commit.hash}</td>
                      <td>
                        {commit.subject}
                        {commit.isMerge ? " (merge)" : ""}
                      </td>
                      <td>{commit.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <div className="section__head">
              <h2 className="t-section">Who and where</h2>
              <span className="rulelabel">
                Contributors and the files they moved
              </span>
            </div>
            <div className="grid">
              <div className="span-4">
                <article className="panel">
                  <div className="panel__body">
                    <p className="t-label">Contributors</p>
                    <dl className="factlist">
                      {activity.contributors.map((contributor) => (
                        <div key={contributor.name}>
                          <dt>{contributor.name}</dt>
                          <dd>{contributor.commits}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              </div>
              <div className="span-7">
                <article className="panel">
                  <div className="panel__body">
                    <p className="t-label">Busiest files</p>
                    <dl className="factlist">
                      {activity.hotPaths.map((entry) => (
                        <div key={entry.path}>
                          <dt>{entry.path}</dt>
                          <dd>{entry.changes}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {live.unmergedBranches.length > 0 ? (
            <section className="section">
              <div className="section__head">
                <h2 className="t-section">Work not yet on main</h2>
                <span className="rulelabel">
                  Each one is a decision waiting
                </span>
              </div>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th>Commits ahead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {live.unmergedBranches.map((branch) => (
                      <tr key={branch.name}>
                        <td>{branch.name}</td>
                        <td>{branch.commitsAhead}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <section className="section">
          <div className="alert">
            <h2>Git tidak terbaca</h2>
            <p>
              Riwayat perubahan tidak dapat ditampilkan karena git tidak dapat
              dijalankan pada checkout ini.
            </p>
          </div>
        </section>
      )}

      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Activity</p>
          <h1 className="t-page">No invented trail</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            This board cannot see the task registry, logs, or publication gates
            that are currently running. Empty here means not observed, not
            healthy.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="grid">
          <article className="span-7 panel">
            <div className="panel__body">
              <p className="t-label">Task trail</p>
              <h2>No activity observed</h2>
              <p className="muted">
                To see real work, run List Tasks or Review Governance Status on
                the local machine.
              </p>
              <p>
                <span className="status status--idle">
                  {STATUS_LABEL.unknown}
                </span>
              </p>
            </div>
          </article>
          <aside className="span-4">
            <article className="panel">
              <div className="panel__body">
                <p className="t-label">Eight publication gates</p>
                <div className="gates" aria-hidden="true">
                  {GATES.map((gate) => (
                    <i key={gate.id} title={gate.name} />
                  ))}
                </div>
                <ul className="stack" style={{ marginTop: "var(--space-4)" }}>
                  {GATES.map((gate) => (
                    <li key={gate.id}>
                      <strong>{gate.name}</strong>
                      <p className="t-compact muted">{gate.purpose}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </>
  );
}

function GovernanceSection() {
  return (
    <>
      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Governance</p>
          <h1 className="t-page">Authority stays visible</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            Humans govern, agents execute, and machines enforce. This board
            explains that boundary. It does not weaken it.
          </p>
        </div>
        <div className="pagehead__verdict">
          <div className="verdict">
            <p className="t-label">Operating model</p>
            <p className="verdict__word">SAFRS Core</p>
            <p
              className="t-compact muted"
              style={{ marginTop: "var(--space-3)" }}
            >
              {SITE.operatingModel}
            </p>
          </div>
        </div>
      </header>
      <section className="section">
        <div className="grid">
          {Object.entries(RISK_COPY).map(([tier, copy]) => (
            <article className="span-7 panel" key={tier}>
              <div className="panel__body">
                <p className="t-label">{tier}</p>
                <h2>{copy.title}</h2>
                <p>{copy.meaning}</p>
                <p className="t-compact muted">{copy.mutation}</p>
                <p className="t-compact">{copy.approval}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="alert">
          <h2>Pending approvals</h2>
          <p>
            Not observed here. R2 approval is bound to exact content. R3
            authorization is accepted only from an authorized human for the
            exact operation proposed.
          </p>
        </div>
      </section>
    </>
  );
}

function KnowledgeSection() {
  return (
    <>
      <header className="pagehead grid">
        <div className="pagehead__id">
          <p className="t-label">Knowledge</p>
          <h1 className="t-page">Official documents first</h1>
          <p
            className="muted"
            style={{ marginTop: "var(--space-4)", maxWidth: "56ch" }}
          >
            If a summary and the specification conflict, the specification wins.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Recorded location</th>
              </tr>
            </thead>
            <tbody>
              {KNOWLEDGE.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>{item.kind}</td>
                  <td>{item.purpose}</td>
                  <td className="t-data">{item.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export function ControlCenter({ live }: { live: LiveSnapshot }) {
  const [section, setSection] = useState<NavId>("home");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const current = useMemo(
    () => NAV.find((item) => item.id === section) ?? NAV[0],
    [section],
  );

  function openAction(id: string) {
    setSelectedAction((currentId) => (currentId === id ? null : id));
  }

  return (
    <div>
      <header className="chrome">
        <span className="tile" aria-hidden="true">
          <SentraMark />
        </span>
        <span className="wordmark">SENTRA</span>
        <span className="chrome__sep" />
        <p className="chrome__path">
          Monorepo-safrs / <b>{current.label}</b>
        </p>
        <p className="chrome__right t-label">{SITE.operatingModel}</p>
      </header>

      {/* A <nav> rather than a <div>: aria-label needs a landmark role to
          attach to, and this genuinely is navigation. */}
      <nav className="mobile-nav" aria-label="Sections">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={item.id === section ? "page" : undefined}
            onClick={() => setSection(item.id)}
          >
            {item.seq} {item.label}
          </button>
        ))}
      </nav>

      <div className="shell">
        <aside className="rail">
          <div className="rail__mark">
            <p className="wordmark">CONTROL</p>
            <p className="t-compact muted">{SITE.product}</p>
          </div>
          <nav aria-label="Primary navigation">
            <p className="rail__group t-label">Sections</p>
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={item.id === section ? "page" : undefined}
                onClick={() => setSection(item.id)}
              >
                <span className="seq">{item.seq}</span>
                <span>
                  {item.label}
                  <span className="sr-only">. {item.hint}</span>
                </span>
              </button>
            ))}
          </nav>
          <div className="rail__foot">
            <p className="t-compact muted">{SITE.observedAt}</p>
          </div>
        </aside>

        <main className="stage">
          <div className="wrap">
            {section === "home" ? (
              <HomeSection
                selectedAction={selectedAction}
                onOpen={openAction}
                live={live}
              />
            ) : null}
            {section === "projects" ? (
              <ProjectsSection
                selectedAction={selectedAction}
                onOpen={openAction}
                live={live}
              />
            ) : null}
            {section === "agents" ? <AgentsSection /> : null}
            {section === "tasks" ? (
              <TasksSection
                selectedAction={selectedAction}
                onOpen={openAction}
              />
            ) : null}
            {section === "health" ? (
              <HealthSection
                selectedAction={selectedAction}
                onOpen={openAction}
                live={live}
              />
            ) : null}
            {section === "activity" ? <ActivitySection live={live} /> : null}
            {section === "governance" ? <GovernanceSection /> : null}
            {section === "knowledge" ? <KnowledgeSection /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
