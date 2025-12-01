import { useState, useEffect } from 'react'
import { useHabits } from '../../context/HabitContext'
import {
  FITNESS_CATEGORY,
  getHabitTypesBySubcategory,
  getSuggestedRates,
  getDefaultRate,
  getDefaultName,
  requiresCustomName,
  formatRate,
} from '../../utils/FITNESS_MODEL'
import './FitnessHabitForm.css'

export default function FitnessHabitForm({ editHabit = null, onSuccess, onCancel }) {
  const { addHabit, updateHabit } = useHabits()
  
  const isEditMode = !!editHabit

  // Form state
  const [subcategory, setSubcategory] = useState(null)
  const [habitType, setHabitType] = useState(null)
  const [customName, setCustomName] = useState('')
  const [selectedRate, setSelectedRate] = useState(null)
  const [customRateAmount, setCustomRateAmount] = useState('')
  const [customRateType, setCustomRateType] = useState('per_session')
  const [isCustomRate, setIsCustomRate] = useState(false)
  const [scheduleType, setScheduleType] = useState('daily')
  const [selectedDays, setSelectedDays] = useState([])

  // Initialize form with edit data
  useEffect(() => {
    if (editHabit) {
      setSubcategory(editHabit.subcategory || null)
      setHabitType(editHabit.habitType || null)
      setCustomName(editHabit.name || '')
      
      // Set rate
      const suggestedRates = editHabit.subcategory && editHabit.habitType 
        ? getSuggestedRates(editHabit.subcategory, editHabit.habitType)
        : []
      
      const matchingSuggested = suggestedRates.find(
        r => r.type === editHabit.rateType && r.amount === editHabit.amount
      )
      
      if (matchingSuggested) {
        setSelectedRate(matchingSuggested)
        setIsCustomRate(false)
      } else {
        setIsCustomRate(true)
        setCustomRateAmount(editHabit.amount?.toString() || '')
        setCustomRateType(editHabit.rateType || 'per_session')
      }
      
      // Set schedule
      if (editHabit.schedule) {
        const { type, days } = editHabit.schedule
        setScheduleType(type || 'daily')
        setSelectedDays(days || [])
      }
    }
  }, [editHabit])

  // Derived values
  const habitTypes = subcategory ? getHabitTypesBySubcategory(subcategory) : []
  const suggestedRates = subcategory && habitType ? getSuggestedRates(subcategory, habitType) : []
  const showNameField = subcategory && habitType ? requiresCustomName(subcategory, habitType) : false

  // Reset dependent fields when subcategory changes (only in create mode)
  useEffect(() => {
    if (!isEditMode) {
      setHabitType(null)
      setSelectedRate(null)
      setCustomName('')
      setIsCustomRate(false)
    }
  }, [subcategory, isEditMode])

  // Set default rate when habit type changes (only in create mode)
  useEffect(() => {
    if (!isEditMode && subcategory && habitType) {
      const defaultRate = getDefaultRate(subcategory, habitType)
      if (defaultRate) {
        setSelectedRate(defaultRate)
        setIsCustomRate(false)
      }
    }
  }, [subcategory, habitType, isEditMode])

  // Toggle day selection
  const toggleDay = (dayIndex) => {
    setSelectedDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(d => d !== dayIndex)
      }
      return [...prev, dayIndex].sort((a, b) => a - b)
    })
  }

  // Validation
  const isValid = () => {
    if (!subcategory || !habitType) return false
    if (showNameField && !customName.trim()) return false
    if (isCustomRate && (!customRateAmount || parseFloat(customRateAmount) <= 0)) return false
    if (!isCustomRate && !selectedRate) return false
    if (scheduleType === 'specific_days' && selectedDays.length === 0) return false
    return true
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid()) return

    // Determine habit name
    const habitName = showNameField
      ? customName.trim()
      : getDefaultName(subcategory, habitType) || customName.trim()

    // Determine rate
    const finalRate = isCustomRate
      ? { type: customRateType, amount: parseFloat(customRateAmount) }
      : selectedRate

    // Build schedule object
    let schedule
    switch (scheduleType) {
      case 'daily':
        schedule = { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] }
        break
      case 'weekdays':
        schedule = { type: 'weekdays', days: [1, 2, 3, 4, 5] }
        break
      case 'weekends':
        schedule = { type: 'weekends', days: [0, 6] }
        break
      case 'specific_days':
        schedule = { type: 'specific_days', days: selectedDays }
        break
      default:
        schedule = { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] }
    }

    if (isEditMode) {
      // Update existing habit
      updateHabit(editHabit.id, {
        category: 'fitness',
        subcategory,
        habitType,
        name: habitName,
        rateType: finalRate.type,
        amount: finalRate.amount,
        schedule,
      })
      
      if (onSuccess) {
        onSuccess({ ...editHabit, name: habitName })
      }
    } else {
      // Create new habit
      const newHabit = addHabit({
        category: 'fitness',
        subcategory,
        habitType,
        name: habitName,
        rateType: finalRate.type,
        amount: finalRate.amount,
        schedule,
      })

      if (onSuccess) {
        onSuccess(newHabit)
      }
    }
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <form className="fitness-habit-form" onSubmit={handleSubmit}>
      {/* Header - only show in non-edit mode when used standalone */}
      {!isEditMode && !editHabit && (
        <div className="form-header">
          <h2>Create Fitness Habit</h2>
          <p>Track your workouts and earn rewards</p>
        </div>
      )}

      {/* Subcategory Selection */}
      <div className="form-section">
        <label className="form-label">Type of fitness</label>
        <div className="subcategory-buttons">
          <button
            type="button"
            className={`subcategory-btn ${subcategory === 'cardio' ? 'active' : ''}`}
            onClick={() => setSubcategory('cardio')}
          >
            <svg className="subcategory-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Cardio
          </button>
          <button
            type="button"
            className={`subcategory-btn ${subcategory === 'strength' ? 'active' : ''}`}
            onClick={() => setSubcategory('strength')}
          >
            <svg className="subcategory-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h4v8H4zm12 0h4v8h-4zM2 10h2v4H2zm18 0h2v4h-2zM8 11h8v2H8z" />
            </svg>
            Strength
          </button>
        </div>
      </div>

      {/* Habit Type Dropdown */}
      {subcategory && (
        <div className="form-section">
          <label className="form-label">Activity</label>
          <select
            className="form-select"
            value={habitType || ''}
            onChange={(e) => setHabitType(e.target.value || null)}
          >
            <option value="">Select activity...</option>
            {habitTypes.map((ht) => (
              <option key={ht.id} value={ht.id}>
                {ht.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Name Input (conditional) */}
      {(showNameField || (isEditMode && customName)) && (
        <div className="form-section">
          <label className="form-label">Habit name</label>
          <input
            type="text"
            className="form-input"
            placeholder={subcategory === 'strength' ? 'e.g., Push-ups, Bench Press' : 'e.g., Swimming, Jump Rope'}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>
      )}

      {/* Rate Selection */}
      {subcategory && habitType && (
        <div className="form-section">
          <label className="form-label">Earning rate</label>
          <div className="rate-options">
            {suggestedRates.map((rate, index) => (
              <button
                key={index}
                type="button"
                className={`rate-btn ${!isCustomRate && selectedRate?.type === rate.type && selectedRate?.amount === rate.amount ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRate(rate)
                  setIsCustomRate(false)
                }}
              >
                {formatRate(rate)}
              </button>
            ))}
            <button
              type="button"
              className={`rate-btn custom-rate-btn ${isCustomRate ? 'active' : ''}`}
              onClick={() => setIsCustomRate(true)}
            >
              Custom
            </button>
          </div>

          {/* Custom Rate Input */}
          {isCustomRate && (
            <div className="custom-rate-inputs">
              <div className="custom-rate-amount">
                <span className="currency-prefix">$</span>
                <input
                  type="number"
                  className="form-input amount-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={customRateAmount}
                  onChange={(e) => setCustomRateAmount(e.target.value)}
                />
              </div>
              <select
                className="form-select rate-type-select"
                value={customRateType}
                onChange={(e) => setCustomRateType(e.target.value)}
              >
                <option value="per_session">per session</option>
                <option value="per_minute">per minute</option>
                <option value="per_mile">per mile</option>
                <option value="per_rep">per rep</option>
                <option value="per_step">per step</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Schedule Selection */}
      {subcategory && habitType && (
        <div className="form-section">
          <label className="form-label">Schedule</label>
          <div className="schedule-buttons">
            <button
              type="button"
              className={`schedule-btn ${scheduleType === 'daily' ? 'active' : ''}`}
              onClick={() => setScheduleType('daily')}
            >
              Daily
            </button>
            <button
              type="button"
              className={`schedule-btn ${scheduleType === 'weekdays' ? 'active' : ''}`}
              onClick={() => setScheduleType('weekdays')}
            >
              Weekdays
            </button>
            <button
              type="button"
              className={`schedule-btn ${scheduleType === 'specific_days' ? 'active' : ''}`}
              onClick={() => setScheduleType('specific_days')}
            >
              Custom
            </button>
          </div>

          {/* Day Picker (for specific days) */}
          {scheduleType === 'specific_days' && (
            <div className="day-picker">
              {dayLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  className={`day-btn ${selectedDays.includes(index) ? 'active' : ''}`}
                  onClick={() => toggleDay(index)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="form-actions">
        <button
          type="button"
          className="cancel-btn"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="submit-btn"
          disabled={!isValid()}
        >
          {isEditMode ? 'Save Changes' : 'Create Habit'}
        </button>
      </div>
    </form>
  )
}
