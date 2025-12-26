// src/pages/AddHabit/AddHabit.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useHabits from "@/hooks/useHabits";
import Button from "@/components/Button";
import { dollarsToMicros } from "@/utils/micros";
import "./AddHabit.css";

export default function AddHabit() {
  const navigate = useNavigate();
  const { addHabit, catalogHabits, getCatalogHabit, habits } = useHabits();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "build", // build => actionType log, break => actionType pass
    libraryId: "",
    rate: "0.05", // dollars string
    goalAmount: "",
    goalPeriod: "week",
  });

  // ---- existing habit ids (source of truth) ----
  const addedLibraryIds = useMemo(() => {
    const set = new Set();
    for (const h of habits || []) {
      if (h?.libraryId) set.add(String(h.libraryId));
    }
    return set;
  }, [habits]);

  // ---- catalog filtering ----
  const wantedActionType = useMemo(() => {
    // backend spec: "log" | "pass"
    return formData.type === "build" ? "log" : "pass";
  }, [formData.type]);

  const filteredCatalog = useMemo(() => {
    const list = catalogHabits || [];
    return list.filter((h) => String(h?.actionType || "").toLowerCase() === wantedActionType);
  }, [catalogHabits, wantedActionType]);

  // only show catalog habits that are NOT already in portfolio
  const availableCatalog = useMemo(() => {
    return filteredCatalog.filter((h) => !addedLibraryIds.has(String(h.id)));
  }, [filteredCatalog, addedLibraryIds]);

  const selectedCatalogHabit = useMemo(() => {
    if (!formData.libraryId) return null;
    return getCatalogHabit(formData.libraryId);
  }, [formData.libraryId, getCatalogHabit]);

  const rateNumber = useMemo(() => {
    const n = Number(String(formData.rate ?? "").trim());
    return Number.isFinite(n) ? n : 0;
  }, [formData.rate]);

  const goalAmountNumber = useMemo(() => {
    const n = Number(String(formData.goalAmount ?? "").trim());
    return Number.isFinite(n) ? n : 0;
  }, [formData.goalAmount]);

  const isBinary = useMemo(() => {
    const rt = String(selectedCatalogHabit?.rateType ?? "").toUpperCase();
    return rt === "BINARY";
  }, [selectedCatalogHabit]);

  const unitLabel = selectedCatalogHabit?.unit || (isBinary ? "" : "unit");

  const isValid =
    !!selectedCatalogHabit &&
    rateNumber > 0 &&
    goalAmountNumber > 0 &&
    !!String(formData.goalPeriod || "").trim();

  const updateField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "type") {
        next.libraryId = "";
        next.goalAmount = "";
        next.goalPeriod = "week";
        next.rate = value === "build" ? "0.05" : "1.00";
      }

      if (field === "libraryId") {
        const c = getCatalogHabit(value);
        if (c?.defaultRateMicros != null) {
          const dollars = Number(c.defaultRateMicros) / 1_000_000;
          next.rate = dollars < 0.01 ? dollars.toFixed(4) : dollars.toFixed(2);
        }
        if (c?.defaultGoalPeriod) next.goalPeriod = c.defaultGoalPeriod;
      }

      return next;
    });
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    navigate("/", { state: { direction: "back" } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedCatalogHabit) {
      alert("Please select a position from the catalog.");
      return;
    }
    if (addedLibraryIds.has(String(selectedCatalogHabit.id))) {
      alert("That habit is already in your portfolio.");
      return;
    }
    if (rateNumber <= 0) {
      alert("Please enter a valid rate amount.");
      return;
    }
    if (goalAmountNumber <= 0) {
      alert("Please set a goal amount.");
      return;
    }

    const rateMicros = dollarsToMicros(rateNumber);

    setIsSubmitting(true);
    try {
      await addHabit({
        libraryId: String(selectedCatalogHabit.id),
        rateMicros,
        goal: {
          amount: goalAmountNumber,
          period: String(formData.goalPeriod),
        },
      });

      navigate("/", { state: { direction: "back" } });
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to add habit. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ---- empty states ----
  const catalogLoaded = (catalogHabits || []).length > 0;
  const showAllAdded = catalogLoaded && availableCatalog.length === 0;

  return (
    <div className="add-habit-page">
      <div className="add-habit-container">
        <header className="add-header">
          <div className="header-left">
            <Button variant="ghost" size="sm" leftIcon={null} rightIcon={null} onClick={handleCancel}>
              Cancel
            </Button>
          </div>

          <div className="header-title">Add Position</div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={null}
            rightIcon={null}
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            Create
          </Button>
        </header>

        <form className="form-content" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-label">Position Type</div>
            <div className="type-toggle">
              <div
                className={`type-option ${formData.type === "build" ? "selected" : ""}`}
                onClick={() => !isSubmitting && updateField("type", "build")}
              >
                <div className="type-title">Build</div>
                <div className="type-desc">Positive habits to do</div>
              </div>

              <div
                className={`type-option ${formData.type === "break" ? "selected" : ""}`}
                onClick={() => !isSubmitting && updateField("type", "break")}
              >
                <div className="type-title">Break</div>
                <div className="type-desc">Habits to resist</div>
              </div>
            </div>
          </div>

          {showAllAdded ? (
            <div className="form-section">
              <div className="info-card">
                <div className="info-title">All Habits Added!</div>
                <div className="info-text">
                  You’ve added all available {formData.type === "build" ? "build" : "break"} habits from the server
                  catalog.
                  <br />
                  Add more catalog entries on the backend to allow more positions.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="form-section">
                <div className="section-label">Position</div>
                <div className="input-group">
                  <label className="input-label">Choose from catalog</label>
                  <select
                    className="goal-period-select"
                    value={formData.libraryId}
                    onChange={(e) => updateField("libraryId", e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">{catalogLoaded ? "Select…" : "Loading…"}</option>
                    {availableCatalog.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>

                  <div className="input-helper">Only shows habits not already in your portfolio.</div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-label">Base Rate</div>

                <div className="input-group">
                  <label className="input-label">
                    {isBinary ? "Amount per completion" : `Amount per ${unitLabel || "unit"}`}
                  </label>

                  <div className="amount-input-group">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      className="amount-input"
                      step="0.01"
                      min="0.01"
                      max="10"
                      value={formData.rate}
                      onChange={(e) => updateField("rate", e.target.value)}
                      disabled={isSubmitting}
                    />
                    {!isBinary && unitLabel ? <span className="per-label">/ {unitLabel}</span> : null}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-label">Goal</div>

                <div className="goal-input-row">
                  <div className="goal-input-group">
                    <label className="goal-input-label">Amount</label>
                    <div className="goal-input-wrapper">
                      <input
                        type="number"
                        className="goal-input"
                        value={formData.goalAmount}
                        onChange={(e) => updateField("goalAmount", e.target.value)}
                        placeholder="0"
                        min="0"
                        step="any"
                        disabled={isSubmitting}
                      />
                      <span className="goal-unit-label">
                        {selectedCatalogHabit?.goalUnit || unitLabel || "units"}
                      </span>
                    </div>
                  </div>

                  <div className="goal-input-group">
                    <label className="goal-input-label">Period</label>
                    <select
                      className="goal-period-select"
                      value={formData.goalPeriod}
                      onChange={(e) => updateField("goalPeriod", e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="day">per day</option>
                      <option value="week">per week</option>
                      <option value="month">per month</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
