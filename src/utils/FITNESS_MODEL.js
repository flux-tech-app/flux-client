// Fitness Category Model - Single source of truth for fitness habits

export const FITNESS_CATEGORY = {
  id: 'fitness',
  name: 'Fitness',
  enabled: true,
  
  subcategories: {
    cardio: {
      id: 'cardio',
      name: 'Cardio',
      displayName: 'CARDIO',
      
      habitTypes: [
        {
          id: 'walking',
          name: 'Walking',
          requiresCustomName: false, // Name is "Walking"
          suggestedRates: [
            { type: 'per_mile', amount: 0.50, unit: 'mile' },
            { type: 'per_minute', amount: 0.05, unit: 'min' },
            { type: 'per_step', amount: 0.0001, unit: 'step' },
            { type: 'per_session', amount: 2.00, unit: 'session' }
          ],
          defaultRate: { type: 'per_minute', amount: 0.05, unit: 'min' }
        },
        {
          id: 'running',
          name: 'Running',
          requiresCustomName: false, // Name is "Running"
          suggestedRates: [
            { type: 'per_mile', amount: 1.00, unit: 'mile' },
            { type: 'per_minute', amount: 0.10, unit: 'min' },
            { type: 'per_session', amount: 3.00, unit: 'session' }
          ],
          defaultRate: { type: 'per_mile', amount: 1.00, unit: 'mile' }
        },
        {
          id: 'cycling',
          name: 'Cycling',
          requiresCustomName: false, // Name is "Cycling"
          suggestedRates: [
            { type: 'per_mile', amount: 0.25, unit: 'mile' },
            { type: 'per_minute', amount: 0.08, unit: 'min' },
            { type: 'per_session', amount: 3.00, unit: 'session' }
          ],
          defaultRate: { type: 'per_mile', amount: 0.25, unit: 'mile' }
        },
        {
          id: 'other_cardio',
          name: 'Other Cardio',
          requiresCustomName: true, // User must enter name
          suggestedRates: [
            { type: 'per_minute', amount: 0.10, unit: 'min' },
            { type: 'per_session', amount: 3.00, unit: 'session' }
          ],
          defaultRate: { type: 'per_session', amount: 3.00, unit: 'session' }
        }
      ]
    },
    
    strength: {
      id: 'strength',
      name: 'Strength',
      displayName: 'STRENGTH',
      
      habitTypes: [
        {
          id: 'bodyweight',
          name: 'Bodyweight',
          requiresCustomName: true, // User specifies: Push-ups, Pull-ups, Squats, etc.
          suggestedRates: [
            { type: 'per_rep', amount: 0.05, unit: 'rep' },
            { type: 'per_session', amount: 3.00, unit: 'session' }
          ],
          defaultRate: { type: 'per_rep', amount: 0.05, unit: 'rep' }
        },
        {
          id: 'weights',
          name: 'Weights',
          requiresCustomName: true, // User specifies: Bench Press, Deadlift, etc.
          suggestedRates: [
            { type: 'per_session', amount: 5.00, unit: 'session' },
            { type: 'per_minute', amount: 0.15, unit: 'min' },
            { type: 'per_rep', amount: 0.10, unit: 'rep' }
          ],
          defaultRate: { type: 'per_session', amount: 5.00, unit: 'session' }
        },
        {
          id: 'other_strength',
          name: 'Other Strength',
          requiresCustomName: true, // User must enter name
          suggestedRates: [
            { type: 'per_session', amount: 3.00, unit: 'session' },
            { type: 'per_minute', amount: 0.10, unit: 'min' }
          ],
          defaultRate: { type: 'per_session', amount: 3.00, unit: 'session' }
        }
      ]
    }
  }
}

// All available rate types for fitness habits
export const RATE_TYPES = {
  per_mile: { id: 'per_mile', label: 'Per Mile', unit: 'mile', unitPlural: 'miles' },
  per_step: { id: 'per_step', label: 'Per Step', unit: 'step', unitPlural: 'steps' },
  per_minute: { id: 'per_minute', label: 'Per Minute', unit: 'min', unitPlural: 'minutes' },
  per_rep: { id: 'per_rep', label: 'Per Rep', unit: 'rep', unitPlural: 'reps' },
  per_session: { id: 'per_session', label: 'Per Session', unit: 'session', unitPlural: 'sessions' }
}

// Helper Functions

/**
 * Get all fitness subcategories
 * @returns {Array} Array of subcategory objects
 */
export function getFitnessSubcategories() {
  return Object.values(FITNESS_CATEGORY.subcategories)
}

/**
 * Get habit types for a specific subcategory
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @returns {Array} Array of habit type objects
 */
export function getHabitTypesBySubcategory(subcategoryId) {
  const subcategory = FITNESS_CATEGORY.subcategories[subcategoryId]
  return subcategory ? subcategory.habitTypes : []
}

/**
 * Get a specific habit type configuration
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @param {string} habitTypeId - 'running', 'bodyweight', etc.
 * @returns {Object|null} Habit type object or null
 */
export function getHabitType(subcategoryId, habitTypeId) {
  const habitTypes = getHabitTypesBySubcategory(subcategoryId)
  return habitTypes.find(ht => ht.id === habitTypeId) || null
}

/**
 * Get suggested rates for a habit type
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @param {string} habitTypeId - 'running', 'bodyweight', etc.
 * @returns {Array} Array of suggested rate objects
 */
export function getSuggestedRates(subcategoryId, habitTypeId) {
  const habitType = getHabitType(subcategoryId, habitTypeId)
  return habitType ? habitType.suggestedRates : []
}

/**
 * Get default rate for a habit type
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @param {string} habitTypeId - 'running', 'bodyweight', etc.
 * @returns {Object|null} Default rate object or null
 */
export function getDefaultRate(subcategoryId, habitTypeId) {
  const habitType = getHabitType(subcategoryId, habitTypeId)
  return habitType ? habitType.defaultRate : null
}

/**
 * Get default name for a habit type
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @param {string} habitTypeId - 'running', 'bodyweight', etc.
 * @returns {string} Habit type name or empty string if custom name required
 */
export function getDefaultName(subcategoryId, habitTypeId) {
  const habitType = getHabitType(subcategoryId, habitTypeId)
  if (!habitType) return ''
  
  // If requires custom name, return empty string (user must provide name)
  if (habitType.requiresCustomName) return ''
  
  // Otherwise return the habit type name
  return habitType.name
}

/**
 * Check if a habit type requires custom name
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @param {string} habitTypeId - 'running', 'bodyweight', etc.
 * @returns {boolean} True if custom name required
 */
export function requiresCustomName(subcategoryId, habitTypeId) {
  const habitType = getHabitType(subcategoryId, habitTypeId)
  return habitType ? habitType.requiresCustomName : true
}

/**
 * Get rate type configuration
 * @param {string} rateTypeId - 'per_mile', 'per_rep', etc.
 * @returns {Object|null} Rate type object or null
 */
export function getRateType(rateTypeId) {
  return RATE_TYPES[rateTypeId] || null
}

/**
 * Format rate for display
 * @param {Object} rate - Rate object with type, amount, unit
 * @returns {string} Formatted rate (e.g., "$1.00/mile")
 */
export function formatRate(rate) {
  const rateType = getRateType(rate.type)
  if (!rateType) return `$${rate.amount.toFixed(2)}`
  
  return `$${rate.amount.toFixed(2)}/${rateType.unit}`
}

/**
 * Format log value for display
 * @param {number} value - The logged value
 * @param {string} rateTypeId - 'per_mile', 'per_rep', etc.
 * @returns {string} Formatted value (e.g., "3 miles", "20 reps")
 */
export function formatLogValue(value, rateTypeId) {
  const rateType = getRateType(rateTypeId)
  if (!rateType) return value.toString()
  
  const unit = value === 1 ? rateType.unit : rateType.unitPlural
  return `${value} ${unit}`
}

/**
 * Calculate earnings for a log entry
 * @param {number} value - The logged value (miles, reps, minutes, etc.)
 * @param {number} amount - The rate amount
 * @param {string} rateTypeId - 'per_mile', 'per_rep', etc.
 * @returns {number} Calculated earnings
 */
export function calculateEarnings(value, amount, rateTypeId) {
  // For per_session, value should always be 1
  if (rateTypeId === 'per_session') {
    return amount
  }
  
  // For all other types, multiply value by amount
  return value * amount
}

/**
 * Infer subcategory and habit type from existing habit name (for migration)
 * @param {string} habitName - Current habit name
 * @returns {Object} Object with subcategory and habitType
 */
export function inferFromHabitName(habitName) {
  const name = habitName.toLowerCase()
  
  // Cardio keywords
  if (name.includes('walk')) {
    return { subcategory: 'cardio', habitType: 'walking' }
  }
  if (name.includes('run') || name.includes('jog')) {
    return { subcategory: 'cardio', habitType: 'running' }
  }
  if (name.includes('cycle') || name.includes('bike')) {
    return { subcategory: 'cardio', habitType: 'cycling' }
  }
  if (name.includes('cardio')) {
    return { subcategory: 'cardio', habitType: 'other_cardio' }
  }
  
  // Strength keywords
  if (name.includes('push') || name.includes('pull') || name.includes('squat') || 
      name.includes('plank') || name.includes('burpee')) {
    return { subcategory: 'strength', habitType: 'bodyweight' }
  }
  if (name.includes('lift') || name.includes('weight') || name.includes('press') || 
      name.includes('curl') || name.includes('row') || name.includes('deadlift')) {
    return { subcategory: 'strength', habitType: 'weights' }
  }
  if (name.includes('strength')) {
    return { subcategory: 'strength', habitType: 'other_strength' }
  }
  
  // Default to cardio/other if unsure
  return { subcategory: 'cardio', habitType: 'other_cardio' }
}

/**
 * Get subcategory display name
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @returns {string} Display name (e.g., "CARDIO")
 */
export function getSubcategoryDisplayName(subcategoryId) {
  const subcategory = FITNESS_CATEGORY.subcategories[subcategoryId]
  return subcategory ? subcategory.displayName : subcategoryId.toUpperCase()
}

/**
 * Get habit type name
 * @param {string} subcategoryId - 'cardio' or 'strength'
 * @param {string} habitTypeId - 'running', 'bodyweight', etc.
 * @returns {string} Habit type name
 */
export function getHabitTypeName(subcategoryId, habitTypeId) {
  const habitType = getHabitType(subcategoryId, habitTypeId)
  return habitType ? habitType.name : habitTypeId
}

export default FITNESS_CATEGORY
