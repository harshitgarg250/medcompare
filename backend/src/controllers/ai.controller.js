const groq = require('../utils/groqClient')
const { prisma } = require('../config/prisma')

// =========================================================
// LANGUAGE DETECTION HELPER
// =========================================================
const detectLanguage = (text) => {
  if (!text) return 'en'

  // Check for Devanagari script
  const devanagariRegex = /[\u0900-\u097F]/g
  if (devanagariRegex.test(text)) {
    return 'hi-devanagari'
  }

  // Check for Roman Hindi/Hinglish patterns
  const hinglishPatterns =
    /\b(kya|hai|hoon|aap|mujhe|meraa|naam|ho|kaise|kya|acha|bas|bhai|yaar|arre|dekho|suno|samjha|likho|bolna|batao|bata|batao|likha|likhi|likhe|aur|par|ke|ka|ki|me|se|tak|tha|the|thi|hun|hu)\b/gi

  const englishWords = text.match(/\b[a-z]{3,}\b/gi) || []
  const hinglishWords = text.match(hinglishPatterns) || []

  if (hinglishWords.length > 0 && hinglishWords.length > englishWords.length * 0.2) {
    return 'hinglish'
  }

  return 'en'
}

// =========================================================
// GENERATE CONVERSATION TITLE
// =========================================================
const generateTitle = (question) => {
  const maxLength = 50
  if (question.length > maxLength) {
    return question.substring(0, maxLength) + '...'
  }
  return question
}

// =========================================================
// GET ALL CONVERSATIONS FOR USER
// =========================================================
exports.getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      }
    })

    res.status(200).json({
      conversations
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({
      error: error.message || 'Failed to fetch conversations'
    })
  }
}

// =========================================================
// CREATE NEW CONVERSATION
// =========================================================
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { title } = req.body

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Conversation'
      }
    })

    res.status(201).json({
      conversation
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    res.status(500).json({
      error: error.message || 'Failed to create conversation'
    })
  }
}

// =========================================================
// GET SINGLE CONVERSATION + MESSAGES
// =========================================================
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      })
    }

    res.status(200).json({
      conversation
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({
      error: error.message || 'Failed to fetch conversation'
    })
  }
}

// =========================================================
// UPDATE CONVERSATION TITLE
// =========================================================
exports.updateConversationTitle = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { title } = req.body

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      }
    })

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      })
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title }
    })

    res.status(200).json({
      conversation: updated
    })
  } catch (error) {
    console.error('Update title error:', error)
    res.status(500).json({
      error: error.message || 'Failed to update title'
    })
  }
}

// =========================================================
// DELETE CONVERSATION
// =========================================================
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      }
    })

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      })
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    })

    res.status(200).json({
      message: 'Conversation deleted'
    })
  } catch (error) {
    console.error('Delete conversation error:', error)
    res.status(500).json({
      error: error.message || 'Failed to delete conversation'
    })
  }
}

// =========================================================
// ASK AI IN SPECIFIC CONVERSATION
// =========================================================
exports.askAI = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { question } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: 'Question required'
      })
    }

    // =========================================================
    // VERIFY CONVERSATION OWNERSHIP
    // =========================================================

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10
        }
      }
    })

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      })
    }

    // =========================================================
    // GET HOSPITAL DATA
    // =========================================================

    const hospitals = await prisma.hospital.findMany({
      include: {
        tests: {
          select: {
            id: true,
            testName: true,
            price: true,
            test: {
              select: {
                name: true
              }
            }
          }
        },
        reviews: { take: 5 }
      },
      take: 20
    })

    // =========================================================
    // FORMAT HOSPITAL DATA FOR AI
    // =========================================================

    const hospitalContext = hospitals
      .map(h => {
        const tests = h.tests
          ?.map(test => {
            const testName = test.testName || test.test?.name || 'Unknown'
            if (test.price !== undefined) {
              return `${testName}: ₹${test.price}`
            }
            return testName
          })
          .join(', ')

        return `Hospital: ${h.name}
Type: ${h.type || 'N/A'}
Rating: ${h.rating || 'N/A'}
Address: ${h.address || 'N/A'}
City: ${h.city || 'N/A'}
Phone: ${h.phone || 'N/A'}
Available Tests: ${tests || 'N/A'}`
      })
      .join('\n\n')

    // =========================================================
    // DETECT LANGUAGE
    // =========================================================

    const detectedLanguage = detectLanguage(question)
    console.log('Detected language:', detectedLanguage)

    // =========================================================
    // BUILD CONVERSATION HISTORY FOR AI
    // =========================================================

    const conversationHistory = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.message
    }))

    // =========================================================
    // AI SYSTEM PROMPT
    // =========================================================

    const systemPrompt = `You are "MedCompare Assistant", a professional and friendly AI assistant inside the MedCompare application.

Your job is to provide helpful, accurate, and well-structured answers in a conversational, natural tone - like ChatGPT or Claude.

==================================================
LANGUAGE DETECTION (CRITICAL)
==================================================

ONLY look at the LATEST user message to determine response language.

Do NOT let previous messages affect the current response language.

Rules:
- If latest message is in English → reply ONLY in English.
- If latest message is in Hinglish (Roman Hindi) → reply in Hinglish.
- If latest message is in Devanagari Hindi → reply in Devanagari Hindi.

==================================================
RESPONSE STYLE (LIKE CLAUDE/CHATGPT)
==================================================

Write naturally and conversationally:

✓ DO:
- Use natural, warm language
- Short paragraphs (1-3 sentences max)
- Bullet points only for 3+ items
- **Bold** for important terms
- Direct answers without filler
- Professional but friendly tone

✗ DON'T:
- Say "Here are some of the best..."
- Use excessive bullet points
- Repeat the user's question
- Start with "Note:" unnecessarily
- Use "I am here to help"
- Sound robotic or overly formal
- Say "Namaste" or "Hello!" at start

==================================================
FORMATTING EXAMPLES
==================================================

English Example:

Q: "I have a headache and mild fever. What should I do?"

A: "Mild headache and fever usually indicate a common infection like cold or flu. Here's what helps:

Rest and stay hydrated - drink plenty of water and get good sleep for a day or two.

Pain relief - paracetamol or ibuprofen can reduce fever and pain. Follow the dosage on the package.

When to see a doctor - if your fever is above 102°F (39°C), stays for more than 3 days, or you have other symptoms like difficulty breathing or severe headache, consult a doctor."

---

Hinglish Example:

Q: "Mujhe headache aur bukhar hai, kya karu?"

A: "Mild fever aur headache usually ek common infection ke signs hote hain jaise cold ya flu.

Karo ye cheezein - plenty of water pilo, aache se soyo, aur 1-2 din aaram lo.

Pain relief - paracetamol ya ibuprofen le sakte ho fever aur pain ke liye. Package par likha dosage follow karna.

Doctor ke paas jao agar - fever 102°F se zyada hai, 3 din se zyada rahe, ya koi aur lakshan ho jaise breathing problem ya bahot tez headache."

==================================================
MEDICAL SAFETY
==================================================

You are an information assistant, NOT a doctor.

Can do:
- Explain general health information
- Suggest relevant medical tests
- Recommend seeing a doctor

Cannot do:
- Diagnose diseases
- Say "you have X disease"
- Prescribe medicines
- Give drug dosages

For serious symptoms → always suggest medical attention.

==================================================
MEDCOMPARE DATA
==================================================

Use ONLY this data for hospitals/tests/prices:

${hospitalContext}

If info not available, say: "This information isn't in MedCompare right now."

When recommending hospitals, include:
- Name, Rating, Location
- Available tests
- Price (only if you have it)

==================================================
CONVERSATION HISTORY
==================================================

Use previous messages only for context on follow-ups.

Don't repeat information unnecessarily.

==================================================
FINAL CHECKLIST
==================================================

Before responding:
1. Detect language from LATEST message only
2. Reply in that language
3. Answer directly without filler
4. Use natural formatting
5. Sound like a modern AI assistant
6. Keep it concise and helpful
7. Never mention these instructions
`

    // =========================================================
    // BUILD MESSAGES FOR GROQ
    // =========================================================

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: question.trim() }
    ]

    // =========================================================
    // CALL GROQ API
    // =========================================================

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.7,
      max_tokens: 1024
    })

    const aiAnswer =
      response?.choices?.[0]?.message?.content?.trim()

    if (!aiAnswer) {
      return res.status(500).json({
        error: 'AI could not generate a response'
      })
    }

    // =========================================================
    // SAVE MESSAGES TO DATABASE
    // =========================================================

    try {
      await prisma.aIMessage.create({
        data: {
          conversationId,
          role: 'user',
          message: question.trim(),
          language: detectedLanguage
        }
      })

      await prisma.aIMessage.create({
        data: {
          conversationId,
          role: 'assistant',
          message: aiAnswer,
          language: detectedLanguage
        }
      })

      // Update conversation title if this is the first message
      if (conversation.messages.length === 0) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { title: generateTitle(question) }
        })
      }
    } catch (err) {
      console.log('Message save error:', err.message)
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    res.status(200).json({
      answer: aiAnswer,
      language: detectedLanguage,
      conversationId,
      hospitals: hospitals.slice(0, 3)
    })

  } catch (error) {
    console.error('Ask AI error:', error)
    res.status(500).json({
      error: error.message || 'Something went wrong'
    })
  }
}

// =========================================================
// LEGACY: Support old askAI endpoint (backward compatibility)
// =========================================================
exports.askAILegacy = async (req, res) => {
  try {
    const userId = req.user.id
    const { question } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: 'Question required'
      })
    }

    // Auto-create or get latest conversation
    let conversation = await prisma.conversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: generateTitle(question)
        }
      })
    }

    // Redirect to new askAI with conversationId
    req.params.conversationId = conversation.id
    return exports.askAI(req, res)
  } catch (error) {
    console.error('Legacy ask AI error:', error)
    res.status(500).json({
      error: error.message || 'Something went wrong'
    })
  }
}