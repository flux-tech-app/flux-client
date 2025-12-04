# Flux AI Chat - Technical Implementation Architecture
**Complete integration plan for React app**
**Date:** November 26, 2025

---

## SYSTEM OVERVIEW

```
User Input (Chat UI)
    ↓
Claude API Service (with System Prompt)
    ↓
Response Parser (Extract JSON + Text)
    ↓
Action Executor (Execute via HabitContext)
    ↓
UI Update (Show result + update state)
```

---

## FILE STRUCTURE

```
src/
├── services/
│   ├── claudeAPI.js           # NEW - API calls to Claude
│   └── actionExecutor.js      # NEW - Execute parsed actions
├── utils/
│   ├── responseParser.js      # NEW - Parse Claude responses
│   └── conversationManager.js # NEW - Manage conversation state
├── context/
│   ├── HabitContext.jsx       # EXISTING - Update with new methods
│   └── FluxChatContext.jsx    # UPDATE - Add conversation state
├── components/
│   └── FluxChat/
│       ├── FluxChat.jsx       # UPDATE - Connect to API
│       ├── FluxChat.css       # EXISTING
│       ├── MessageList.jsx    # NEW - Display messages
│       ├── MessageInput.jsx   # NEW - Input field
│       └── index.js           # UPDATE
└── constants/
    └── systemPrompt.js        # NEW - Store system prompt
```

---

## IMPLEMENTATION PHASES

### Phase 1: API Service Layer (Days 1-2)
Build the foundation for talking to Claude API

### Phase 2: Response Parsing (Day 3)
Extract conversational text and action JSON from responses

### Phase 3: Action Execution (Days 4-5)
Connect parsed actions to HabitContext methods

### Phase 4: UI Integration (Days 6-7)
Update FluxChat component with full conversation flow

### Phase 5: Testing & Refinement (Days 8-10)
Test all flows, handle edge cases, polish UX

---

## PHASE 1: API SERVICE LAYER

### File: `src/services/claudeAPI.js`

```javascript
/**
 * Claude API Service
 * Handles all communication with Anthropic API
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY; // Store in .env
const MODEL = 'claude-sonnet-4-20250514';

// Import system prompt
import { FLUX_SYSTEM_PROMPT } from '../constants/systemPrompt';

/**
 * Send message to Claude and get response
 * @param {Array} messages - Conversation history
 * @param {Object} context - User data context
 * @returns {Promise<Object>} - Claude's response
 */
export async function sendMessage(messages, context) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(context),
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content[0].text,
      usage: data.usage
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Build system prompt with user context
 * @param {Object} context - User data (habits, logs, balances)
 * @returns {String} - Complete system prompt
 */
function buildSystemPrompt(context) {
  const contextJSON = JSON.stringify({
    user: {
      name: context.user?.name || 'there',
      habits: context.habits || [],
      recentLogs: context.recentLogs || [],
      balances: context.balances || {}
    }
  }, null, 2);

  return `${FLUX_SYSTEM_PROMPT}

## CURRENT USER CONTEXT

${contextJSON}

Use this context to:
- Reference existing habits by name
- Calculate accurate balances and streaks
- Avoid duplicate habit names
- Provide personalized insights
`;
}

/**
 * Streaming response (Phase 2 enhancement)
 * For real-time typing effect
 */
export async function sendMessageStreaming(messages, context, onChunk) {
  // TODO: Implement streaming for better UX
  // Uses same endpoint with stream: true
}
```

---

### File: `src/constants/systemPrompt.js`

```javascript
/**
 * Flux AI System Prompt
 * Complete instructions for Claude's behavior
 */

export const FLUX_SYSTEM_PROMPT = `
[PASTE COMPLETE SYSTEM PROMPT FROM FLUX-SYSTEM-PROMPT-V1.md HERE]
`;
```

---

### File: `.env.local` (Create this, add to .gitignore)

```
VITE_CLAUDE_API_KEY=sk-ant-api03-GpI2IsTCXYiSoRfZqiFPdZQmYNfj2xRo9h40E6-6EiYbzEUjjaQhgiFB0s20c49krd8X_mtbkLpH4daQG0anrw-szm70wAA
```

**CRITICAL:** Never commit API keys to Git. Add `.env.local` to `.gitignore`.

---

## PHASE 2: RESPONSE PARSING

### File: `src/utils/responseParser.js`

```javascript
/**
 * Response Parser
 * Extracts conversational text and action JSON from Claude responses
 */

/**
 * Parse Claude's response into text and action
 * @param {String} content - Raw response from Claude
 * @returns {Object} - {conversationalText, actionIntent}
 */
export function parseResponse(content) {
  try {
    // Strategy 1: Look for JSON in code blocks
    const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      const conversationalText = content.replace(/```json[\s\S]*?```/, '').trim();
      const actionIntent = JSON.parse(jsonBlockMatch[1]);
      return { conversationalText, actionIntent };
    }

    // Strategy 2: Look for JSON object (starts with {, ends with })
    const jsonMatch = content.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonStart = content.indexOf(jsonMatch[0]);
      const conversationalText = content.substring(0, jsonStart).trim();
      const actionIntent = JSON.parse(jsonMatch[0]);
      return { conversationalText, actionIntent };
    }

    // Strategy 3: No JSON found - pure conversation
    return {
      conversationalText: content.trim(),
      actionIntent: {
        mode: 'chat_only',
        action: 'none',
        data: {}
      }
    };
  } catch (error) {
    console.error('Response parsing error:', error);
    // Fallback: treat as plain text
    return {
      conversationalText: content,
      actionIntent: {
        mode: 'chat_only',
        action: 'none',
        data: {}
      }
    };
  }
}

/**
 * Validate action intent has required fields
 * @param {Object} actionIntent - Parsed action object
 * @returns {Boolean} - Is valid
 */
export function validateActionIntent(actionIntent) {
  if (!actionIntent.mode || !actionIntent.action) {
    return false;
  }

  // Validate based on action type
  switch (actionIntent.action) {
    case 'create_habit':
      return validateCreateHabit(actionIntent.data);
    case 'log_activity':
      return validateLogActivity(actionIntent.data);
    case 'collect_field':
      return actionIntent.data.field !== undefined;
    default:
      return true;
  }
}

function validateCreateHabit(data) {
  const required = ['habitType', 'habitName', 'category', 'rateStructure', 'transferAmount', 'schedule'];
  return required.every(field => data[field] !== undefined && data[field] !== null);
}

function validateLogActivity(data) {
  return data.habitName !== undefined && data.isFailure !== undefined;
}
```

---

## PHASE 3: ACTION EXECUTION

### File: `src/services/actionExecutor.js`

```javascript
/**
 * Action Executor
 * Executes parsed actions by calling HabitContext methods
 */

/**
 * Execute action intent
 * @param {Object} actionIntent - Parsed action from Claude
 * @param {Object} habitContext - HabitContext methods
 * @param {Object} conversationState - Current conversation state
 * @returns {Object} - Execution result
 */
export async function executeAction(actionIntent, habitContext, conversationState) {
  const { action, data, mode } = actionIntent;

  switch (action) {
    case 'create_habit':
      return await createHabit(data, habitContext);

    case 'log_activity':
      return await logActivity(data, habitContext);

    case 'collect_field':
      return collectField(data, conversationState);

    case 'query_data':
      return queryData(data, habitContext);

    case 'update_log':
      return updateLog(data, habitContext);

    case 'delete_log':
      return deleteLog(data, habitContext);

    case 'clarify':
    case 'none':
      return { success: true, requiresInput: true };

    default:
      return { success: false, error: 'Unknown action type' };
  }
}

/**
 * Create habit from collected fields
 */
async function createHabit(data, habitContext) {
  try {
    const habit = {
      name: data.habitName,
      type: data.habitType.toLowerCase(), // 'BUILD' -> 'build'
      category: data.category,
      amount: data.transferAmount,
      rateType: data.rateStructure, // 'flat' or 'per_unit'
      measurementType: data.measurementType, // 'duration', 'count', 'distance' or null
      measurementUnit: data.measurementUnit, // 'minutes', 'reps', 'miles' or null
      schedule: data.schedule
    };

    const createdHabit = habitContext.addHabit(habit);
    
    return {
      success: true,
      habitId: createdHabit.id,
      message: `Created habit: ${habit.name}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Log activity (completion or failure)
 */
async function logActivity(data, habitContext) {
  try {
    // Find habit by name
    const habit = habitContext.habits.find(h => 
      h.name.toLowerCase() === data.habitName.toLowerCase()
    );

    if (!habit) {
      return {
        success: false,
        error: `Habit "${data.habitName}" not found`
      };
    }

    // Calculate earnings
    let earnings = 0;
    if (!data.isFailure) {
      if (habit.rateType === 'flat') {
        earnings = habit.amount;
      } else if (habit.rateType === 'per_unit' && data.value) {
        earnings = habit.amount * data.value;
      }
    }

    // Create log
    const log = {
      habitId: habit.id,
      date: new Date().toISOString().split('T')[0],
      isFailure: data.isFailure || false,
      value: data.value || null,
      unit: data.unit || null,
      totalEarnings: earnings
    };

    const createdLog = habitContext.addLog(log);

    return {
      success: true,
      logId: createdLog.id,
      earnings: earnings,
      message: data.isFailure ? 'Logged failure' : 'Logged completion'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Collect field during multi-turn conversation
 */
function collectField(data, conversationState) {
  // Update conversation state with collected field
  return {
    success: true,
    field: data.field,
    value: data.value,
    partialHabit: data.partialHabit,
    requiresInput: true
  };
}

/**
 * Query data (balances, stats, etc.)
 */
function queryData(data, habitContext) {
  const { queryType, filters } = data;

  switch (queryType) {
    case 'balance':
      return {
        success: true,
        data: {
          transferred: habitContext.getTransferredBalance(),
          pending: habitContext.getPendingBalance(),
          thisWeek: habitContext.getWeekEarnings()
        }
      };

    case 'weekly_summary':
      // Build summary from habits and logs
      const summary = habitContext.habits.map(habit => {
        const stats = habitContext.getHabitStats(habit.id);
        return {
          name: habit.name,
          type: habit.type,
          ...stats
        };
      });
      return {
        success: true,
        data: summary
      };

    default:
      return {
        success: true,
        data: {}
      };
  }
}

/**
 * Update existing log
 */
function updateLog(data, habitContext) {
  // Find most recent log for the habit
  const habit = habitContext.habits.find(h => 
    h.name.toLowerCase() === data.habitName.toLowerCase()
  );

  if (!habit) {
    return { success: false, error: 'Habit not found' };
  }

  const logs = habitContext.getHabitLogs(habit.id);
  const mostRecentLog = logs[logs.length - 1];

  if (!mostRecentLog) {
    return { success: false, error: 'No logs to update' };
  }

  // Recalculate earnings with new value
  const newValue = data.updates.value;
  const newEarnings = habit.rateType === 'per_unit' 
    ? habit.amount * newValue 
    : habit.amount;

  habitContext.updateLog(mostRecentLog.id, {
    ...data.updates,
    totalEarnings: newEarnings
  });

  return {
    success: true,
    newEarnings,
    message: 'Log updated'
  };
}

/**
 * Delete log
 */
function deleteLog(data, habitContext) {
  // Implementation similar to updateLog
  // Find and delete specified log
  return { success: true };
}
```

---

## PHASE 4: CONVERSATION MANAGER

### File: `src/utils/conversationManager.js`

```javascript
/**
 * Conversation Manager
 * Manages conversation state across multiple turns
 */

/**
 * Initialize conversation state
 */
export function initConversationState() {
  return {
    mode: null, // 'creating_habit', 'logging_activity', 'querying_info', etc.
    partialHabit: {}, // Fields collected so far
    fieldsCollected: [],
    lastAction: null,
    conversationHistory: [] // Last 15 messages
  };
}

/**
 * Update conversation state after action
 */
export function updateConversationState(currentState, actionIntent, executionResult) {
  const newState = { ...currentState };

  // Update mode
  newState.mode = actionIntent.mode;
  newState.lastAction = actionIntent.action;

  // If collecting fields, update partial habit
  if (actionIntent.action === 'collect_field' && actionIntent.data.partialHabit) {
    newState.partialHabit = actionIntent.data.partialHabit;
    if (!newState.fieldsCollected.includes(actionIntent.data.field)) {
      newState.fieldsCollected.push(actionIntent.data.field);
    }
  }

  // If habit created, reset partial data
  if (actionIntent.action === 'create_habit' && executionResult.success) {
    newState.partialHabit = {};
    newState.fieldsCollected = [];
    newState.mode = null;
  }

  return newState;
}

/**
 * Build context object for API call
 */
export function buildContextForAPI(habitContext, conversationState) {
  return {
    user: {
      name: habitContext.user?.name || 'there',
      habits: habitContext.habits.map(h => ({
        id: h.id,
        name: h.name,
        type: h.type,
        category: h.category,
        amount: h.amount,
        rateType: h.rateType,
        schedule: h.schedule
      })),
      recentLogs: habitContext.logs.slice(-10),
      balances: {
        transferred: habitContext.getTransferredBalance(),
        pending: habitContext.getPendingBalance(),
        thisWeek: habitContext.getWeekEarnings()
      }
    },
    conversationState: {
      mode: conversationState.mode,
      partialHabit: conversationState.partialHabit,
      fieldsCollected: conversationState.fieldsCollected
    }
  };
}

/**
 * Format messages for Claude API
 */
export function formatMessagesForAPI(conversationHistory) {
  return conversationHistory.map(msg => ({
    role: msg.role, // 'user' or 'assistant'
    content: msg.content
  }));
}
```

---

## PHASE 5: FLUX CHAT CONTEXT UPDATE

### File: `src/context/FluxChatContext.jsx` (UPDATE)

```javascript
import { createContext, useContext, useState } from 'react';
import { initConversationState } from '../utils/conversationManager';

const FluxChatContext = createContext();

export function FluxChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // NEW: Conversation state
  const [messages, setMessages] = useState([]);
  const [conversationState, setConversationState] = useState(initConversationState());
  const [isLoading, setIsLoading] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(prev => !prev);

  // NEW: Add message to conversation
  const addMessage = (role, content) => {
    const message = {
      id: `${Date.now()}-${Math.random()}`,
      role, // 'user' or 'assistant'
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  // NEW: Update conversation state
  const updateState = (newState) => {
    setConversationState(newState);
  };

  // NEW: Clear conversation
  const clearConversation = () => {
    setMessages([]);
    setConversationState(initConversationState());
  };

  return (
    <FluxChatContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      openChat, 
      closeChat, 
      toggleChat,
      messages,
      addMessage,
      conversationState,
      updateState,
      isLoading,
      setIsLoading,
      clearConversation
    }}>
      {children}
    </FluxChatContext.Provider>
  );
}

export function useFluxChat() {
  const context = useContext(FluxChatContext);
  if (!context) {
    throw new Error('useFluxChat must be used within FluxChatProvider');
  }
  return context;
}
```

---

## PHASE 6: FLUX CHAT COMPONENT UPDATE

### File: `src/components/FluxChat/FluxChat.jsx` (MAJOR UPDATE)

```javascript
import { useState, useRef, useEffect } from 'react';
import { useFluxChat } from '../../context/FluxChatContext';
import { useHabits } from '../../context/HabitContext';
import { sendMessage } from '../../services/claudeAPI';
import { parseResponse, validateActionIntent } from '../../utils/responseParser';
import { executeAction } from '../../services/actionExecutor';
import { 
  buildContextForAPI, 
  formatMessagesForAPI, 
  updateConversationState 
} from '../../utils/conversationManager';
import './FluxChat.css';

export default function FluxChat() {
  const { 
    isOpen, 
    closeChat, 
    messages, 
    addMessage, 
    conversationState, 
    updateState,
    isLoading,
    setIsLoading
  } = useFluxChat();
  
  const habitContext = useHabits();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI
    addMessage('user', userMessage);

    try {
      // Build context from current state
      const context = buildContextForAPI(habitContext, conversationState);
      
      // Format message history for API
      const formattedMessages = formatMessagesForAPI([
        ...messages,
        { role: 'user', content: userMessage }
      ]);

      // Send to Claude
      const response = await sendMessage(formattedMessages, context);

      if (!response.success) {
        throw new Error(response.error);
      }

      // Parse response
      const { conversationalText, actionIntent } = parseResponse(response.content);

      // Add Flux's response to UI
      addMessage('assistant', conversationalText);

      // Validate and execute action
      if (validateActionIntent(actionIntent)) {
        const executionResult = await executeAction(
          actionIntent, 
          habitContext, 
          conversationState
        );

        // Update conversation state
        const newState = updateConversationState(
          conversationState,
          actionIntent,
          executionResult
        );
        updateState(newState);

        // Log execution result for debugging
        console.log('Action executed:', executionResult);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', 
        "I'm having trouble connecting right now. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flux-chat-container">
      <div className="flux-chat-header">
        <div className="flux-avatar">F</div>
        <div className="header-title">
          <h1>Flux</h1>
          <p>Your accountability coach</p>
        </div>
        <button className="close-button" onClick={closeChat}>×</button>
      </div>

      <div className="flux-chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.role}`}
          >
            {message.role === 'assistant' && (
              <div className="message-avatar">F</div>
            )}
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">F</div>
            <div className="message-content typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flux-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## ERROR HANDLING STRATEGY

### API Errors
- Network failure → Show retry option
- Rate limit → Queue messages, show "Flux is thinking..."
- Invalid API key → Show setup instructions

### Parsing Errors
- Malformed JSON → Treat as pure conversation
- Missing required fields → Ask Claude to clarify

### Execution Errors
- Habit not found → Ask Claude to clarify which habit
- Invalid data → Validate before sending to HabitContext

---

## TESTING STRATEGY

### Unit Tests
- Test `parseResponse()` with various Claude outputs
- Test `executeAction()` with each action type
- Test `validateActionIntent()` with valid/invalid data

### Integration Tests
- Full conversation flow: create habit end-to-end
- Multi-turn conversation state management
- Error recovery scenarios

### Manual Testing
- Run all console test scenarios in live app
- Test on mobile (keyboard behavior, scroll)
- Test offline/error states

---

## PERFORMANCE OPTIMIZATIONS

### API Call Optimization
- Debounce rapid messages
- Cache system prompt (don't regenerate each call)
- Compress conversation history (keep last 15 messages)

### UI Optimization
- Virtualize message list for long conversations
- Lazy load chat component
- Optimize re-renders with React.memo

---

## NEXT STEPS

1. **Create `.env.local`** with API key (test in Console first)
2. **Build Phase 1** (API Service) - Test with hardcoded messages
3. **Build Phase 2** (Parser) - Test with mock Claude responses
4. **Build Phase 3** (Executor) - Test with HabitContext methods
5. **Build Phase 4** (Conversation Manager) - Test state updates
6. **Build Phase 5** (FluxChat Update) - Integrate everything
7. **Test all Console scenarios** in live app
8. **Polish UX** - Loading states, errors, animations
9. **Deploy** and gather feedback

**Estimated timeline: 7-10 development days**

---

## BUDGET TRACKING

### API Costs (Testing)
- ~$3 per 1M input tokens
- ~$15 per 1M output tokens
- Typical conversation: 2,000 tokens total
- $5 initial credit = ~400 test conversations

### Development Time
- Phase 1-3: 3-4 days (backend foundation)
- Phase 4-5: 3-4 days (UI integration)
- Testing/Polish: 2-3 days
- **Total: 8-11 days**

---

**Ready to start building!**
