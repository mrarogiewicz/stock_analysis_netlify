import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// --- HOOKS ---
const useStockAnalysisGenerator = () => {
  const [ticker, setTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [generatedSimpleContent, setGeneratedSimpleContent] = useState('');
  const [generatedDetailContent, setGeneratedDetailContent] = useState('');
  const [displayType, setDisplayType] = useState('detail');

  const [generatedForTicker, setGeneratedForTicker] = useState('');
  
  const generateAnalysis = useCallback(async () => {
    if (!ticker.trim()) {
      setError('Please enter a stock ticker');
      return;
    }
    
    setIsLoading(true);
    setError(null);


    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const simpleUrl = 'https://raw.githubusercontent.com/mrarogiewicz/prompts/refs/heads/main/stock_analysis_simple.md';
      const detailUrl = 'https://raw.githubusercontent.com/mrarogiewicz/prompts/refs/heads/main/stock_analysis_detail.md';

      const [simpleResponse, detailResponse] = await Promise.all([
          fetch(simpleUrl),
          fetch(detailUrl)
      ]);

      if (!simpleResponse.ok || !detailResponse.ok) {
        throw new Error(`Failed to fetch prompt templates.`);
      }
      
      const [simpleTemplate, detailTemplate] = await Promise.all([
          simpleResponse.text(),
          detailResponse.text()
      ]);
      
      const finalSimplePrompt = simpleTemplate.replace(/XXX/g, ticker.toUpperCase());
      const finalDetailPrompt = detailTemplate.replace(/XXX/g, ticker.toUpperCase());
      
      setGeneratedSimpleContent(finalSimplePrompt);
      setGeneratedDetailContent(finalDetailPrompt);
      setDisplayType('detail'); // Default to showing detail view
      setGeneratedForTicker(ticker.toUpperCase());
      setTicker(''); // Clear the input field

    } catch (e) {
      console.error(e);
      setError(e.message || 'An error occurred while fetching the prompts.');
    } finally {
      setIsLoading(false);
    }

  }, [ticker]);
  
  const handleSetTicker = (value) => {
    setTicker(value.toUpperCase());
    if (error) setError(null);
  };

  return {
    ticker,
    setTicker: handleSetTicker,
    displayType,
    setDisplayType,
    isLoading,
    error,
    generatedSimpleContent,
    generatedDetailContent,
    generateAnalysis,
    generatedForTicker,
  };
};

// --- ICONS ---
const ChartIcon = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CheckIcon = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const CopyIcon = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const Spinner = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className={`animate-spin ${props.className || ''}`}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// --- COMPONENTS ---
const Header = ({ isTickerPresent }) => {
  return (
    <header className="text-center mb-8">
      <div className="inline-flex items-center justify-center gap-3 mb-4">
        <ChartIcon className={`w-8 h-8 transition-colors duration-300 ${isTickerPresent ? 'text-[#38B6FF]' : 'text-black'}`} />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 whitespace-nowrap">Stock Analysis Generator</h1>
      </div>
    </header>
  );
};

const InputForm = ({ ticker, setTicker, isLoading, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
  const isDisabledAndNotLoading = !isLoading && !ticker.trim();
    
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="tickerInput" className="block text-gray-700 font-medium mb-2 text-center">
          Enter stock ticker
        </label>
        <input
          id="tickerInput"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="e.g., AAPL"
          maxLength={10}
          className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 text-base placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:border-gray-500 outline-none transition duration-200 text-center"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !ticker.trim()}
        className="relative overflow-hidden w-full flex items-center justify-center px-4 py-3 bg-[#38B6FF] text-white font-bold rounded-2xl hover:bg-[#32a3e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#38B6FF] transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Spinner className="w-5 h-5 mr-2" />
            <span>Processing...</span>
          </>
        ) : (
          <span className={isDisabledAndNotLoading ? 'text-transparent' : ''}>Generate</span>
        )}
        {isDisabledAndNotLoading && (
            <div aria-hidden="true" className="bubbles absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bubble"></div>
                ))}
            </div>
        )}
      </button>
    </form>
  );
};

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="mt-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      {message}
    </div>
  );
};

const SuccessDisplay = ({ ticker, content, displayType, onDisplayTypeChange }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPerplexityBusy, setIsPerplexityBusy] = useState(false);
  const [isGeminiBusy, setIsGeminiBusy] = useState(false);
  const [isChatGptBusy, setIsChatGptBusy] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard.');
    }
  }, [content]);

  const perplexityUrl = 'https://perplexity.ai/search';
  const geminiUrl = 'https://gemini.google.com/app';
  const chatGptUrl = 'https://chatgpt.com/';

  const handlePerplexityClick = useCallback(async (e) => {
      e.preventDefault();
      setIsPerplexityBusy(true);

      try {
          await navigator.clipboard.writeText(content);
      } catch (err) {
          console.error('Failed to copy text to clipboard:', err);
      }

      window.open(perplexityUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => setIsPerplexityBusy(false), 2500);
  }, [content]);

  const handleGeminiClick = useCallback(async (e) => {
      e.preventDefault();
      setIsGeminiBusy(true);

      try {
          await navigator.clipboard.writeText(content);
      } catch (err) {
          console.error('Failed to copy text to clipboard for Gemini:', err);
      }

      window.open(geminiUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => setIsGeminiBusy(false), 2500);
  }, [content]);
  
  const handleChatGptClick = useCallback(async (e) => {
      e.preventDefault();
      setIsChatGptBusy(true);

      try {
          await navigator.clipboard.writeText(content);
      } catch (err) {
          console.error('Failed to copy text to clipboard for ChatGPT:', err);
      }

      window.open(chatGptUrl, '_blank', 'noopener,noreferrer');

      setTimeout(() => setIsChatGptBusy(false), 2500);
  }, [content]);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="text-center mb-4">
        <p className="font-medium text-gray-700">
          Analysis for ticker -{' '}
          <span style={{ color: '#38B6FF' }} className="font-bold">
            {ticker}
          </span>
        </p>
      </div>

      <div className="max-w-xs mx-auto flex w-full bg-gray-200/80 rounded-lg p-1 mb-5">
          <button
              type="button"
              onClick={() => onDisplayTypeChange('detail')}
              aria-pressed={displayType === 'detail'}
              className={`w-1/2 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
              displayType === 'detail' ? 'bg-white text-gray-500 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-white/50'
              }`}
          >
              Detail
          </button>
          <button
              type="button"
              onClick={() => onDisplayTypeChange('simple')}
              aria-pressed={displayType === 'simple'}
              className={`w-1/2 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none ${
              displayType === 'simple' ? 'bg-white text-gray-500 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-white/50'
              }`}
          >
              Simple
          </button>
      </div>

      <div className="flex items-center justify-center gap-4 flex-wrap md:flex-nowrap">
        <a
          href={perplexityUrl}
          onClick={handlePerplexityClick}
          target="_blank"
          rel="noopener noreferrer"
          title="Copy & Open in Perplexity"
          className="w-11 h-11 p-1.5 flex items-center justify-center rounded-lg bg-black shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200"
        >
          {isPerplexityBusy ? (
            <CheckIcon className="w-full h-full text-green-500" />
          ) : (
            <img
              src="https://framerusercontent.com/images/gcMkPKyj2RX8EOEja8A1GWvCb7E.jpg"
              alt="Perplexity Logo"
              className="w-full h-full object-contain"
            />
          )}
        </a>
        <a
          href={geminiUrl}
          onClick={handleGeminiClick}
          target="_blank"
          rel="noopener noreferrer"
          title="Copy & Open in Gemini"
          className="w-11 h-11 p-1.5 flex items-center justify-center rounded-lg bg-white shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200"
        >
          {isGeminiBusy ? (
            <CheckIcon className="w-full h-full text-green-500" />
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Google_Gemini_icon_2025.svg/2048px-Google_Gemini_icon_2025.svg.png"
              alt="Gemini Logo"
              className="w-full h-full object-contain"
            />
          )}
        </a>
        <a
          href={chatGptUrl}
          onClick={handleChatGptClick}
          target="_blank"
          rel="noopener noreferrer"
          title="Copy & Open in ChatGPT"
          className="w-11 h-11 p-1.5 flex items-center justify-center rounded-lg bg-white shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200"
        >
          {isChatGptBusy ? (
            <CheckIcon className="w-full h-full text-green-500" />
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/1024px-ChatGPT-Logo.svg.png"
              alt="ChatGPT Logo"
              className="w-full h-full object-contain"
            />
          )}
        </a>
        <button
          onClick={handleCopy}
          title="Copy Prompt"
          className="w-11 h-11 p-1.5 flex items-center justify-center rounded-lg bg-gray-200 shadow-md hover:shadow-lg active:shadow-inner transition-all duration-200"
        >
          {isCopied ? (
            <CheckIcon className="w-full h-full text-green-500" />
          ) : (
            <CopyIcon className="w-full h-full text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
};

const Preview = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div onClick={toggleExpand}>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg overflow-hidden cursor-pointer">
        <div className="p-4">
          <div className="relative">
            <pre 
              className={`text-xs text-gray-600 whitespace-pre-wrap break-words bg-gray-50 p-3 rounded-lg transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[25rem] overflow-y-auto' : 'max-h-24 overflow-y-hidden'}`}
            >
              {content}
            </pre>
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none rounded-b-lg"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP ---
const App = () => {
  const {
    ticker,
    setTicker,
    displayType,
    setDisplayType,
    isLoading,
    error,
    generatedSimpleContent,
    generatedDetailContent,
    generateAnalysis,
    generatedForTicker,
  } = useStockAnalysisGenerator();

  const isTickerPresent = ticker.trim().length > 0;
  const contentToDisplay = displayType === 'simple' ? generatedSimpleContent : generatedDetailContent;

  return (
    <main className="min-h-screen bg-[#f8f9fa] from-[#f8f9fa] via-[#e9ecef] to-[#f8f9fa] bg-gradient-to-br font-sans text-gray-800">
      <div className="container mx-auto px-2 py-8">
        <Header isTickerPresent={isTickerPresent} />

        <div className="md:flex md:gap-8">
          
          {/* --- LEFT COLUMN --- */}
          <div className="md:w-fit md:flex-shrink-0">
            <div className="max-w-md mx-auto md:max-w-none md:mx-0 mb-8">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <InputForm
                        ticker={ticker}
                        setTicker={setTicker}
                        isLoading={isLoading}
                        onSubmit={generateAnalysis}
                    />
                    <ErrorMessage message={error} />
                </div>
            </div>

            {contentToDisplay && !error && (
              <div className="mb-8 md:mb-0">
                <SuccessDisplay 
                  ticker={generatedForTicker} 
                  content={contentToDisplay}
                  displayType={displayType}
                  onDisplayTypeChange={setDisplayType}
                />
              </div>
            )}
          </div>
          
          {/* --- RIGHT COLUMN --- */}
          {contentToDisplay && !error && (
            <div className="md:flex-1 min-w-0">
              <div className="mb-8">
                <Preview content={contentToDisplay} />
              </div>
              <div className="space-y-8">
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

// --- RENDER ---
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);