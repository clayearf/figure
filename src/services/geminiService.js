const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

function makeStylePrompt(style = 'chibi', basePrompt = '') {
  const styles = {
    chibi: {
      system: 'Transform this portrait into a cute chibi figure style, highly stylized, big head, small body, clean silhouette, soft colors, friendly expression, high detail.',
      extra: 'Keep the person recognizable but stylized into a collectible toy figure.'
    },
    ghibli: {
      system: 'Transform this portrait into a whimsical Studio Ghibli-inspired figure style, warm colors, soft painterly lighting, handcrafted feel, gentle expression, detailed environment, bright and cozy.',
      extra: 'Retain likeness while making it feel magical and storybook-like.'
    },
    pixar: {
      system: 'Transform this portrait into a polished Pixar-like 3D animated figure, expressive face, clean lighting, vibrant colors, toy-like proportions, cinematic rendering, charming personality.',
      extra: 'Keep it cute, cinematic and highly polished.'
    },
    realistic: {
      system: 'Transform this portrait into a realistic premium collectible figure with clean face proportions, natural skin tones, crisp lighting, high-quality sculpted details.',
      extra: 'Preserve identity and realism while making it a premium collectible figure.'
    }
  };

  const preset = styles[style] || styles.chibi;
  return `${preset.system} ${preset.extra} ${basePrompt || ''}`.trim();
}

async function generateFigureFromImage({ imageBuffer, mimeType, style, prompt }) {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const finalPrompt = makeStylePrompt(style, prompt);

  const response = await ai.models.generateContent({
    model: config.geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          { text: finalPrompt },
          {
            inlineData: {
              mimeType,
              data: imageBuffer.toString('base64')
            }
          }
        ]
      }
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE']
    }
  });

  const imagePart = response?.candidates?.[0]?.content?.parts?.find(part => part.inlineData || part.image);
  const textPart = response?.candidates?.[0]?.content?.parts?.find(part => part.text);

  return {
    text: textPart?.text || 'Generated successfully',
    imageBase64: imagePart?.inlineData?.data || null,
    mimeType: imagePart?.inlineData?.mimeType || mimeType,
  };
}

module.exports = {
  generateFigureFromImage,
  makeStylePrompt,
};
