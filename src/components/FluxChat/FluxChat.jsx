import { useState, useRef, useEffect } from 'react'
import { useHabits } from '../../context/HabitContext'
import { useFluxChat } from '../../context/FluxChatContext'
import './FluxChat.css'

// Conversation states
const STATES = {
  IDLE: 'idle',
  CREATING_HABIT_NAME: 'creating_habit_name',
  CREATING_HABIT_FREQUENCY: 'creating_habit_frequency',
  CREATING_HABIT_RATE: 'creating_habit_rate',
  CREATING_HABIT_CONFIRM: 'creating_habit_confirm',
  LOGGING_SELECT_HABIT: 'logging_select_habit',
  LOGGING_ENTER_VALUE: 'logging_enter_value',
  RESPONDING: 'responding',
}

export default function FluxChat() {
  const { isOpen, setIsOpen } = useFluxChat()
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [currentState, setCurrentState] = useState(STATES.IDLE)
  const [flowData, setFlowData] = useState({})
  const [viewportHeight, setViewportHeight] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const dragStartY = useRef(0)
  const dragStartTime = useRef(0)
  const scrollPositionRef = useRef(0)

  const {
    habits,
    addHabit,
    addLog,
    addChatLog,
    getWeekEarnings,
    getHabitStats,
  } = useHabits()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens (but don't auto-focus on mobile to avoid keyboard issues)
  useEffect(() => {
    if (isOpen && window.innerWidth > 768) {
      // Only auto-focus on desktop, with preventScroll to avoid zoom
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen])

  // Handle keyboard/viewport changes on mobile using Visual Viewport API
  useEffect(() => {
    if (!isOpen) return

    // Save current scroll position
    scrollPositionRef.current = window.scrollY || window.pageYOffset

    const handleViewportResize = () => {
      if (window.visualViewport) {
        // Use 70% of visual viewport height (accounts for keyboard)
        setViewportHeight(window.visualViewport.height * 0.7)
      } else {
        // Fallback for browsers without Visual Viewport API
        setViewportHeight(window.innerHeight * 0.7)
      }
    }

    // Set initial viewport height
    handleViewportResize()

    // Listen for viewport changes (keyboard opening/closing)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize)
      window.visualViewport.addEventListener('scroll', handleViewportResize)
    } else {
      window.addEventListener('resize', handleViewportResize)
    }

    // Prevent background scroll
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPositionRef.current}px`
    document.body.style.width = '100%'

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize)
        window.visualViewport.removeEventListener('scroll', handleViewportResize)
      } else {
        window.removeEventListener('resize', handleViewportResize)
      }

      // Restore scroll position
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollPositionRef.current)

      setViewportHeight(null)
    }
  }, [isOpen])

  // Handle drag-to-dismiss
  const handleDragStart = (e) => {
    const touch = e.touches?.[0] || e
    dragStartY.current = touch.clientY
    dragStartTime.current = Date.now()
    setIsDragging(true)
  }

  const handleDragMove = (e) => {
    if (!isDragging) return

    const touch = e.touches?.[0] || e
    const deltaY = touch.clientY - dragStartY.current

    // Only allow dragging down (positive deltaY)
    if (deltaY > 0) {
      setDragOffset(deltaY)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    const dragDuration = Date.now() - dragStartTime.current
    const velocity = dragOffset / dragDuration

    // Close if dragged down more than 150px or fast swipe down
    if (dragOffset > 150 || velocity > 0.5) {
      handleCloseChat()
    }

    // Reset drag state
    setDragOffset(0)
    setIsDragging(false)
  }

  // Add message helper
  const addMessage = (content, sender = 'flux', showOptions = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        content,
        sender,
        timestamp: new Date().toISOString(),
        showOptions,
      },
    ])
  }

  // Reset conversation
  const resetConversation = () => {
    setCurrentState(STATES.IDLE)
    setFlowData({})
  }

  // Save chat log when closing (if there are messages)
  const saveChatLog = () => {
    if (messages.length === 0) return

    // Generate a title based on the conversation
    let title = 'Chat session'
    const userMessages = messages.filter(m => m.sender === 'user')

    if (userMessages.length > 0) {
      const firstUserMsg = userMessages[0].content.toLowerCase()
      if (firstUserMsg.includes('create') || firstUserMsg.includes('new habit')) {
        title = 'Created new habit'
      } else if (firstUserMsg.includes('log') || firstUserMsg.includes('completed')) {
        title = 'Logged activity'
      } else if (firstUserMsg.includes('progress') || firstUserMsg.includes('status')) {
        title = 'Checked progress'
      }
    }

    // Generate conversation preview
    const conversationText = messages
      .map(m => `${m.sender === 'user' ? 'You' : 'Flux'}: ${m.content}`)
      .join('\n\n')

    // Save to activity feed with relatedLogId if this chat resulted in logging an activity
    addChatLog({
      title,
      conversation: conversationText,
      preview: messages[0]?.content || 'Chat conversation',
      relatedLogId: flowData.completedLogId || null, // Link to the log if one was created
    })
  }

  // Close chat and save log
  const handleCloseChat = () => {
    saveChatLog()
    setIsOpen(false)
    // Reset conversation state
    setMessages([])
    resetConversation()
  }

  // Handle quick action chips
  const handleQuickAction = (action) => {
    setUserInput(action)
    handleSendMessage(action)
  }

  // Handle option button clicks
  const handleOptionClick = (option) => {
    addMessage(option.label, 'user')
    if (option.action) {
      option.action()
    }
  }

  // Process user input based on current state
  const handleSendMessage = (text = userInput) => {
    if (!text.trim()) return

    // Add user message
    if (text === userInput) {
      addMessage(text, 'user')
      setUserInput('')
    }

    const input = text.toLowerCase().trim()

    switch (currentState) {
      case STATES.IDLE:
        handleIdleState(input)
        break
      case STATES.CREATING_HABIT_NAME:
        handleHabitName(text)
        break
      case STATES.CREATING_HABIT_FREQUENCY:
        handleHabitFrequency(text)
        break
      case STATES.CREATING_HABIT_RATE:
        handleHabitRate(text)
        break
      case STATES.LOGGING_ENTER_VALUE:
        handleLogValue(text)
        break
      default:
        break
    }
  }

  // Handle IDLE state - detect triggers
  const handleIdleState = (input) => {
    // Create habit triggers
    if (
      input.includes('add new habit') ||
      input.includes('create habit') ||
      input.includes('new habit')
    ) {
      setCurrentState(STATES.CREATING_HABIT_NAME)
      addMessage("I can help you create a new habit! What would you like to start doing?")
      return
    }

    // Log activity triggers
    if (
      input.includes('log activity') ||
      input.includes('log workout') ||
      input.includes('completed')
    ) {
      if (habits.length === 0) {
        addMessage("You don't have any habits yet. Want to create one?", 'flux', [
          { label: 'Yes, create a habit', action: () => handleQuickAction('add new habit') },
          { label: 'No, thanks', action: resetConversation }
        ])
        return
      }
      setCurrentState(STATES.LOGGING_SELECT_HABIT)
      addMessage("Which habit did you complete?", 'flux', 
        habits.map(habit => ({
          label: habit.name,
          action: () => handleHabitSelection(habit)
        }))
      )
      return
    }

    // Portfolio status triggers
    if (
      input.includes('how am i doing') ||
      input.includes('show progress') ||
      input.includes('portfolio status')
    ) {
      handlePortfolioStatus()
      return
    }

    // Unknown input
    addMessage(
      "I can help you with:\n• Creating new habits\n• Logging activities\n• Checking your progress\n\nWhat would you like to do?"
    )
  }

  // Create Habit Flow
  const handleHabitName = (name) => {
    setFlowData({ ...flowData, name })
    setCurrentState(STATES.CREATING_HABIT_FREQUENCY)
    addMessage(`Great! How many days per week do you want to ${name.toLowerCase()}?`)
  }

  const handleHabitFrequency = (input) => {
    const frequency = parseInt(input)
    if (isNaN(frequency) || frequency < 1 || frequency > 7) {
      addMessage("Please enter a number between 1 and 7.")
      return
    }
    setFlowData({ ...flowData, frequency })
    setCurrentState(STATES.CREATING_HABIT_RATE)
    addMessage(`Perfect. How much should you earn each time you ${flowData.name.toLowerCase()}?`)
  }

  const handleHabitRate = (input) => {
    const rate = parseFloat(input)
    if (isNaN(rate) || rate <= 0) {
      addMessage("Please enter a positive number.")
      return
    }
    setFlowData({ ...flowData, rate })
    setCurrentState(STATES.CREATING_HABIT_CONFIRM)
    addMessage(
      `✓ Ready to create: ${flowData.name} - $${rate.toFixed(2)}, ${flowData.frequency}x/week. Sound good?`,
      'flux',
      [
        { label: 'Yes, create it', action: handleCreateHabit },
        { label: 'No, start over', action: () => {
          resetConversation()
          addMessage("No problem! Let me know if you want to try again.")
        }}
      ]
    )
  }

  const handleCreateHabit = () => {
    const newHabit = addHabit({
      name: flowData.name,
      type: 'build',
      rateType: 'flat',
      rateAmount: flowData.rate,
      frequency: flowData.frequency,
    })
    
    addMessage(`✓ Created! ${newHabit.name} is now in your portfolio. Start earning by completing it!`)
    resetConversation()
  }

  // Log Activity Flow
  const handleHabitSelection = (habit) => {
    setFlowData({ ...flowData, selectedHabit: habit })
    
    // For flat rate habits, log immediately
    if (habit.rateType === 'flat') {
      handleLogCompletion(habit, 1)
      return
    }

    // For per-minute/per-rep habits, ask for value
    setCurrentState(STATES.LOGGING_ENTER_VALUE)
    const unit = habit.rateType === 'per-minute' ? 'minutes' : 'reps'
    addMessage(`How many ${unit} did you do?`)
  }

  const handleLogValue = (input) => {
    const value = parseFloat(input)
    if (isNaN(value) || value <= 0) {
      addMessage("Please enter a positive number.")
      return
    }
    handleLogCompletion(flowData.selectedHabit, value)
  }

  const handleLogCompletion = (habit, value) => {
    const earnings = habit.rateAmount * value

    const newLog = addLog({
      habitId: habit.id,
      value: value,
      totalEarnings: earnings,
    })

    const stats = getHabitStats(habit.id)
    addMessage(
      `✓ Logged! $${earnings.toFixed(2)} earned. You're on a ${stats.currentStreak}-day streak!`
    )

    // Store the log ID in flow data so we can link the chat to this log
    setFlowData({ ...flowData, completedLogId: newLog.id })

    resetConversation()
  }

  // Portfolio Status Query
  const handlePortfolioStatus = () => {
    const weekEarnings = getWeekEarnings()
    
    if (habits.length === 0) {
      addMessage("You haven't created any habits yet. Ready to start your first one?")
      setCurrentState(STATES.RESPONDING)
      return
    }

    let statusMessage = `You've earned $${weekEarnings.toFixed(2)} this week across all habits.\n\n`

    habits.forEach((habit) => {
      const stats = getHabitStats(habit.id)
      statusMessage += `• ${habit.name}: ${stats.totalLogs} completion${stats.totalLogs !== 1 ? 's' : ''}, $${stats.totalEarnings.toFixed(2)} earned\n`
    })

    statusMessage += '\nKeep it up! 🔥'
    addMessage(statusMessage)
    setCurrentState(STATES.RESPONDING)
  }

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button - only show when there are habits */}
      {!isOpen && habits.length > 0 && (
        <button className="flux-chat-button" onClick={() => setIsOpen(true)}>
          <svg width="30" height="30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="flux-chat-overlay" onClick={handleCloseChat}>
          <div
            ref={containerRef}
            className="flux-chat-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              height: viewportHeight ? `${viewportHeight}px` : '70vh',
              maxHeight: viewportHeight ? `${viewportHeight}px` : '70vh',
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            {/* Drag Handle */}
            <div
              className="flux-drag-handle-area"
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <div className="flux-drag-handle"></div>
            </div>

            {/* Header */}
            <div className="flux-chat-header">
              <div className="flux-avatar">F</div>
              <div className="flux-header-title">
                <h1>Flux</h1>
                <p>AI behavior coach</p>
              </div>
              <button className="flux-close-button" onClick={handleCloseChat}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flux-messages-area">
              {/* Quick Actions (only show in IDLE state) */}
              {currentState === STATES.IDLE && messages.length === 0 && (
                <div className="flux-suggested-actions">
                  <div className="flux-suggested-actions-label">Quick actions</div>
                  <div className="flux-suggestions-grid">
                    <div className="flux-suggestion-chip" onClick={() => handleQuickAction('log activity')}>
                      Log activity
                    </div>
                    <div className="flux-suggestion-chip" onClick={() => handleQuickAction('add new habit')}>
                      Add new habit
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div key={msg.id} className={`flux-message ${msg.sender}-message`}>
                  <div className={`flux-message-avatar ${msg.sender === 'user' ? 'user-avatar' : ''}`}>
                    {msg.sender === 'user' ? 'U' : 'F'}
                  </div>
                  <div className="flux-message-content">
                    {msg.content}
                    {msg.showOptions && (
                      <div className="flux-action-buttons">
                        {msg.showOptions.map((option, idx) => (
                          <button
                            key={idx}
                            className="flux-action-btn"
                            onClick={() => handleOptionClick(option)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flux-input-area">
              <div className="flux-input-container">
                <div className="flux-input-wrapper">
                  <textarea
                    ref={inputRef}
                    className="flux-message-input"
                    placeholder="Message Flux..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows="1"
                    inputMode="text"
                  />
                </div>
                <button
                  className={`flux-send-button ${!userInput.trim() ? 'disabled' : ''}`}
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim()}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
