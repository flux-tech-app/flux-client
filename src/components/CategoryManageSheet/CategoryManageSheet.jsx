import { useState } from 'react'
import { useHabits } from '../../context/HabitContext'
import FitnessHabitForm from '../FitnessHabitForm'
import { getSubcategoryDisplayName } from '../../utils/FITNESS_MODEL'
import './CategoryManageSheet.css'

// View modes within the sheet
const VIEWS = {
  LIST: 'list',
  EDIT: 'edit',
  ADD: 'add',
}

export default function CategoryManageSheet({ category, onClose }) {
  const { habits, deleteHabit } = useHabits()
  const [currentView, setCurrentView] = useState(VIEWS.LIST)
  const [editingHabit, setEditingHabit] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // habit id to confirm delete

  // Filter habits for this category
  const categoryHabits = habits.filter(h => h.category === category)

  // Group by subcategory
  const groupedHabits = categoryHabits.reduce((acc, habit) => {
    const sub = habit.subcategory || 'other'
    if (!acc[sub]) acc[sub] = []
    acc[sub].push(habit)
    return acc
  }, {})

  // Handle edit click
  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setCurrentView(VIEWS.EDIT)
  }

  // Handle delete click
  const handleDeleteClick = (habitId) => {
    setDeleteConfirm(habitId)
  }

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      deleteHabit(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm(null)
  }

  // Handle form success (create or edit)
  const handleFormSuccess = (habit) => {
    setCurrentView(VIEWS.LIST)
    setEditingHabit(null)
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setCurrentView(VIEWS.LIST)
    setEditingHabit(null)
  }

  // Handle add new habit
  const handleAddNew = () => {
    setEditingHabit(null)
    setCurrentView(VIEWS.ADD)
  }

  // Go back to list
  const handleBack = () => {
    setCurrentView(VIEWS.LIST)
    setEditingHabit(null)
  }

  // Format rate display
  const formatRateDisplay = (habit) => {
    const amount = habit.amount || 0
    const rateType = habit.rateType || 'per_session'
    
    const rateLabels = {
      per_session: '/session',
      per_minute: '/min',
      per_mile: '/mile',
      per_rep: '/rep',
      per_step: '/step',
    }
    
    return `$${amount.toFixed(2)}${rateLabels[rateType] || ''}`
  }

  // Format schedule display
  const formatScheduleDisplay = (habit) => {
    if (!habit.schedule) return 'Daily'
    
    const { type, days } = habit.schedule
    
    switch (type) {
      case 'daily':
        return 'Daily'
      case 'weekdays':
        return 'Weekdays'
      case 'weekends':
        return 'Weekends'
      case 'specific_days':
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        if (days.length === 7) return 'Daily'
        if (days.length <= 3) {
          return days.map(d => dayLabels[d]).join('/')
        }
        return `${days.length} days/week`
      default:
        return 'Daily'
    }
  }

  // Get header title based on view
  const getHeaderTitle = () => {
    if (currentView === VIEWS.EDIT) {
      return `Edit ${editingHabit?.name || 'Habit'}`
    }
    if (currentView === VIEWS.ADD) {
      return 'Add Fitness Habit'
    }
    return `Manage ${category.charAt(0).toUpperCase() + category.slice(1)}`
  }

  // Subcategory order for display
  const subcategoryOrder = ['cardio', 'strength', 'other']

  return (
    <div className="manage-sheet-overlay" onClick={onClose}>
      <div className="manage-sheet-container" onClick={(e) => e.stopPropagation()}>
        {/* Drag Handle */}
        <div className="manage-sheet-handle-area">
          <div className="manage-sheet-handle"></div>
        </div>

        {/* Header */}
        <div className="manage-sheet-header">
          {currentView !== VIEWS.LIST && (
            <button className="manage-sheet-back" onClick={handleBack}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="manage-sheet-title">{getHeaderTitle()}</h2>
          <button className="manage-sheet-close" onClick={onClose}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="manage-sheet-content">
          {currentView === VIEWS.LIST && (
            <>
              {/* Habit List */}
              {categoryHabits.length === 0 ? (
                <div className="manage-sheet-empty">
                  <p>No habits yet in this category.</p>
                  <p>Create your first one below!</p>
                </div>
              ) : (
                <div className="manage-habit-list">
                  {subcategoryOrder.map(subcat => {
                    const habits = groupedHabits[subcat]
                    if (!habits || habits.length === 0) return null
                    
                    return (
                      <div key={subcat} className="manage-subcategory-group">
                        <div className="manage-subcategory-header">
                          {getSubcategoryDisplayName(subcat)}
                        </div>
                        {habits.map(habit => (
                          <div key={habit.id} className="manage-habit-row">
                            <div className="manage-habit-info">
                              <div className="manage-habit-name">{habit.name}</div>
                              <div className="manage-habit-details">
                                {formatRateDisplay(habit)} · {formatScheduleDisplay(habit)}
                              </div>
                            </div>
                            <div className="manage-habit-actions">
                              <button 
                                className="manage-action-btn edit-btn"
                                onClick={() => handleEdit(habit)}
                              >
                                Edit
                              </button>
                              <button 
                                className="manage-action-btn delete-btn"
                                onClick={() => handleDeleteClick(habit.id)}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add New Button */}
              <button className="manage-add-btn" onClick={handleAddNew}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Fitness Habit
              </button>
            </>
          )}

          {/* Edit/Add Form */}
          {(currentView === VIEWS.EDIT || currentView === VIEWS.ADD) && (
            <FitnessHabitForm
              editHabit={editingHabit}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-confirm-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3>Delete Habit?</h3>
              <p>This will permanently delete this habit and all its logged activity. This cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button className="delete-confirm-cancel" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="delete-confirm-delete" onClick={handleConfirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
