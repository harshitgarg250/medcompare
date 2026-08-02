const groq = require('../utils/groqClient');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.askAI = async (req, res) => {
  try {
    const { question, hospitalId } = req.body;
    const userId = req.user.id;

    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    // Get all hospitals with tests for context
    const hospitals = await prisma.hospital.findMany({
      include: {
        tests: true,
        reviews: { take: 5 }
      },
      take: 20
    });

    // Format hospital data for AI context
    const hospitalContext = hospitals.map(h => 
      `${h.name} (Rating: ${h.rating}, Address: ${h.address}, Phone: ${h.phone || 'N/A'})`
    ).join('\n');

    // Get conversation history
    let conversationHistory = [];
    try {
      const history = await prisma.aIConversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 10
      });
      conversationHistory = history.map(h => ({
        role: h.role,
        content: h.message
      }));
    } catch (err) {
      // Table doesn't exist yet - will create in Step 2
    }

    // Build messages
    const messages = [
      {
        role: 'system',
        content: `You are MedCompare's professional AI Medical Assistant. 

INSTRUCTIONS:
1. Answer in user's language (Hindi/English)
2. For symptoms: Suggest tests with price ranges
3. For tests: Explain purpose, procedure, time
4. For hospitals: Recommend from available list
5. NEVER suggest medicines or diagnosis
6. Always suggest consulting doctor for diagnosis
7. Keep answers SHORT but DETAILED

AVAILABLE HOSPITALS:
${hospitalContext}

RULES:
- Format with clear sections
- Use bullet points
- Include hospital ratings and distance
- Mention test prices from MedCompare
- Add hospital phone numbers for booking
- Be professional and helpful`
      },
      ...conversationHistory,
      { role: 'user', content: question }
    ];

    // Call Groq AI
    const message = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 800
    });

    const aiAnswer = message.choices[0].message.content;

    // Save conversation
    try {
      await prisma.aIConversation.create({
        data: {
          userId,
          role: 'user',
          message: question
        }
      });

      await prisma.aIConversation.create({
        data: {
          userId,
          role: 'assistant',
          message: aiAnswer
        }
      });
    } catch (err) {
      // Table doesn't exist - will create in Step 2
    }

    res.json({ 
      answer: aiAnswer,
      hospitals: hospitals.slice(0, 3) // Top 3 relevant hospitals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
