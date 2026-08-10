
const groq = require('../utils/groqClient')
const { prisma } = require('../config/prisma')

exports.askAI = async (req, res) => {
  try {
    const { question, hospitalId } = req.body
    const userId = req.user.id

    if (!question) {
      return res.status(400).json({
        error: 'Question required'
      })
    }

    // Get all hospitals with tests for context
    const hospitals = await prisma.hospital.findMany({
      include: {
        tests: true,
        reviews: {
          take: 5
        }
      },
      take: 20
    })

    // Format hospital data for AI context
    const hospitalContext = hospitals
      .map(
        h =>
          `${h.name} (Rating: ${h.rating}, Address: ${h.address}, Phone: ${h.phone || 'N/A'
          })`
      )
      .join('\n')

    // Get conversation history
    let conversationHistory = []

    try {
      const history = await prisma.aIConversation.findMany({
        where: {
          userId
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: 10
      })

      conversationHistory = history.map(h => ({
        role: h.role,
        content: h.message
      }))
    } catch (err) {
      console.log('Conversation history error:', err.message)
    }

    // Build messages
    const messages = [
      {
        role: 'system',
        content: `You are MedCompare's professional AI Medical Assistant.

INSTRUCTIONS:

1. Answer in user's language (Hindi/English).
2. For symptoms: Suggest relevant tests with price ranges.
3. For tests: Explain purpose, procedure and approximate time.
4. For hospitals: Recommend from the available hospital list.
5. NEVER suggest medicines or provide a diagnosis.
6. Always suggest consulting a qualified doctor for diagnosis.
7. Keep answers short but detailed.
8. Use clear sections and bullet points.
9. Mention hospital ratings and available information.
10. Mention test prices when available.
11. Add hospital phone numbers when relevant.

AVAILABLE HOSPITALS:

${hospitalContext}

Be professional, helpful and clear.`
      },

      ...conversationHistory,

      {
        role: 'user',
        content: question
      }
    ]

    // Call Groq AI
    const message = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 800
    })

    const aiAnswer = message.choices[0].message.content

    // Save user message
    try {
      await prisma.aIConversation.create({
        data: {
          userId,
          role: 'user',
          message: question
        }
      })

      // Save AI response
      await prisma.aIConversation.create({
        data: {
          userId,
          role: 'assistant',
          message: aiAnswer
        }
      })
    } catch (err) {
      console.log('Conversation save error:', err.message)
    }

    res.json({
      answer: aiAnswer,
      hospitals: hospitals.slice(0, 3)
    })
  } catch (error) {
    console.error('AI error:', error)

    res.status(500).json({
      error: error.message
    })
  }
}

