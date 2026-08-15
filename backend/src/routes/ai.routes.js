const express = require('express')
const router = express.Router()
const aiController = require('../controllers/ai.controller')
const { protect } = require('../middleware/auth.middleware')

// Protect all routes with auth
router.use(protect)

// =========================================================
// LEGACY ENDPOINT (backward compatibility)
// =========================================================
router.post('/ask', aiController.askAILegacy)

// =========================================================
// CONVERSATION ENDPOINTS (NEW)
// =========================================================

// Get all conversations for user
router.get('/conversations', aiController.getAllConversations)

// Create new conversation
router.post('/conversations', aiController.createConversation)

// Get single conversation with messages
router.get('/conversations/:conversationId', aiController.getConversation)

// Update conversation title
router.put('/conversations/:conversationId/title', aiController.updateConversationTitle)

// Delete conversation
router.delete('/conversations/:conversationId', aiController.deleteConversation)

// Ask AI in specific conversation
router.post('/conversations/:conversationId/ask', aiController.askAI)

module.exports = router