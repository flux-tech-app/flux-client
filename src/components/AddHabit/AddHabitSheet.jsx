// src/components/AddHabit/AddHabitSheet.jsx
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import useHabits from "@/hooks/useHabits";
import HabitIcon from "@/utils/HabitIcons";
import Button from "@/components/Button";

import {
  computeEarningsMicrosUI,
  dollarsToMicros,
  formatUSDFromMicros,
  isBinaryRateType,
  unitsToMicros,
} from "@/utils/micros";

/**
 * AddHabitSheet (new unified flow)
 *
 * - Type habit name → show catalog suggestions
 * - Selecting a suggestion pre-fills defaults
 * - User can "Customize" to unlock tracking/unit edits (custom habit)
 * - Create:
 *    - Catalog habit -> addHabit({ catalogId, rateMicros, goal })
 *    - Custom habit  -> createCustomHabit(payload)
 *
 * NEW:
 * - Allow enabling/disabling payout rate (rateEnabled).
 *   - When disabled => rateMicros = 0 (and rateEnabled=false for custom payload)
 *
 * Props:
 * - onClose(): close bottom sheet (Cancel / X)
 * - onComplete(): called after successful create (parent closes & refreshes)
 */
export default function AddHabitSheet({ onClose, onComplete }) {
  const { catalogHabits, isHabitAdded, addHabit, createCustomHabit } = useHabits();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // steps: 0 name, 1 tracking, 2 unit (optional), 3 goal+rate
  const [step, setStep] = useState(0);

  // template = selected catalog habit (optional)
  const [template, setTemplate] = useState(null);

  // if template is selected, default mode is "catalog"
  // user can click "Customize" which flips to custom mode while keeping prefilled values
  const [mode, setMode] = useState("custom"); // "catalog" | "custom"

  // form state
  const [name, setName] = useState("");
  const [tracking, setTracking] = useState("binary"); // "binary" | "volume"
  const [unit, setUnit] = useState("");
  const [goalAmount, setGoalAmount] = useState("1");
  const [goalPeriod, setGoalPeriod] = useState("week");
  const [rateUSD, setRateUSD] = useState("1.00");

  // NEW: payout toggle
  const [rateEnabled, setRateEnabled] = useState(true);

  const steps = useMemo(() => {
    const isVolume = tracking === "volume";
    return isVolume ? ["name", "tracking", "unit", "goalRate"] : ["name", "tracking", "goalRate"];
  }, [tracking]);

  const maxStep = steps.length - 1;

  const rateType = tracking === "volume" ? "COUNT" : "BINARY";
  const binary = isBinaryRateType(rateType);

  const nameTrimmed = String(name || "").trim();
  const unitTrimmed = String(unit || "").trim();

  const unitPlural = useMemo(() => {
    if (tracking !== "volume") return "";
    if (!unitTrimmed) return "";
    if (unitTrimmed.toLowerCase().endsWith("s")) return unitTrimmed;
    return `${unitTrimmed}s`;
  }, [tracking, unitTrimmed]);

  const goalUnitLabel = useMemo(() => {
    if (tracking !== "volume") return "times";
    return unitPlural || "units";
  }, [tracking, unitPlural]);

  const parsedRateMicros = useMemo(() => {
    // dollarsToMicros already handles "$" etc safely
    const m = dollarsToMicros(rateUSD);
    return Number(m || 0);
  }, [rateUSD]);

  // NEW: effective rate depends on toggle
  const effectiveRateMicros = useMemo(() => {
    return rateEnabled ? parsedRateMicros : 0;
  }, [rateEnabled, parsedRateMicros]);

  const parsedGoalAmount = useMemo(() => {
    const n = Number.parseFloat(goalAmount);
    return Number.isFinite(n) ? n : NaN;
  }, [goalAmount]);

  const canAdvance = useMemo(() => {
    const cur = steps[step];

    if (cur === "name") return nameTrimmed.length >= 2;
    if (cur === "tracking") return tracking === "binary" || tracking === "volume";
    if (cur === "unit") return tracking !== "volume" || unitTrimmed.length >= 1;

    // goalRate
    if (!Number.isFinite(parsedGoalAmount) || parsedGoalAmount <= 0) return false;
    if (!goalPeriod) return false;

    // only require a valid positive rate if enabled
    if (rateEnabled) {
      if (!Number.isFinite(parsedRateMicros) || parsedRateMicros <= 0) return false;
    }

    // if catalog mode, require template + not already added
    if (mode === "catalog") {
      if (!template?.id) return false;
      if (isHabitAdded?.(String(template.id))) return false;
    }

    return true;
  }, [
    steps,
    step,
    nameTrimmed,
    tracking,
    unitTrimmed,
    parsedGoalAmount,
    goalPeriod,
    rateEnabled,
    parsedRateMicros,
    mode,
    template,
    isHabitAdded,
  ]);

  const canCreate = steps[step] === "goalRate" && canAdvance && !isSubmitting;

  // Suggestions (typeahead)
  const suggestions = useMemo(() => {
    const q = nameTrimmed.toLowerCase();
    if (!q || q.length < 1) return [];

    const list = (catalogHabits || [])
      .map((h) => ({
        ...h,
        _id: String(h?.id ?? ""),
        _name: String(h?.name ?? ""),
      }))
      .filter((h) => h._id && h._name)
      .filter((h) => h._name.toLowerCase().includes(q))
      .slice(0, 6);

    return list;
  }, [catalogHabits, nameTrimmed]);

  // When user selects a template suggestion, prefill fields from catalog
  const applyTemplate = (h) => {
    if (!h?.id) return;

    setTemplate(h);
    setMode("catalog"); // default to catalog behavior

    setName(String(h.name || ""));
    const templateRateType = String(h.rateType || "").toUpperCase();
    const isVol = templateRateType === "COUNT";
    setTracking(isVol ? "volume" : "binary");

    // unit for volume
    if (isVol) {
      const u = String(h.unit || "").trim();
      const gu = String(h.goalUnit || "").trim();
      setUnit(u || gu || "units");
    } else {
      setUnit("");
    }

    // defaults for goal
    const defPeriod = String(h.defaultGoalPeriod || "week");
    setGoalPeriod(defPeriod || "week");

    const firstSuggested = Array.isArray(h.suggestedGoals) ? h.suggestedGoals?.[0] : null;
    if (firstSuggested?.amount) setGoalAmount(String(firstSuggested.amount));
    else setGoalAmount("1");

    // defaults for rate
    const defMicros = Number(h.defaultRateMicros || 0);
    if (defMicros > 0) {
      setRateEnabled(true);
      setRateUSD((defMicros / 1_000_000).toFixed(2));
    } else {
      // if template has no default, keep enabled but with 1.00
      setRateEnabled(true);
      setRateUSD("1.00");
    }

    // keep user on name step; they hit Continue like the video
  };

  // If user edits name after selecting template, keep template,
  // but if they clearly diverge, flip to custom mode so we don’t surprise them.
  useEffect(() => {
    if (!template) return;
    const tname = String(template?.name || "").trim();
    if (!tname) return;

    // if name changed significantly, treat as custom (but keep prefilled values)
    if (nameTrimmed && nameTrimmed.toLowerCase() !== tname.toLowerCase()) {
      setMode("custom");
    }
  }, [nameTrimmed, template]);

  const goBack = () => {
    if (isSubmitting) return;

    if (step === 0) {
      onClose?.();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const goNext = () => {
    if (isSubmitting) return;
    if (!canAdvance) return;
    setStep((s) => Math.min(maxStep, s + 1));
  };

  // projections (weekly + annual)
  const projections = useMemo(() => {
    if (!rateEnabled) return null;
    if (!Number.isFinite(parsedGoalAmount) || parsedGoalAmount <= 0) return null;
    if (!Number.isFinite(parsedRateMicros) || parsedRateMicros <= 0) return null;

    const daysMap = { day: 1, week: 7, month: 30 };
    const periodDays = daysMap[String(goalPeriod)] ?? 7;

    const weeklyUnits = (parsedGoalAmount / periodDays) * 7;

    let weeklyEarnMicros = 0;
    if (binary) {
      const weeklyCompletions = Math.max(0, Math.round(weeklyUnits));
      weeklyEarnMicros = weeklyCompletions * parsedRateMicros;
    } else {
      const weeklyUnitsMicros = unitsToMicros(weeklyUnits);
      weeklyEarnMicros = computeEarningsMicrosUI({
        rateType,
        rateMicros: parsedRateMicros,
        unitsMicros: weeklyUnitsMicros,
      });
    }

    return {
      weeklyMicros: weeklyEarnMicros,
      annualMicros: weeklyEarnMicros * 52,
    };
  }, [rateEnabled, parsedGoalAmount, parsedRateMicros, goalPeriod, binary, rateType]);

  const formatAnnual = (annualMicros) => {
    const dollars = Number(annualMicros || 0) / 1_000_000;
    const rounded = Math.round(dollars);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
  };

  const handleCreate = async () => {
    if (isSubmitting) return;
    if (!canCreate) return;

    // validate
    if (nameTrimmed.length < 2) return;

    if (tracking === "volume" && !unitTrimmed) return;

    const amountRaw = Number.parseFloat(goalAmount);
    if (!Number.isFinite(amountRaw) || amountRaw <= 0) return;

    // for binary store int goal
    const finalGoalAmount = binary ? Math.max(1, Math.round(amountRaw)) : amountRaw;

    setIsSubmitting(true);
    try {
      // CATALOG path
      if (mode === "catalog" && template?.id) {
        await addHabit?.({
          catalogId: String(template.id),
          rateMicros: Number(effectiveRateMicros), // 0 if disabled
          goal: {
            amount: Number(finalGoalAmount),
            period: String(goalPeriod),
          },
        });
        onComplete?.();
        return;
      }

      // CUSTOM path
      const payload = {
        name: nameTrimmed,
        rateType, // "BINARY" | "COUNT"
        rateMicros: Number(effectiveRateMicros), // 0 if disabled
        rateEnabled: Boolean(rateEnabled),
        defaultGoalPeriod: String(goalPeriod),
        goal: { amount: Number(finalGoalAmount), period: String(goalPeriod) },
        ...(tracking === "volume"
          ? {
              unit: unitTrimmed,
              unitPlural: unitPlural || unitTrimmed,
              goalUnit: unitPlural || unitTrimmed,
            }
          : {}),
      };

      await createCustomHabit?.(payload);
      onComplete?.();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to create habit. Please try again.");
      setIsSubmitting(false);
    }
  };

  const templateLocked = Boolean(template?.id) && mode === "catalog";
  const templateAdded = template?.id ? Boolean(isHabitAdded?.(String(template.id))) : false;

  const rateOptionsMicros = useMemo(() => {
    const opts = template?.rateOptionsMicros;
    if (!Array.isArray(opts)) return [];
    return opts.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
  }, [template]);

  const renderNameStep = () => (
    <div className="ahs-step">
      <div className="ahs-sectionLabel">1. NAME YOUR HABIT</div>

      <input
        className="ahs-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Morning Run, Read, Push Ups, No Snacking"
        disabled={isSubmitting}
        autoFocus
      />

      {template?.id ? (
        <div className="ahs-templateRow">
          <div className="ahs-templatePill">
            <span className="ahs-templatePillDot" />
            Using catalog suggestion
          </div>

          {templateLocked ? (
            <button
              type="button"
              className="ahs-link"
              onClick={() => setMode("custom")}
              disabled={isSubmitting}
            >
              Customize
            </button>
          ) : (
            <button
              type="button"
              className="ahs-link"
              onClick={() => setMode("catalog")}
              disabled={isSubmitting || templateAdded}
              title={templateAdded ? "Already added" : ""}
            >
              Use catalog
            </button>
          )}
        </div>
      ) : (
        <div className="ahs-help">Start typing and we’ll suggest habits from the catalog (optional).</div>
      )}

      {suggestions.length > 0 ? (
        <div className="ahs-suggestions">
          {suggestions.map((h) => {
            const id = String(h.id);
            const added = Boolean(isHabitAdded?.(id));
            return (
              <button
                key={id}
                type="button"
                className={`ahs-suggestion ${added ? "isAdded" : ""}`}
                onClick={() => (!added ? applyTemplate(h) : null)}
                disabled={isSubmitting}
              >
                <div className="ahs-suggIcon" aria-hidden="true">
                  <HabitIcon habitId={h?.code || h?.id} />
                </div>
                <div className="ahs-suggInfo">
                  <div className="ahs-suggName">{h.name}</div>
                  <div className="ahs-suggSub">{h.description || h.unitPlural || h.unit || ""}</div>
                </div>
                <div className="ahs-suggRight">
                  {added ? <span className="ahs-addedBadge">Added</span> : <span className="ahs-chevron">›</span>}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  const renderTrackingStep = () => (
    <div className="ahs-step">
      <div className="ahs-sectionLabel">2. WHAT DO YOU TRACK?</div>

      <div className="ahs-trackingGrid">
        <button
          type="button"
          className={`ahs-trackCard ${tracking === "volume" ? "active" : ""} ${templateLocked ? "locked" : ""}`}
          onClick={() => (!templateLocked ? setTracking("volume") : null)}
          disabled={isSubmitting}
        >
          <div className="ahs-cardTitle">Volume</div>
          <div className="ahs-cardSub">Track an amount (payout per unit)</div>
        </button>

        <button
          type="button"
          className={`ahs-trackCard ${tracking === "binary" ? "active" : ""} ${templateLocked ? "locked" : ""}`}
          onClick={() => (!templateLocked ? setTracking("binary") : null)}
          disabled={isSubmitting}
        >
          <div className="ahs-cardTitle">Binary</div>
          <div className="ahs-cardSub">Did it / didn’t do it (flat payout)</div>
        </button>
      </div>

      {templateLocked ? (
        <div className="ahs-help">
          This is locked because you picked a catalog suggestion. Tap <span className="ahs-helpEm">Customize</span> to
          change it.
        </div>
      ) : (
        <div className="ahs-help">
          Binary is best for “Meditate” or “No soda”. Volume is best for “Minutes exercised”.
        </div>
      )}
    </div>
  );

  const renderUnitStep = () => (
    <div className="ahs-step">
      <div className="ahs-sectionLabel">3. UNIT</div>

      <input
        className="ahs-input"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        placeholder="e.g. minutes, miles, pages"
        disabled={isSubmitting || templateLocked}
        autoFocus
      />

      {templateLocked ? (
        <div className="ahs-help">
          This is locked because you picked a catalog suggestion. Tap <span className="ahs-helpEm">Customize</span> to
          change it.
        </div>
      ) : (
        <div className="ahs-help">
          We’ll display your rate as “{rateUSD || "0.00"} per {unitPlural || "unit"}”.
        </div>
      )}
    </div>
  );

  const renderGoalRateStep = () => (
    <div className="ahs-step">
      <div className="ahs-sectionLabel">{tracking === "volume" ? "4." : "3."} GOAL & RATE</div>

      <div className="ahs-row">
        <div className="ahs-field">
          <label className="ahs-label">Goal</label>
          <div className="ahs-goalWrap">
            <input
              className="ahs-goalAmount"
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              min={binary ? "1" : "0"}
              step={binary ? "1" : "any"}
              disabled={isSubmitting}
            />
            <span className="ahs-goalUnit">{goalUnitLabel}</span>
          </div>
        </div>

        <div className="ahs-field">
          <label className="ahs-label">Period</label>
          <select
            className="ahs-select"
            value={goalPeriod}
            onChange={(e) => setGoalPeriod(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="day">per day</option>
            <option value="week">per week</option>
            <option value="month">per month</option>
          </select>
        </div>
      </div>

      {/* NEW: rate enable/disable */}
      <div className="ahs-rateToggleRow">
        <div className="ahs-rateToggleText">
          <div className="ahs-rateToggleTitle">Pay myself</div>
          <div className="ahs-rateToggleSub">Turn off to track without earnings.</div>
        </div>

        <button
          type="button"
          className={`ahs-toggle ${rateEnabled ? "on" : "off"}`}
          onClick={() => setRateEnabled((v) => !v)}
          disabled={isSubmitting}
          aria-pressed={rateEnabled}
        >
          <span className="ahs-toggleKnob" />
        </button>
      </div>

      <div className="ahs-field" style={{ marginTop: 10 }}>
        <label className="ahs-label">Rate</label>

        {rateEnabled ? (
          <>
            {/* if template has rate options, show quick chips */}
            {rateOptionsMicros.length > 0 ? (
              <div className="ahs-rateChips">
                {rateOptionsMicros.map((m) => {
                  const label = `$${(m / 1_000_000).toFixed(2)}`;
                  const selected = Number(parsedRateMicros) === Number(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`ahs-chip ${selected ? "selected" : ""}`}
                      onClick={() => {
                        setRateUSD((m / 1_000_000).toFixed(2));
                        setRateEnabled(true);
                      }}
                      disabled={isSubmitting}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="ahs-rateInline">
              <span className="ahs-ratePrefix">$</span>
              <input
                className="ahs-rateInput"
                value={rateUSD}
                onChange={(e) => {
                  setRateUSD(e.target.value);
                  // if they start typing a rate, it’s implicitly enabled
                  if (!rateEnabled) setRateEnabled(true);
                }}
                inputMode="decimal"
                placeholder="1.00"
                disabled={isSubmitting}
              />
              <span className="ahs-rateSuffix">
                {tracking === "binary" ? "per log" : `per ${unitPlural || "unit"}`}
              </span>
            </div>
          </>
        ) : (
          <div className="ahs-rateDisabledHint">No payout (earnings will be $0)</div>
        )}
      </div>

      {templateAdded ? (
        <div className="ahs-warning">
          You already added <b>{template?.name}</b>. Pick a different habit or switch to custom.
        </div>
      ) : null}

      {projections ? (
        <div className="ahs-proj">
          <div className="ahs-projTitle">At this goal, you’d earn:</div>
          <div className="ahs-projRow">
            <span className="ahs-projAmt">{formatUSDFromMicros(projections.weeklyMicros)}</span>
            <span className="ahs-projSub">/ week</span>
          </div>
          <div className="ahs-projRow">
            <span className="ahs-projAmt">{formatAnnual(projections.annualMicros)}</span>
            <span className="ahs-projSub">/ year</span>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="ahs">
      <style>{styles}</style>

      {/* iOS-like header */}
      <div className="ahs-header">
        <button className="ahs-headerBtn" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>

        <button
          className={`ahs-headerBtn ahs-createBtn ${canCreate ? "enabled" : ""}`}
          onClick={handleCreate}
          disabled={!canCreate}
        >
          {isSubmitting ? "Creating" : "Create"}
        </button>
      </div>

      {/* progress dots */}
      <div className="ahs-dots">
        {steps.map((_, i) => (
          <div key={i} className={`ahs-dot ${i <= step ? "active" : ""}`} />
        ))}
      </div>

      <div className="ahs-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[step]}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {steps[step] === "name" ? renderNameStep() : null}
            {steps[step] === "tracking" ? renderTrackingStep() : null}
            {steps[step] === "unit" ? renderUnitStep() : null}
            {steps[step] === "goalRate" ? renderGoalRateStep() : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* footer nav */}
      <div className="ahs-footer">
        <Button variant="secondary" onClick={goBack} disabled={isSubmitting}>
          Back
        </Button>

        {steps[step] === "goalRate" ? (
          <Button onClick={handleCreate} disabled={!canCreate}>
            {isSubmitting ? "Creating..." : "Create Habit"}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={isSubmitting || !canAdvance}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

const styles = `
.ahs{
  height: 100%;
  display:flex;
  flex-direction:column;
  padding: 12px 14px 14px;
  box-sizing: border-box;
  background: #fff;
}

.ahs-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding-top: 2px;
}
.ahs-headerBtn{
  border: none;
  background: transparent;
  font-size: 15px;
  padding: 8px 6px;
  color: rgba(16, 96, 255, 0.95);
}
.ahs-createBtn{
  color: rgba(0,0,0,0.25);
}
.ahs-createBtn.enabled{
  color: rgba(16, 96, 255, 0.95);
  font-weight: 700;
}

.ahs-dots{
  display:flex;
  justify-content:center;
  gap: 8px;
  padding: 10px 0 12px;
}
.ahs-dot{
  width: 34px;
  height: 4px;
  border-radius: 999px;
  background: rgba(0,0,0,0.10);
}
.ahs-dot.active{
  background: rgba(16, 96, 255, 0.55);
}

.ahs-body{
  flex: 1;
  overflow: auto;
  padding-bottom: 10px;
}

.ahs-step{
  padding-top: 6px;
}
.ahs-sectionLabel{
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgba(0,0,0,0.55);
  margin-bottom: 10px;
}

.ahs-input{
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
}
.ahs-input:focus{
  border-color: rgba(16, 96, 255, 0.35);
  box-shadow: 0 0 0 3px rgba(16, 96, 255, 0.12);
}

.ahs-templateRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-top: 10px;
}
.ahs-templatePill{
  display:flex;
  align-items:center;
  gap: 8px;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(16, 96, 255, 0.08);
  color: rgba(0,0,0,0.65);
}
.ahs-templatePillDot{
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(16, 96, 255, 0.65);
}
.ahs-link{
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: rgba(16, 96, 255, 0.95);
  padding: 6px 6px;
}

.ahs-help{
  margin-top: 10px;
  font-size: 13px;
  color: rgba(0,0,0,0.55);
}
.ahs-helpEm{
  font-weight: 800;
  color: rgba(16, 96, 255, 0.95);
}

.ahs-suggestions{
  margin-top: 10px;
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.ahs-suggestion{
  width: 100%;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(0,0,0,0.02);
  border-radius: 14px;
  padding: 10px 10px;
  display:flex;
  align-items:center;
  gap: 10px;
  text-align:left;
}
.ahs-suggestion.isAdded{
  opacity: 0.55;
}
.ahs-suggIcon{
  width: 36px;
  height: 36px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(16, 96, 255, 0.06);
  display:grid;
  place-items:center;
}
.ahs-suggInfo{
  flex: 1;
  min-width: 0;
}
.ahs-suggName{
  font-weight: 800;
  font-size: 14px;
  color: rgba(0,0,0,0.85);
}
.ahs-suggSub{
  font-size: 12px;
  color: rgba(0,0,0,0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ahs-suggRight{
  display:flex;
  align-items:center;
}
.ahs-chevron{
  font-size: 20px;
  color: rgba(0,0,0,0.25);
}
.ahs-addedBadge{
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.07);
  color: rgba(0,0,0,0.6);
}

.ahs-trackingGrid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.ahs-trackCard{
  text-align:left;
  padding: 14px 14px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
}
.ahs-trackCard.locked{
  opacity: 0.75;
}
.ahs-trackCard.active{
  border-color: rgba(16, 96, 255, 0.45);
  box-shadow: 0 0 0 3px rgba(16, 96, 255, 0.12);
}
.ahs-cardTitle{
  font-weight: 900;
  font-size: 14px;
  margin-bottom: 4px;
}
.ahs-cardSub{
  font-size: 12px;
  color: rgba(0,0,0,0.55);
}

.ahs-row{
  display:flex;
  gap: 12px;
}
.ahs-field{
  flex: 1;
}
.ahs-label{
  display:block;
  font-size: 12px;
  font-weight: 800;
  color: rgba(0,0,0,0.60);
  margin-bottom: 6px;
}

.ahs-goalWrap{
  display:flex;
  align-items:center;
  gap: 8px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
}
.ahs-goalAmount{
  width: 90px;
  border:none;
  outline:none;
  font-size: 16px;
}
.ahs-goalUnit{
  font-size: 13px;
  color: rgba(0,0,0,0.60);
}

.ahs-select{
  width: 100%;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  font-size: 14px;
}

.ahs-rateToggleRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-top: 12px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(0,0,0,0.02);
}
.ahs-rateToggleText{
  display:flex;
  flex-direction:column;
  gap: 2px;
}
.ahs-rateToggleTitle{
  font-size: 13px;
  font-weight: 900;
  color: rgba(0,0,0,0.75);
}
.ahs-rateToggleSub{
  font-size: 12px;
  color: rgba(0,0,0,0.55);
}

.ahs-toggle{
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(0,0,0,0.18);
  position: relative;
  padding: 0;
}
.ahs-toggle.on{
  background: rgba(16, 96, 255, 0.55);
  border-color: rgba(16, 96, 255, 0.40);
}
.ahs-toggleKnob{
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #fff;
  position:absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 2px;
  transition: left 140ms ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}
.ahs-toggle.on .ahs-toggleKnob{
  left: 20px;
}

.ahs-rateChips{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.ahs-chip{
  border: 1px solid rgba(0,0,0,0.10);
  background: rgba(0,0,0,0.02);
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}
.ahs-chip.selected{
  border-color: rgba(16, 96, 255, 0.35);
  background: rgba(16, 96, 255, 0.10);
  color: rgba(16, 96, 255, 0.95);
}

.ahs-rateInline{
  display:flex;
  align-items:center;
  gap: 8px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
}
.ahs-ratePrefix{
  font-weight: 900;
  color: rgba(0,0,0,0.70);
}
.ahs-rateInput{
  width: 90px;
  border:none;
  outline:none;
  font-size: 16px;
}
.ahs-rateSuffix{
  flex: 1;
  font-size: 12px;
  color: rgba(0,0,0,0.55);
}
.ahs-rateDisabledHint{
  margin-top: 6px;
  padding: 10px 10px;
  border-radius: 14px;
  border: 1px dashed rgba(0,0,0,0.18);
  background: rgba(0,0,0,0.02);
  font-size: 13px;
  color: rgba(0,0,0,0.60);
}

.ahs-warning{
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 193, 7, 0.16);
  color: rgba(0,0,0,0.70);
  font-size: 13px;
}

.ahs-proj{
  margin-top: 14px;
  padding: 12px 12px;
  border-radius: 14px;
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.06);
}
.ahs-projTitle{
  font-size: 12px;
  font-weight: 800;
  color: rgba(0,0,0,0.55);
  margin-bottom: 8px;
}
.ahs-projRow{
  display:flex;
  align-items:baseline;
  gap: 6px;
  margin-top: 4px;
}
.ahs-projAmt{
  font-size: 18px;
  font-weight: 900;
}
.ahs-projSub{
  font-size: 12px;
  color: rgba(0,0,0,0.55);
}

.ahs-footer{
  display:flex;
  gap: 12px;
  padding-top: 10px;
}
`;
